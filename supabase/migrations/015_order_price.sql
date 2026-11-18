alter table public.orders
  add column if not exists price numeric(12, 2) check (price >= 0);
