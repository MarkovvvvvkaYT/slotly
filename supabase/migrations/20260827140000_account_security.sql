create table if not exists public.telegram_account_delete_challenges (
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

create index if not exists telegram_account_delete_challenges_user_idx
  on public.telegram_account_delete_challenges(user_id, created_at desc);

alter table public.telegram_account_delete_challenges enable row level security;

drop policy if exists "users create own account delete challenge" on public.telegram_account_delete_challenges;
create policy "users create own account delete challenge" on public.telegram_account_delete_challenges
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "users read own account delete challenge" on public.telegram_account_delete_challenges;
create policy "users read own account delete challenge" on public.telegram_account_delete_challenges
  for select to authenticated
  using (user_id = (select auth.uid()));

grant select, insert on public.telegram_account_delete_challenges to authenticated;

create or replace function public.delete_current_user()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  delete from auth.users where id = auth.uid();
  return found;
end;
$$;

revoke all on function public.delete_current_user() from public;
grant execute on function public.delete_current_user() to authenticated;
