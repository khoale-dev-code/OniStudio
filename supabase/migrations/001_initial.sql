-- Oni Studio: execute once in the Supabase SQL editor, before seed.sql.
-- No service-role key is needed by the website.
begin;
create table public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy "Admins read own membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.admin_users where user_id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.studios (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (char_length(name) between 1 and 160),
 description jsonb not null check (description ?& array['vi','en']),
 area integer not null check (area > 0 and area <= 100000),
 capacity integer not null check (capacity > 0 and capacity <= 10000),
 price bigint not null check (price >= 0 and price <= 1000000000),
 led_count integer not null default 1 check (led_count between 0 and 100),
 images text[] not null default '{}' check (cardinality(images) <= 12),
 published boolean not null default true,
 sort_order integer not null default 0 check (sort_order between 0 and 100000),
 updated_at timestamptz not null default now()
);
create table public.equipment (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (char_length(name) between 1 and 160),
 name_en text not null check (char_length(name_en) between 1 and 160),
 category text not null check (category in ('continuous','flash','modifier','support','backdrop')),
 description jsonb not null check (description ?& array['vi','en']),
 specifications jsonb not null check (specifications ?& array['vi','en']),
 price bigint check (price >= 0 and price <= 1000000000),
 unit jsonb not null check (unit ?& array['vi','en']),
 included boolean not null default false,
 status text not null default 'contact' check (status in ('contact','available','maintenance','unavailable')),
 image_url text,
 featured boolean not null default false,
 published boolean not null default true,
 sort_order integer not null default 0 check (sort_order between 0 and 100000),
 updated_at timestamptz not null default now()
);
create table public.gallery (
 id uuid primary key default gen_random_uuid(),
 title jsonb not null check (title ?& array['vi','en']),
 category text not null check (category in ('fashion','portrait','product','commercial','bts')),
 image_url text not null,
 published boolean not null default true,
 sort_order integer not null default 0 check (sort_order between 0 and 100000),
 updated_at timestamptz not null default now()
);
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger equipment_updated before update on public.equipment for each row execute function public.touch_updated_at();
create trigger studios_updated before update on public.studios for each row execute function public.touch_updated_at();
create trigger gallery_updated before update on public.gallery for each row execute function public.touch_updated_at();

alter table public.equipment enable row level security;
alter table public.studios enable row level security;
alter table public.gallery enable row level security;
create policy "Published equipment or admin" on public.equipment for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Published studios or admin" on public.studios for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Published gallery or admin" on public.gallery for select to anon, authenticated using (published or (select public.is_admin()));
create policy "Admins manage equipment" on public.equipment for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage studios" on public.studios for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage gallery" on public.gallery for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.equipment, public.studios, public.gallery to anon;
grant select, insert, update, delete on public.equipment, public.studios, public.gallery to authenticated;
create index equipment_public_order on public.equipment (published, sort_order);
create index equipment_category on public.equipment (category);
create index studios_public_order on public.studios (published, sort_order);
create index gallery_public_category on public.gallery (published, category, sort_order);
commit;
