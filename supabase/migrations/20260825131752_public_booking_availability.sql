create or replace function public.get_occupied_booking_slots(p_profile_id uuid, p_date date)
returns table(start_time time, duration_minutes integer)
language sql
stable
security definer
set search_path = ''
as $$
  select b.time, s.duration_minutes
  from public.bookings b
  join public.services s on s.id = b.service_id
  join public.profiles p on p.id = b.profile_id
  where b.profile_id = p_profile_id
    and b.date = p_date
    and b.status <> 'cancelled'
    and p.is_published = true;
$$;

revoke all on function public.get_occupied_booking_slots(uuid, date) from public;
grant execute on function public.get_occupied_booking_slots(uuid, date) to anon, authenticated;
