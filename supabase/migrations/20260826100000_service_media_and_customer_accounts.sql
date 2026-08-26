alter table public.services
  add column if not exists image_path text;

comment on column public.services.image_path is 'Optional path to an image in the profile-media bucket.';
