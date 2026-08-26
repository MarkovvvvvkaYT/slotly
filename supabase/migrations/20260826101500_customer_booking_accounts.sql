alter table public.bookings
  add column if not exists client_user_id uuid references auth.users(id) on delete set null;

create index if not exists bookings_client_user_idx on public.bookings (client_user_id, date);

drop policy if exists "clients read their bookings" on public.bookings;
create policy "clients read their bookings" on public.bookings
  for select to authenticated
  using ((select auth.uid()) = client_user_id);
