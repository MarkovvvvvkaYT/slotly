create table if not exists public.telegram_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  telegram_user_id bigint not null,
  chat_id bigint not null,
  username text,
  display_name text,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists telegram_connections_active_profile_idx
  on public.telegram_connections(profile_id)
  where revoked_at is null;
create unique index if not exists telegram_connections_active_user_idx
  on public.telegram_connections(telegram_user_id)
  where revoked_at is null;
create unique index if not exists telegram_connections_active_chat_idx
  on public.telegram_connections(chat_id)
  where revoked_at is null;

create table if not exists public.telegram_link_challenges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists telegram_link_challenges_profile_idx
  on public.telegram_link_challenges(profile_id, created_at desc);

create table if not exists public.telegram_login_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  expires_at timestamptz not null,
  decided_at timestamptz,
  telegram_connection_id uuid references public.telegram_connections(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists telegram_login_challenges_user_idx
  on public.telegram_login_challenges(user_id, created_at desc);

create table if not exists public.telegram_delivery_events (
  event_key text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid,
  event_type text not null check (event_type in ('booking.created', 'booking.status_changed')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists telegram_delivery_events_profile_idx
  on public.telegram_delivery_events(profile_id, created_at desc);

create table if not exists public.telegram_updates (
  update_id bigint primary key,
  received_at timestamptz not null default now()
);

alter table public.telegram_connections enable row level security;
alter table public.telegram_link_challenges enable row level security;
alter table public.telegram_login_challenges enable row level security;
alter table public.telegram_delivery_events enable row level security;
alter table public.telegram_updates enable row level security;

drop policy if exists "specialists read own telegram connection" on public.telegram_connections;
create policy "specialists read own telegram connection" on public.telegram_connections
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists "specialists update own telegram connection" on public.telegram_connections;
create policy "specialists update own telegram connection" on public.telegram_connections
  for update to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists "specialists create own link challenge" on public.telegram_link_challenges;
create policy "specialists create own link challenge" on public.telegram_link_challenges
  for insert to authenticated
  with check (exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists "specialists read own link challenges" on public.telegram_link_challenges;
create policy "specialists read own link challenges" on public.telegram_link_challenges
  for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = profile_id and p.user_id = (select auth.uid())
  ));

drop policy if exists "specialists create own login challenge" on public.telegram_login_challenges;
create policy "specialists create own login challenge" on public.telegram_login_challenges
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists "specialists read own login challenges" on public.telegram_login_challenges;
create policy "specialists read own login challenges" on public.telegram_login_challenges
  for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.telegram_connections to authenticated;
grant update (revoked_at) on public.telegram_connections to authenticated;
grant select, insert on public.telegram_link_challenges to authenticated;
grant select, insert on public.telegram_login_challenges to authenticated;
