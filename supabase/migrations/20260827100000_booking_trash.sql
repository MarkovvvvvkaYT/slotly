alter table public.bookings
  add column if not exists deleted_at timestamptz;

drop index if exists public.bookings_active_slot_idx;
create unique index bookings_active_slot_idx
  on public.bookings(profile_id, date, time)
  where status <> 'cancelled' and deleted_at is null;

create index if not exists bookings_trash_idx
  on public.bookings(profile_id, deleted_at)
  where deleted_at is not null;

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
    and b.deleted_at is null
    and p.is_published = true;
$$;

revoke all on function public.get_occupied_booking_slots(uuid, date) from public;
grant execute on function public.get_occupied_booking_slots(uuid, date) to anon, authenticated;
