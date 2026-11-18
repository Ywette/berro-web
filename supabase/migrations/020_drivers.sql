-- Add real drivers through the Supabase Table Editor after running this migration.
-- Orders already store assigned_driver_id as text, so existing orders are preserved.
create table if not exists public.drivers (
  id text primary key default gen_random_uuid()::text,
  full_name text not null check (length(trim(full_name)) > 0),
  phone text,
  email text,
  is_active boolean not null default true,
  status text not null default 'available'
    check (status in ('available', 'on_trip', 'off_duty', 'unavailable')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists drivers_active_name_idx on public.drivers (is_active, full_name);
alter table public.drivers enable row level security;
-- No public policies: the application reads this staff data on the server.
