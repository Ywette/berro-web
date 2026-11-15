-- Berro: quote / CRM orders
-- Run in Supabase Dashboard → SQL Editor → New query → Run
-- (after 001_fleet_and_excursions.sql and 002_newsletter_subscribers.sql)

create table if not exists public.orders (
  id text primary key,
  reference text not null,
  origin text not null default '—',
  destination text not null default '—',
  return_to text,
  passenger_count integer not null check (passenger_count >= 1),
  requestor_name text,
  requestor_company text,
  requestor_email text,
  requestor_phone text,
  heard_about text,
  heard_about_detail text,
  -- Travel purpose from the quote form (schoolClass, sportsTeam, corporate, …, other)
  travel_type text,
  travel_type_detail text,
  -- Vehicle / service kind from quote (Bus Rental, Minibus Rental, Transfer, Excursions)
  trip text,
  trip_mode text check (trip_mode is null or trip_mode in ('oneWay', 'roundTrip')),
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'sent', 'approved', 'paid')),
  departure_on date,
  return_on date,
  departure_at timestamptz,
  return_at timestamptz,
  stops jsonb not null default '[]'::jsonb,
  waiting_minutes integer check (waiting_minutes is null or waiting_minutes >= 0),
  plan_document text,
  plan_document_path text,
  assigned_driver_id text,
  assigned_driver_name text,
  assigned_guide_id text,
  assigned_guide_name text,
  assigned_vehicle_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_reference_unique unique (reference)
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_departure_on_idx on public.orders (departure_on);
create index if not exists orders_travel_type_idx on public.orders (travel_type);

alter table public.orders enable row level security;

-- No public policies: inserts/updates go through the service role key (server action / staff).
-- Staff can view rows in the Table Editor with the service role.
