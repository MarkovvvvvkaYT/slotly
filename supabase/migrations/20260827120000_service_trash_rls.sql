drop policy if exists "published services are public" on public.services;
create policy "published services are public" on public.services
  for select to anon, authenticated
  using (active = true and deleted_at is null and exists (
    select 1 from public.profiles p where p.id = profile_id and p.is_published = true
  ));
