-- 112_equipment_admin_ordering.sql
-- Adds accurate future "newly added" tracking and atomic per-source ordering.

begin;

alter table public.equipment
  add column if not exists created_at timestamptz;

-- Important: set the default AFTER adding the nullable column so existing rows
-- are not incorrectly marked as newly added on migration day.
alter table public.equipment
  alter column created_at set default now();

create index if not exists equipment_source_sort_order_idx
  on public.equipment (rental_source, sort_order, id)
  where category <> 'backdrop';

create index if not exists equipment_created_at_idx
  on public.equipment (created_at desc)
  where category <> 'backdrop';

create or replace function public.reorder_equipment(
  p_source text,
  p_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected integer;
  v_found integer;
begin
  if not public.is_admin() then
    raise exception 'Admin permission required';
  end if;

  if p_source not in ('internal', 'external') then
    raise exception 'Invalid equipment source';
  end if;

  v_expected := coalesce(cardinality(p_ids), 0);

  if v_expected > 500 then
    raise exception 'Too many equipment items';
  end if;

  select count(*)
  into v_found
  from public.equipment
  where id = any(coalesce(p_ids, array[]::uuid[]))
    and category <> 'backdrop'
    and coalesce(rental_source, 'internal') = p_source;

  if v_found <> v_expected then
    raise exception 'Equipment order contains invalid or duplicate items';
  end if;

  update public.equipment as equipment_row
  set
    sort_order = source_order.ordinality - 1,
    updated_at = now()
  from unnest(coalesce(p_ids, array[]::uuid[]))
    with ordinality as source_order(id, ordinality)
  where equipment_row.id = source_order.id
    and equipment_row.category <> 'backdrop'
    and coalesce(equipment_row.rental_source, 'internal') = p_source;
end;
$$;

revoke all on function public.reorder_equipment(text, uuid[]) from public;
grant execute on function public.reorder_equipment(text, uuid[]) to authenticated;

commit;
