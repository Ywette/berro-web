alter table public.excursions
  add column if not exists description_document jsonb;
