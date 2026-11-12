-- Our Home: one-time setup for Supabase.
-- Paste everything into Supabase → SQL Editor → New query, then press Run.
-- Safe to run again: it skips anything that already exists.

-- 1. Tables ---------------------------------------------------------------
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text,
  code text unique not null default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- every record of the app is one row: (collection, id) -> json
create table if not exists public.items (
  household_id uuid not null references public.households(id) on delete cascade,
  coll text not null,
  id text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (household_id, coll, id)
);
create index if not exists items_changes on public.items (household_id, updated_at);

-- the server decides the time of every change (phones' clocks can be wrong)
create or replace function public.touch_item() returns trigger language plpgsql as $$
begin new.updated_at := clock_timestamp(); new.updated_by := auth.uid(); return new; end $$;
drop trigger if exists items_touch on public.items;
create trigger items_touch before insert or update on public.items for each row execute function public.touch_item();

-- 2. Privacy: only members of a household can see or change its data ---------
create or replace function public.is_member(hh uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where household_id = hh and user_id = auth.uid())
$$;

alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.items enable row level security;

-- the app (signed-in users only) may reach these tables; the rules below still limit them to their own household
grant usage on schema public to authenticated;
grant select on public.households, public.members to authenticated;
grant select, insert, update, delete on public.items to authenticated;
revoke all on public.households, public.members, public.items from anon;

drop policy if exists "members read household" on public.households;
create policy "members read household" on public.households for select to authenticated using (public.is_member(id));

drop policy if exists "members read members" on public.members;
create policy "members read members" on public.members for select to authenticated using (public.is_member(household_id));

drop policy if exists "members use items" on public.items;
create policy "members use items" on public.items for all to authenticated
  using (public.is_member(household_id)) with check (public.is_member(household_id));

-- 3. Start or join a household (the only way to become a member) -------------
create or replace function public.create_household(hh_name text) returns setof public.households
language plpgsql security definer set search_path = public as $$
declare h public.households;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  insert into public.households(name) values (coalesce(nullif(hh_name, ''), 'Our home')) returning * into h;
  insert into public.members(household_id, user_id) values (h.id, auth.uid());
  return next h;
end $$;

create or replace function public.join_household(hh_code text) returns setof public.households
language plpgsql security definer set search_path = public as $$
declare h public.households;
begin
  if auth.uid() is null then raise exception 'Please sign in first'; end if;
  select * into h from public.households where code = upper(trim(hh_code));
  if not found then raise exception 'No household with that code'; end if;
  if (select count(*) from public.members where household_id = h.id) >= 8 and not public.is_member(h.id) then
    raise exception 'This household is full'; end if;
  insert into public.members(household_id, user_id) values (h.id, auth.uid()) on conflict do nothing;
  return next h;
end $$;

revoke all on function public.create_household(text) from public, anon;
revoke all on function public.join_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;
grant execute on function public.join_household(text) to authenticated;
grant execute on function public.is_member(uuid) to authenticated;

-- 4. Live updates between phones ------------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null; end $$;

-- 5. Private photo storage (one folder per household) ----------------------
insert into storage.buckets (id, name, public) values ('photos', 'photos', false) on conflict (id) do nothing;

drop policy if exists "household photos read" on storage.objects;
create policy "household photos read" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.is_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "household photos add" on storage.objects;
create policy "household photos add" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "household photos change" on storage.objects;
create policy "household photos change" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.is_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "household photos delete" on storage.objects;
create policy "household photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_member(((storage.foldername(name))[1])::uuid));

select 'Our Home setup done ✔' as result;
