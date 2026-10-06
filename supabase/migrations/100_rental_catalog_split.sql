begin;
create table if not exists public.backdrops (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (char_length(name) between 1 and 160),
 name_en text not null check (char_length(name_en) between 1 and 160),
 kind text not null default 'color' check (kind in ('color','effect')),
 description jsonb not null default '{"vi":"","en":""}'::jsonb check (description ?& array['vi','en']),
 price bigint check (price >= 0 and price <= 1000000000),
 included boolean not null default false,
 image_url text,
 images text[] not null default '{}' check (cardinality(images) <= 12),
 published boolean not null default true,
 sort_order integer not null default 0 check (sort_order between 0 and 100000),
 updated_at timestamptz not null default now()
);
create table if not exists public.props (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (char_length(name) between 1 and 160),
 name_en text not null check (char_length(name_en) between 1 and 160),
 description jsonb not null default '{"vi":"","en":""}'::jsonb check (description ?& array['vi','en']),
 price bigint check (price >= 0 and price <= 1000000000),
 included boolean not null default false,
 image_url text,
 images text[] not null default '{}' check (cardinality(images) <= 12),
 published boolean not null default true,
 sort_order integer not null default 0 check (sort_order between 0 and 100000),
 updated_at timestamptz not null default now()
);
insert into public.backdrops (slug,name,name_en,kind,description,price,included,image_url,images,published,sort_order)
select e.slug,e.name,e.name_en,'color',e.description,e.price,e.included,e.image_url,coalesce(e.images,case when e.image_url is not null then array[e.image_url] else '{}'::text[] end),e.published,e.sort_order
from public.equipment e where e.category='backdrop' on conflict (slug) do nothing;
update public.equipment set published=false, featured=false where category='backdrop' and (published=true or featured=true);
create index if not exists backdrops_public_kind_order_idx on public.backdrops (published,kind,sort_order);
create index if not exists props_public_order_idx on public.props (published,sort_order);
alter table public.backdrops enable row level security;
alter table public.props enable row level security;
do $$ begin
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='backdrops' and policyname='Published backdrops or admin') then create policy "Published backdrops or admin" on public.backdrops for select to anon,authenticated using (published or (select public.is_admin())); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='backdrops' and policyname='Admins manage backdrops') then create policy "Admins manage backdrops" on public.backdrops for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin())); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='props' and policyname='Published props or admin') then create policy "Published props or admin" on public.props for select to anon,authenticated using (published or (select public.is_admin())); end if;
 if not exists (select 1 from pg_policies where schemaname='public' and tablename='props' and policyname='Admins manage props') then create policy "Admins manage props" on public.props for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin())); end if;
end $$;
grant select on public.backdrops,public.props to anon;
grant select,insert,update,delete on public.backdrops,public.props to authenticated;
do $$ begin
 if not exists (select 1 from pg_trigger where tgname='backdrops_updated' and tgrelid='public.backdrops'::regclass) then create trigger backdrops_updated before update on public.backdrops for each row execute function public.touch_updated_at(); end if;
 if not exists (select 1 from pg_trigger where tgname='props_updated' and tgrelid='public.props'::regclass) then create trigger props_updated before update on public.props for each row execute function public.touch_updated_at(); end if;
end $$;
notify pgrst, 'reload schema';
commit;
select 'backdrops' as table_name,count(*) as rows from public.backdrops union all select 'props',count(*) from public.props;
