alter table public.fleet_vehicles
  add column if not exists year integer check (year between 1000 and 9999);
