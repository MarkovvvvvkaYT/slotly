create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  eyebrow text not null default '',
  description text not null default '',
  address text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  duration_minutes integer not null check (duration_minutes between 15 and 480),
  price_label text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  check (end_time > start_time),
  check ((break_start is null and break_end is null) or (break_start < break_end and break_start >= start_time and break_end <= end_time))
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('VE-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0')),
  service_id uuid not null references public.services(id),
  service_name text not null,
  date date not null,
  time time not null,
  client_name text not null,
  phone text not null,
  comment text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index if not exists bookings_active_slot_idx on public.bookings(date, time) where status <> 'cancelled';
create index if not exists bookings_date_idx on public.bookings(date);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability_rules enable row level security;
alter table public.bookings enable row level security;

create policy "public can read profiles" on public.profiles for select to anon, authenticated using (true);
create policy "public can read active services" on public.services for select to anon, authenticated using (active = true);
create policy "public can read availability" on public.availability_rules for select to anon, authenticated using (true);

-- Booking writes and all admin reads are server-side with the service role key.
revoke all on public.bookings from anon, authenticated;
