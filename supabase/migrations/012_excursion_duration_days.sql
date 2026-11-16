-- Optional trip length in days for managed excursions (used to auto-fill return date).
-- Run in Supabase Dashboard → SQL Editor

alter table public.excursions
  add column if not exists duration_days integer;

alter table public.excursions
  drop constraint if exists excursions_duration_days_check;

alter table public.excursions
  add constraint excursions_duration_days_check
  check (duration_days is null or duration_days >= 1);

comment on column public.excursions.duration_days is
  'Optional trip length in calendar days; null when unset. Return = departure + (days - 1).';
