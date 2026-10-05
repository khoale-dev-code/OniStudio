-- Oni Studio - Fix dynamic gallery categories
-- Root cause: the original gallery table had a CHECK constraint that only allowed
-- fashion / portrait / product / commercial / bts.
-- This migration removes that legacy restriction and keeps gallery_categories
-- as the source of truth through a foreign key.

begin;

-- 1) Remove the original known CHECK constraint name.
alter table public.gallery
  drop constraint if exists gallery_category_check;

-- 2) Defensive cleanup: remove any remaining legacy CHECK constraint on
-- public.gallery.category that still contains the old fixed category list.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select
      c.conname,
      pg_get_constraintdef(c.oid) as definition
    from pg_constraint c
    where c.conrelid = 'public.gallery'::regclass
      and c.contype = 'c'
  loop
    if constraint_row.definition ilike '%category%'
       and (
         constraint_row.definition ilike '%fashion%'
         or constraint_row.definition ilike '%portrait%'
         or constraint_row.definition ilike '%product%'
         or constraint_row.definition ilike '%commercial%'
         or constraint_row.definition ilike '%bts%'
       ) then
      execute format(
        'alter table public.gallery drop constraint %I',
        constraint_row.conname
      );
    end if;
  end loop;
end
$$;

-- 3) Make sure every category currently used by gallery already exists in the
-- category table before the FK is enforced.
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

-- 4) Ensure the dynamic category foreign key exists.
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

-- 5) Refresh PostgREST schema cache.
notify pgrst, 'reload schema';

commit;

-- Verification A: gallery.category should now be controlled by a FOREIGN KEY,
-- not by the old fixed CHECK list.
select
  c.conname,
  c.contype,
  pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = 'public.gallery'::regclass
  and (
    pg_get_constraintdef(c.oid) ilike '%category%'
    or c.conname = 'gallery_category_slug_fkey'
  )
order by c.contype, c.conname;

-- Verification B: categories currently available to the admin select.
select
  slug,
  name,
  sort_order
from public.gallery_categories
order by sort_order, slug;
