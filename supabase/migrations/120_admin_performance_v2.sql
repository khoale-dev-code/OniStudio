-- 120_admin_performance_v2.sql
-- Oni Studio admin performance V2.
-- Safe to run more than once.
-- Run after migrations 100, 110, 111 and 112.

begin;

-- Admin list pages sort without filtering by published, so give them dedicated
-- order indexes instead of relying only on the public-facing partial indexes.
create index if not exists backdrops_admin_sort_order_idx
  on public.backdrops (sort_order, id);

create index if not exists props_admin_sort_order_idx
  on public.props (sort_order, id);

-- Matches the admin equipment list:
--   WHERE category <> 'backdrop'
--   ORDER BY rental_source, sort_order, name
create index if not exists equipment_admin_catalog_order_idx
  on public.equipment (rental_source, sort_order, name, id)
  where category <> 'backdrop';

-- Save a complete backdrop/prop order in one PostgreSQL statement instead of
-- one HTTP update per row.
create or replace function public.reorder_rental_assets(
  p_asset_type text,
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
  v_unique integer;
begin
  if not public.is_admin() then
    raise exception 'Admin permission required';
  end if;

  if p_asset_type not in ('backdrop', 'prop') then
    raise exception 'Invalid rental asset type';
  end if;

  v_expected := coalesce(cardinality(p_ids), 0);

  if v_expected = 0 then
    raise exception 'Rental asset order cannot be empty';
  end if;

  if v_expected > 500 then
    raise exception 'Too many rental assets';
  end if;

  select count(distinct value)
  into v_unique
  from unnest(coalesce(p_ids, array[]::uuid[])) as ids(value);

  if v_unique <> v_expected then
    raise exception 'Rental asset order contains duplicate IDs';
  end if;

  if p_asset_type = 'backdrop' then
    select count(*)
    into v_found
    from public.backdrops
    where id = any(coalesce(p_ids, array[]::uuid[]));

    if v_found <> v_expected then
      raise exception 'Backdrop order contains unknown IDs';
    end if;

    update public.backdrops as target
    set
      sort_order = source_order.ordinality - 1,
      updated_at = now()
    from unnest(coalesce(p_ids, array[]::uuid[]))
      with ordinality as source_order(id, ordinality)
    where target.id = source_order.id;
  else
    select count(*)
    into v_found
    from public.props
    where id = any(coalesce(p_ids, array[]::uuid[]));

    if v_found <> v_expected then
      raise exception 'Prop order contains unknown IDs';
    end if;

    update public.props as target
    set
      sort_order = source_order.ordinality - 1,
      updated_at = now()
    from unnest(coalesce(p_ids, array[]::uuid[]))
      with ordinality as source_order(id, ordinality)
    where target.id = source_order.id;
  end if;
end;
$$;

revoke all on function public.reorder_rental_assets(text, uuid[]) from public;
grant execute on function public.reorder_rental_assets(text, uuid[]) to authenticated;

analyze public.equipment;
analyze public.backdrops;
analyze public.props;

notify pgrst, 'reload schema';

commit;
