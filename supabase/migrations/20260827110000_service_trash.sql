alter table public.services add column if not exists deleted_at timestamptz;
create index if not exists services_trash_idx on public.services(profile_id, deleted_at) where deleted_at is not null;
