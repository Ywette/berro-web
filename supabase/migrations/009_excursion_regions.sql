-- Allow excursions to belong to several regions (e.g. Latvia + Estonia + Lithuania).
-- Run in Supabase Dashboard → SQL Editor

alter table public.excursions
  add column if not exists regions jsonb not null default '[]'::jsonb;

-- Copy legacy single region into the new array when empty.
update public.excursions
set regions = jsonb_build_array(region)
where region is not null
  and region <> ''
  and (regions is null or regions = '[]'::jsonb);

create index if not exists excursions_regions_gin_idx
  on public.excursions using gin (regions);
