-- Create per-excursion Storage "folders" (path prefixes) for collage + gallery.
-- Supabase has no real folders — placeholder objects make the paths show in the dashboard.
-- Run in Supabase Dashboard → SQL Editor after 005_excursion_photos.sql
--
-- Layout:
--   excursion-photos/{excursion_id}/collage/
--   excursion-photos/{excursion_id}/gallery/

-- Ensure bucket exists (safe if 005 already ran).
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

-- Placeholder for each excursion: collage + gallery subfolders.
insert into storage.objects (bucket_id, name, metadata)
select
  'excursion-photos',
  e.id || '/' || folder.name || '/.emptyFolderPlaceholder',
  jsonb_build_object('mimetype', 'application/octet-stream', 'size', 0)
from public.excursions e
cross join (
  values ('collage'), ('gallery')
) as folder(name)
on conflict (bucket_id, name) do nothing;
