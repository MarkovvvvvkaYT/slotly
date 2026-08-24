create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,48}$'),
  eyebrow text not null default 'Личный профиль специалиста',
  description text not null default 'Расскажите клиентам, чем вы можете помочь.',
  address text not null default '',
  phone text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  price_label text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  unique (profile_id, weekday),
  check (end_time > start_time),
  check ((break_start is null and break_end is null) or (break_start < break_end and break_start >= start_time and break_end <= end_time))
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('VE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  service_name text not null,
  date date not null,
  time time not null,
  client_name text not null check (char_length(client_name) between 2 and 80),
  phone text not null check (char_length(phone) between 9 and 32),
  comment text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index bookings_active_slot_idx on public.bookings(profile_id, date, time) where status <> 'cancelled';
create index bookings_profile_date_idx on public.bookings(profile_id, date);
create index services_profile_idx on public.services(profile_id, active);

create schema if not exists private;
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_slug text := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'slug', ''), '[^a-z0-9-]+', '-', 'g'));
  safe_slug text := trim(both '-' from requested_slug);
begin
  if char_length(safe_slug) < 3 then safe_slug := 'profile-' || substr(new.id::text, 1, 8); end if;
  insert into public.profiles (user_id, name, slug)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'Новый специалист'), safe_slug);
  insert into public.availability_rules (profile_id, weekday, start_time, end_time, break_start, break_end)
  select id, weekday, start_time::time, end_time::time, break_start::time, break_end::time
  from public.profiles, (values
    (1, '10:00', '19:00', '14:00', '15:00'),
    (2, '10:00', '19:00', '14:00', '15:00'),
    (3, '10:00', '19:00', '14:00', '15:00'),
    (4, '10:00', '19:00', '14:00', '15:00'),
    (5, '10:00', '19:00', '14:00', '15:00')
  ) as defaults(weekday, start_time, end_time, break_start, break_end)
  where user_id = new.id;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;

create policy "published profiles are public" on public.profiles for select to anon, authenticated using (is_published = true);
create policy "owners read their profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "owners update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "published services are public" on public.services for select to anon, authenticated using (active = true and exists (select 1 from public.profiles p where p.id = profile_id and p.is_published = true));
create policy "owners manage their services" on public.services for all to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid())));

create policy "published availability is public" on public.availability_rules for select to anon, authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.is_published = true));
create policy "owners manage availability" on public.availability_rules for all to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid())));

create policy "clients create bookings" on public.bookings for insert to anon, authenticated with check (
  status = 'new'
  and exists (select 1 from public.profiles p where p.id = profile_id and p.is_published = true)
  and exists (select 1 from public.services s where s.id = service_id and s.profile_id = bookings.profile_id and s.active = true)
);
create policy "owners read their bookings" on public.bookings for select to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid())));
create policy "owners update their bookings" on public.bookings for update to authenticated using (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid()))) with check (exists (select 1 from public.profiles p where p.id = profile_id and p.user_id = (select auth.uid())));

grant select on public.profiles, public.services, public.availability_rules to anon, authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, update, insert, delete on public.profiles, public.services, public.availability_rules, public.bookings to authenticated;
