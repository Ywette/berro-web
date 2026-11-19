alter table public.excursions
  add column if not exists planned_date date;

notify pgrst, 'reload schema';
