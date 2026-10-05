-- Oni Studio admin performance indexes.
-- Run after migration 008. Safe to run more than once.

begin;

-- Admin lists order by sort_order without filtering by published.
create index if not exists equipment_admin_sort_order_idx
  on public.equipment (sort_order, id);

create index if not exists studios_admin_sort_order_idx
  on public.studios (sort_order, id);

create index if not exists gallery_admin_sort_order_idx
  on public.gallery (sort_order, id);

create index if not exists equipment_categories_admin_order_idx
  on public.equipment_categories (sort_order, id);

-- Equipment detail/admin inventory query: WHERE equipment_id = ? ORDER BY sort_order.
create index if not exists equipment_units_equipment_sort_idx
  on public.equipment_units (equipment_id, sort_order, id);

-- PostgreSQL does not automatically index the referencing side of a foreign key.
-- This helps category updates/deletes and gallery filtering as the library grows.
create index if not exists gallery_category_lookup_idx
  on public.gallery (category);

analyze public.equipment;
analyze public.studios;
analyze public.gallery;
analyze public.equipment_categories;
analyze public.equipment_units;

commit;
