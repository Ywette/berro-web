alter table public.excursions
  add column if not exists excoursion_plan jsonb;
