-- Oni Studio admin categories + per-unit inventory.
-- Run after 001_initial.sql and 002_equipment_images.sql.
-- Safe to run more than once.

begin;

create table if not exists public.equipment_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name jsonb not null check (name ?& array['vi','en']),
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  updated_at timestamptz not null default now()
);

insert into public.equipment_categories (slug, name, sort_order) values
  ('continuous', '{"vi":"Đèn LED","en":"Continuous light"}'::jsonb, 0),
  ('flash', '{"vi":"Đèn flash","en":"Flash"}'::jsonb, 1),
  ('modifier', '{"vi":"Tạo hình ánh sáng","en":"Light modifiers"}'::jsonb, 2),
  ('support', '{"vi":"Phụ kiện","en":"Support"}'::jsonb, 3),
  ('backdrop', '{"vi":"Phông nền","en":"Backdrops"}'::jsonb, 4)
on conflict (slug) do nothing;

alter table public.equipment
  drop constraint if exists equipment_category_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'equipment_category_fkey_v3'
      and conrelid = 'public.equipment'::regclass
  ) then
    alter table public.equipment
      add constraint equipment_category_fkey_v3
      foreign key (category)
      references public.equipment_categories(slug)
      on update cascade
      on delete restrict;
  end if;
end
$$;

create table if not exists public.equipment_units (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  status text not null default 'available'
    check (status in ('available','rented','maintenance','unavailable')),
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  updated_at timestamptz not null default now(),
  unique (equipment_id, label)
);

create index if not exists equipment_units_equipment_id_idx
  on public.equipment_units(equipment_id);

alter table public.equipment_categories enable row level security;
alter table public.equipment_units enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'equipment_categories'
      and policyname = 'Public reads equipment categories'
  ) then
    create policy "Public reads equipment categories"
      on public.equipment_categories
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'equipment_categories'
      and policyname = 'Admins manage equipment categories'
  ) then
    create policy "Admins manage equipment categories"
      on public.equipment_categories
      for all
      to authenticated
      using ((select public.is_admin()))
      with check ((select public.is_admin()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'equipment_units'
      and policyname = 'Public reads units of published equipment'
  ) then
    create policy "Public reads units of published equipment"
      on public.equipment_units
      for select
      to anon, authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.equipment
          where public.equipment.id = equipment_units.equipment_id
            and public.equipment.published = true
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'equipment_units'
      and policyname = 'Admins manage equipment units'
  ) then
    create policy "Admins manage equipment units"
      on public.equipment_units
      for all
      to authenticated
      using ((select public.is_admin()))
      with check ((select public.is_admin()));
  end if;
end
$$;

grant select on public.equipment_categories, public.equipment_units to anon;
grant select, insert, update, delete
  on public.equipment_categories, public.equipment_units
  to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'equipment_categories_updated'
      and tgrelid = 'public.equipment_categories'::regclass
  ) then
    create trigger equipment_categories_updated
      before update on public.equipment_categories
      for each row execute function public.touch_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'equipment_units_updated'
      and tgrelid = 'public.equipment_units'::regclass
  ) then
    create trigger equipment_units_updated
      before update on public.equipment_units
      for each row execute function public.touch_updated_at();
  end if;
end
$$;

commit;
