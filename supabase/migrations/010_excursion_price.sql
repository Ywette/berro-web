-- Optional from-price (EUR) for managed excursions.
-- Run in Supabase Dashboard → SQL Editor

alter table public.excursions
  add column if not exists price numeric(10, 2);

comment on column public.excursions.price is 'Optional from-price in EUR; null when unset.';
