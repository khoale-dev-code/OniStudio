-- Additive migration: preserves accounts, prices and existing photos.
-- Run after 001_initial.sql. Safe to run more than once.
begin;
alter table public.equipment add column if not exists images text[] not null default '{}';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'equipment_images_limit' and conrelid = 'public.equipment'::regclass) then
    alter table public.equipment add constraint equipment_images_limit check (cardinality(images) <= 12);
  end if;
end $$;
update public.equipment set images = array[image_url]
where cardinality(images) = 0 and nullif(image_url, '') is not null;
-- Keep the original single-photo field compatible with older integrations.
create or replace function public.sync_equipment_cover() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' and NEW.images is not distinct from OLD.images and NEW.image_url is distinct from OLD.image_url then
    NEW.images := case when NEW.image_url is null or NEW.image_url = '' then '{}'::text[] else array[NEW.image_url] || array_remove(OLD.images, OLD.image_url) end;
  elsif TG_OP = 'INSERT' and cardinality(NEW.images) = 0 and nullif(NEW.image_url, '') is not null then
    NEW.images := array[NEW.image_url];
  end if;
  NEW.image_url := NEW.images[1];
  return NEW;
end;
$$;
drop trigger if exists equipment_cover_sync on public.equipment;
create trigger equipment_cover_sync before insert or update on public.equipment
for each row execute function public.sync_equipment_cover();
notify pgrst, 'reload schema';
commit;
