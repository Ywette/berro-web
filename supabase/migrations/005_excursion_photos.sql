-- Public bucket for excursion collage photos (staff uploads via service role).
-- Run in Supabase Dashboard → SQL Editor after 001_fleet_and_excursions.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'excursion-photos',
  'excursion-photos',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for collage images on the site.
drop policy if exists "Public read excursion photos" on storage.objects;
create policy "Public read excursion photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'excursion-photos');

-- Writes go through the service role key from the Next.js API (bypasses RLS).
