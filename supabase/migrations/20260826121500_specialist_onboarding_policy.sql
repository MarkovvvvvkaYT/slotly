drop policy if exists "users create own specialist profile" on public.profiles;
create policy "users create own specialist profile" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
