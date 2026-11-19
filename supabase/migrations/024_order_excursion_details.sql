alter table public.orders
  add column if not exists excursion_slug text,
  add column if not exists excursion_title text;

notify pgrst, 'reload schema';
