-- Oni Studio: external equipment rental + included accessory bundles.
-- Run after the current equipment migrations.
-- Non-destructive: existing equipment is backfilled as "internal".
-- The old equipment_units table is intentionally preserved for rollback/history,
-- but the new UI no longer reads or manages per-unit inventory.

begin;

alter table public.equipment
  add column if not exists rental_source text;

update public.equipment
set rental_source = 'internal'
where rental_source is null
   or rental_source not in ('internal', 'external');

alter table public.equipment
  alter column rental_source set default 'internal';

alter table public.equipment
  alter column rental_source set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'equipment_rental_source_check_v110'
      and conrelid = 'public.equipment'::regclass
  ) then
    alter table public.equipment
      add constraint equipment_rental_source_check_v110
      check (rental_source in ('internal', 'external'));
  end if;
end
$$;

alter table public.equipment
  add column if not exists included_equipment_ids uuid[];

update public.equipment
set included_equipment_ids = '{}'::uuid[]
where included_equipment_ids is null;

alter table public.equipment
  alter column included_equipment_ids set default '{}'::uuid[];

alter table public.equipment
  alter column included_equipment_ids set not null;

-- Prevent accidental self-reference in existing data.
update public.equipment
set included_equipment_ids = array_remove(included_equipment_ids, id)
where id = any(included_equipment_ids);

create index if not exists equipment_public_source_sort_v110_idx
  on public.equipment (published, rental_source, sort_order);

create index if not exists equipment_included_ids_v110_idx
  on public.equipment using gin (included_equipment_ids);

notify pgrst, 'reload schema';

commit;
