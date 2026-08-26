alter table public.services
  add column if not exists category text not null default 'other'
    check (category in ('beauty', 'barbers', 'education', 'sport', 'photo', 'consulting', 'repair', 'other'));

-- Existing services inherit the established category of their profile, so they
-- remain discoverable in the catalogue immediately after this migration.
update public.services as service
set category = profile.category
from public.profiles as profile
where service.profile_id = profile.id
  and service.category = 'other'
  and profile.category in ('beauty', 'barbers', 'education', 'sport', 'photo', 'consulting', 'repair', 'other');

create index if not exists services_active_category_catalog_idx
  on public.services (category, profile_id)
  where active = true;
