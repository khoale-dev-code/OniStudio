-- Oni Studio - Gallery schema repair
-- Run this file ONCE in Supabase SQL Editor.
-- Safe to re-run: CREATE/ALTER/INSERT operations are idempotent where possible.

begin;

-- 1) Gallery categories table
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null
    check (name ?& array['vi','en']),
  sort_order integer not null default 0
    check (sort_order between 0 and 100000),
  updated_at timestamptz not null default now()
);

-- Built-in categories.
insert into public.gallery_categories (slug, name, sort_order)
values
  ('fashion', '{"vi":"Thời trang","en":"Fashion"}'::jsonb, 0),
  ('portrait', '{"vi":"Chân dung","en":"Portrait"}'::jsonb, 1),
  ('product', '{"vi":"Sản phẩm","en":"Product"}'::jsonb, 2),
  ('commercial', '{"vi":"Thương mại","en":"Commercial"}'::jsonb, 3),
  ('bts', '{"vi":"Hậu trường","en":"Behind the scenes"}'::jsonb, 4)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = least(public.gallery_categories.sort_order, excluded.sort_order);

-- Preserve any existing gallery category slugs before adding the FK.
insert into public.gallery_categories (slug, name, sort_order)
select
  g.category,
  jsonb_build_object(
    'vi', initcap(replace(g.category, '-', ' ')),
    'en', initcap(replace(g.category, '-', ' '))
  ),
  1000
from public.gallery g
where g.category is not null
  and btrim(g.category) <> ''
  and g.category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  and not exists (
    select 1
    from public.gallery_categories c
    where c.slug = g.category
  )
group by g.category;

-- 2) Album fields from migration 005.
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

-- 3) Photographer fields from migration 006.
alter table public.gallery
  add column if not exists photographer_name text;

alter table public.gallery
  add column if not exists photographer_facebook_url text;

alter table public.gallery
  add column if not exists photographer_instagram_url text;

-- Convert old one-image rows into one-image albums.
update public.gallery
set images = array[image_url]
where cardinality(images) = 0
  and image_url is not null
  and btrim(image_url) <> '';

-- 4) Category relationship.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_category_slug_fkey'
      and conrelid = 'public.gallery'::regclass
  ) then
    alter table public.gallery
      add constraint gallery_category_slug_fkey
      foreign key (category)
      references public.gallery_categories(slug)
      on update cascade
      on delete restrict;
  end if;
end
$$;

-- 5) RLS / permissions.
alter table public.gallery_categories enable row level security;

drop policy if exists "Public gallery categories" on public.gallery_categories;
create policy "Public gallery categories"
  on public.gallery_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage gallery categories" on public.gallery_categories;
create policy "Admins manage gallery categories"
  on public.gallery_categories
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.gallery_categories to anon;
grant select, insert, update, delete on public.gallery_categories to authenticated;

create index if not exists gallery_categories_order
  on public.gallery_categories (sort_order, slug);

-- Ask Supabase PostgREST to immediately reload the new columns/tables.
notify pgrst, 'reload schema';

commit;

-- Verification: this result should show all expected columns as present.
select
  c.column_name,
  c.data_type,
  c.is_nullable
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'gallery'
  and c.column_name in (
    'description',
    'images',
    'facebook_url',
    'instagram_url',
    'oni_production',
    'oni_lighting',
    'shot_at_oni',
    'photographer_name',
    'photographer_facebook_url',
    'photographer_instagram_url'
  )
order by c.column_name;

select
  slug,
  name,
  sort_order
from public.gallery_categories
order by sort_order, slug;
