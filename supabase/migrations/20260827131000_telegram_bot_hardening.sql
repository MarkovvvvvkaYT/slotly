create index if not exists telegram_login_challenges_profile_idx
  on public.telegram_login_challenges(profile_id, created_at desc);
create index if not exists telegram_login_challenges_connection_idx
  on public.telegram_login_challenges(telegram_connection_id);

drop policy if exists "telegram delivery events are server only" on public.telegram_delivery_events;
create policy "telegram delivery events are server only" on public.telegram_delivery_events
  for all to public using (false) with check (false);

drop policy if exists "telegram updates are server only" on public.telegram_updates;
create policy "telegram updates are server only" on public.telegram_updates
  for all to public using (false) with check (false);
