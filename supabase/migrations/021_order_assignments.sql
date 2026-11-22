alter table public.orders
  add column if not exists assignments jsonb;

-- A null value keeps existing orders readable through their original assignment columns.
