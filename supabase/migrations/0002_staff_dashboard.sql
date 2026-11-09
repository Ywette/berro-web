-- Staff dashboard: orders + fleet vehicles for quotes and readiness.
-- Paste into the Supabase SQL editor after 0001_employees_and_availability.sql.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'new',
      'in_progress',
      'sent',
      'approved',
      'paid'
    );
  end if;
end
$$;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate text,
  passengers integer not null check (passengers > 0),
  image_path text,
  insurance_expires_on date,
  licence_expires_on date,
  inspection_expires_on date,
  readiness_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  origin text not null,
  destination text not null,
  return_to text,
  passenger_count integer not null check (passenger_count > 0),
  requestor_name text,
  requestor_email text,
  requestor_phone text,
  status public.order_status not null default 'new',
  departure_on date,
  return_on date,
  assigned_driver_id uuid references public.employees (id) on delete set null,
  assigned_vehicle_id uuid references public.vehicles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_departure_idx on public.orders (departure_on);
create index if not exists orders_assigned_driver_idx on public.orders (assigned_driver_id);
create index if not exists vehicles_active_idx on public.vehicles (is_active);

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.vehicles enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Authenticated users can read vehicles" on public.vehicles;
create policy "Authenticated users can read vehicles"
on public.vehicles
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read orders" on public.orders;
create policy "Authenticated users can read orders"
on public.orders
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update orders" on public.orders;
create policy "Authenticated users can update orders"
on public.orders
for update
to authenticated
using (true)
with check (true);

grant select on table public.vehicles to authenticated;
grant select, update on table public.orders to authenticated;
