-- Berro: fleet vehicles + managed excursions
-- Run in Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.fleet_vehicles (
  id text primary key,
  name text not null,
  kind text not null,
  passengers integer not null check (passengers >= 1),
  guide_seats integer not null default 0 check (guide_seats >= 0),
  image text not null default '',
  gallery_images jsonb not null default '[]'::jsonb,
  video_url text,
  plate text,
  insurance_expires_on date,
  inspection_expires_on date,
  available_in jsonb not null default '[]'::jsonb,
  interior_color text not null default '',
  body_color text not null default '',
  extras jsonb not null default '[]'::jsonb,
  summary text not null default '',
  description jsonb not null default '[]'::jsonb,
  closing_notes jsonb not null default '[]'::jsonb,
  readiness_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fleet_vehicles_is_active_idx on public.fleet_vehicles (is_active);
create index if not exists fleet_vehicles_kind_idx on public.fleet_vehicles (kind);

create table if not exists public.excursions (
  id text primary key,
  slug text not null unique,
  title text not null,
  images jsonb not null default '[]'::jsonb,
  logo_variant text not null default 'dark' check (logo_variant in ('dark', 'white')),
  route text not null default '',
  teaser text not null default '',
  details text not null default '',
  region text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists excursions_is_active_idx on public.excursions (is_active);
create index if not exists excursions_region_idx on public.excursions (region);

alter table public.fleet_vehicles enable row level security;
alter table public.excursions enable row level security;

-- Public can read active rows (anon / publishable key)
drop policy if exists "Public read active fleet vehicles" on public.fleet_vehicles;
create policy "Public read active fleet vehicles"
  on public.fleet_vehicles
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public read active excursions" on public.excursions;
create policy "Public read active excursions"
  on public.excursions
  for select
  to anon, authenticated
  using (is_active = true);

-- Staff writes go through the service role key (bypasses RLS).
-- No insert/update/delete policies for anon on purpose.
