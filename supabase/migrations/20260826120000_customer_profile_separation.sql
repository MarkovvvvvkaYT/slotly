-- Customer accounts do not need a public specialist profile.
-- Keep the existing default as specialist for older clients that do not send a role.
create policy "users create own specialist profile" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'specialist');
  requested_slug text := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'slug', ''), '[^a-z0-9-]+', '-', 'g'));
  safe_slug text := trim(both '-' from requested_slug);
begin
  if account_type = 'customer' then
    return new;
  end if;

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
