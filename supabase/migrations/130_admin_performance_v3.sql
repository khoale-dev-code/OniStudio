-- 130_admin_performance_v3.sql
-- Lightweight admin list projections for image-heavy catalog tables.
-- Run after 120_admin_performance_v2.sql.
-- Safe to run more than once.

begin;

-- The admin list only needs the cover URL + image count. Keeping image_count
-- in PostgreSQL lets PostgREST avoid transferring every Cloudinary URL just
-- to display "N ảnh".
alter table public.gallery
  add column if not exists image_count integer
  generated always as (cardinality(images)) stored;

alter table public.backdrops
  add column if not exists image_count integer
  generated always as (cardinality(images)) stored;

alter table public.props
  add column if not exists image_count integer
  generated always as (cardinality(images)) stored;

analyze public.gallery;
analyze public.backdrops;
analyze public.props;
analyze public.studios;
analyze public.equipment;

notify pgrst, 'reload schema';

commit;
