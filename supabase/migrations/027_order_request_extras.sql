alter table public.orders
  add column if not exists water_requested boolean not null default false,
  add column if not exists request_notes text;
