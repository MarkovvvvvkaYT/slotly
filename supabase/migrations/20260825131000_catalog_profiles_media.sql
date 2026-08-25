alter table public.profiles
  add column if not exists category text not null default 'other' check (category in ('beauty', 'barbers', 'education', 'sport', 'photo', 'consulting', 'repair', 'other')),
  add column if not exists city text not null default '',
  add column if not exists avatar_path text,
  add column if not exists cover_path text;

update public.profiles
set city = coalesce(nullif(trim(split_part(address, '·', 1)), ''), '')
where city = '';

alter table public.bookings
  alter column reference set default ('SL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)));

update public.bookings
set reference = 'SL-' || substring(reference from 4)
where reference like ('V' || 'E-%');

create index if not exists profiles_published_catalog_idx on public.profiles (is_published, category, city);
create index if not exists services_active_catalog_idx on public.services (profile_id, active, name);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile media read access" on storage.objects;
drop policy if exists "profile owners upload media" on storage.objects;
drop policy if exists "profile owners update media" on storage.objects;
drop policy if exists "profile owners delete media" on storage.objects;

create policy "profile media read access"
on storage.objects for select to anon, authenticated
using (
  bucket_id = 'profile-media'
  and (
    (select auth.uid())::text = (storage.foldername(name))[1]
    or exists (
      select 1 from public.profiles p
      where p.user_id::text = (storage.foldername(storage.objects.name))[1]
        and p.is_published = true
    )
  )
);

create policy "profile owners upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-media' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "profile owners update media"
on storage.objects for update to authenticated
using (bucket_id = 'profile-media' and (select auth.uid())::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-media' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "profile owners delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-media' and (select auth.uid())::text = (storage.foldername(name))[1]);

grant select on public.profiles, public.services, public.availability_rules to anon, authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
