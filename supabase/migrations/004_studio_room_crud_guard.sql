-- Oni Studio: protect the minimum-one-room business rule.
-- Run after 003_admin_categories_inventory.sql.
begin;

create or replace function public.prevent_last_studio_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  studio_count bigint;
begin
  select count(*) into studio_count from public.studios;
  if studio_count <= 1 then
    raise exception using
      errcode = 'P0001',
      message = 'at_least_one_studio_required';
  end if;
  return old;
end;
$$;

revoke all on function public.prevent_last_studio_delete() from public;

drop trigger if exists protect_last_studio_delete on public.studios;
create trigger protect_last_studio_delete
before delete on public.studios
for each row
execute function public.prevent_last_studio_delete();

commit;
