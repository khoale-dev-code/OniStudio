-- 141_gallery_pinterest_repair.sql
-- Repair the image-stream save RPC used by Gallery Pinterest V1.
-- Safe to run more than once.
-- This version does an incremental sync instead of DELETE ALL + INSERT ALL.

begin;

create or replace function public.replace_gallery_photos(p_urls text[])
returns void
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  clean_urls text[];
  url_count integer;
begin
  if not public.is_admin() then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select coalesce(array_agg(value order by first_pos), '{}'::text[])
  into clean_urls
  from (
    select btrim(value) as value, min(ord) as first_pos
    from unnest(coalesce(p_urls, '{}'::text[]))
      with ordinality as x(value, ord)
    where value is not null
      and btrim(value) <> ''
      and btrim(value) ~ '^https://res\.cloudinary\.com/'
    group by btrim(value)
  ) deduped;

  url_count := cardinality(clean_urls);

  if url_count > 120 then
    raise exception 'gallery_photo_limit' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('oni_gallery_photos_replace'));

  -- Empty array means intentionally clear the gallery.
  if url_count = 0 then
    delete from public.gallery_photos;
    return;
  end if;

  -- Upsert current URLs and their requested positions.
  insert into public.gallery_photos (image_url, sort_order)
  select value, ordinality - 1
  from unnest(clean_urls) with ordinality as x(value, ordinality)
  on conflict (image_url)
  do update
    set sort_order = excluded.sort_order;

  -- Remove URLs that the admin removed from the manager.
  delete from public.gallery_photos gp
  where not (gp.image_url = any(clean_urls));
end;
$$;

revoke all on function public.replace_gallery_photos(text[]) from public;
grant execute on function public.replace_gallery_photos(text[]) to authenticated;

analyze public.gallery_photos;
notify pgrst, 'reload schema';

commit;
