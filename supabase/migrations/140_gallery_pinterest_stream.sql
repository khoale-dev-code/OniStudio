-- 140_gallery_pinterest_stream.sql
-- Oni Studio - Simple image-only gallery stream.
-- Safe to run more than once.
-- Keeps the old gallery/album tables untouched and migrates their images once.

begin;

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null
    check (char_length(image_url) between 8 and 2048),
  sort_order integer not null default 0
    check (sort_order between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gallery_photos_image_url_unique
  on public.gallery_photos (image_url);

create index if not exists gallery_photos_sort_order
  on public.gallery_photos (sort_order, id);

-- Preserve existing gallery images on the first migration.
-- Album order is preserved first, then the image order inside each album.
do $$
begin
  if not exists (select 1 from public.gallery_photos limit 1) then
    insert into public.gallery_photos (image_url, sort_order)
    select
      migrated.image_url,
      row_number() over (
        order by migrated.album_order, migrated.image_order, migrated.image_url
      ) - 1
    from (
      select distinct on (legacy.image_url)
        legacy.image_url,
        legacy.album_order,
        legacy.image_order
      from (
        select
          u.url as image_url,
          coalesce(g.sort_order, 0) as album_order,
          u.ordinality as image_order
        from public.gallery g
        cross join lateral unnest(
          case
            when cardinality(coalesce(g.images, '{}'::text[])) > 0
              then g.images
            when g.image_url is not null and btrim(g.image_url) <> ''
              then array[g.image_url]
            else '{}'::text[]
          end
        ) with ordinality as u(url, ordinality)
        where u.url is not null
          and btrim(u.url) <> ''
      ) legacy
      order by
        legacy.image_url,
        legacy.album_order,
        legacy.image_order
    ) migrated;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'gallery_photos_updated'
      and tgrelid = 'public.gallery_photos'::regclass
  ) then
    create trigger gallery_photos_updated
      before update on public.gallery_photos
      for each row
      execute function public.touch_updated_at();
  end if;
end
$$;

alter table public.gallery_photos enable row level security;

drop policy if exists "Public gallery photos" on public.gallery_photos;
create policy "Public gallery photos"
  on public.gallery_photos
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage gallery photos" on public.gallery_photos;
create policy "Admins manage gallery photos"
  on public.gallery_photos
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.gallery_photos to anon;
grant select, insert, update, delete on public.gallery_photos to authenticated;

-- One atomic RPC is faster and safer than many reorder/update requests.
create or replace function public.replace_gallery_photos(p_urls text[])
returns void
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  clean_urls text[];
begin
  if not public.is_admin() then
    raise exception 'unauthorized';
  end if;

  select coalesce(array_agg(value order by first_pos), '{}'::text[])
  into clean_urls
  from (
    select value, min(ord) as first_pos
    from unnest(coalesce(p_urls, '{}'::text[])) with ordinality as x(value, ord)
    where value is not null
      and btrim(value) <> ''
      and value ~ '^https?://'
    group by value
  ) deduped;

  if cardinality(clean_urls) > 120 then
    raise exception 'gallery_photo_limit';
  end if;

  perform pg_advisory_xact_lock(hashtext('oni_gallery_photos_replace'));

  delete from public.gallery_photos;

  insert into public.gallery_photos (image_url, sort_order)
  select value, ordinality - 1
  from unnest(clean_urls) with ordinality as x(value, ordinality);
end;
$$;

revoke all on function public.replace_gallery_photos(text[]) from public;
grant execute on function public.replace_gallery_photos(text[]) to authenticated;

analyze public.gallery_photos;
notify pgrst, 'reload schema';

commit;
