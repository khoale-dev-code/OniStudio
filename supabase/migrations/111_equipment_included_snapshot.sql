-- 111_equipment_included_snapshot.sql
-- Stores a public-safe name snapshot for equipment selected as included items.
-- This avoids losing accessory names on the public catalogue when the accessory
-- itself is unpublished or hidden by RLS.

begin;

alter table public.equipment
  add column if not exists included_equipment_items jsonb
  not null default '[]'::jsonb;

comment on column public.equipment.included_equipment_items is
  'Snapshot of selected included equipment names: [{id,name,name_en}]. Used by public cards even when referenced items are unpublished.';

-- Backfill existing external-rental rows from included_equipment_ids.
update public.equipment as parent
set included_equipment_items = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'id', child.id,
        'name', child.name,
        'name_en', child.name_en
      )
      order by picked.ordinality
    )
    from unnest(
      coalesce(parent.included_equipment_ids, array[]::uuid[])
    ) with ordinality as picked(id, ordinality)
    join public.equipment as child
      on child.id = picked.id
  ),
  '[]'::jsonb
)
where parent.rental_source = 'external';

commit;
