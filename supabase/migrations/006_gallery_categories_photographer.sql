-- Oni Studio gallery categories + photographer fields.
-- This migration is designed to run after the gallery album migration.
-- It is safe to run once in Supabase SQL Editor.

begin;

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

insert into public.gallery_categories (slug, name, sort_order)
values
  ('fashion', '{"vi":"Thời trang","en":"Fashion"}'::jsonb, 0),
  ('portrait', '{"vi":"Chân dung","en":"Portrait"}'::jsonb, 1),
  ('product', '{"vi":"Sản phẩm","en":"Product"}'::jsonb, 2),
  ('commercial', '{"vi":"Thương mại","en":"Commercial"}'::jsonb, 3),
  ('bts', '{"vi":"Hậu trường","en":"Behind the scenes"}'::jsonb, 4)
on conflict (slug) do nothing;

alter table public.gallery
  add column if not exists photographer_name text;

alter table public.gallery
  add column if not exists photographer_facebook_url text;

alter table public.gallery
  add column if not exists photographer_instagram_url text;

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

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'gallery_categories_updated'
      and tgrelid = 'public.gallery_categories'::regclass
  ) then
    create trigger gallery_categories_updated
      before update on public.gallery_categories
      for each row
      execute function public.touch_updated_at();
  end if;
end
$$;

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

commit;
