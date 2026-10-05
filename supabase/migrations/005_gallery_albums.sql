-- Oni Studio gallery albums.
-- Run once in Supabase SQL Editor after the previous migrations.
-- Existing gallery rows are preserved and become one-image albums.

begin;

alter table public.gallery
  add column if not exists description jsonb
  not null default '{"vi":"","en":""}'::jsonb;

alter table public.gallery
  add column if not exists images text[]
  not null default '{}';

alter table public.gallery
  add column if not exists facebook_url text;

alter table public.gallery
  add column if not exists instagram_url text;

alter table public.gallery
  add column if not exists oni_production boolean
  not null default false;

alter table public.gallery
  add column if not exists oni_lighting boolean
  not null default false;

alter table public.gallery
  add column if not exists shot_at_oni boolean
  not null default false;

update public.gallery
set images = array[image_url]
where cardinality(images) = 0
  and image_url is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_images_limit'
      and conrelid = 'public.gallery'::regclass
  ) then
    alter table public.gallery
      add constraint gallery_images_limit
      check (cardinality(images) between 1 and 24);
  end if;
end
$$;

commit;
