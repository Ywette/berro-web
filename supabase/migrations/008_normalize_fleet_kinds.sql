-- Normalize fleet kind values so Autoparks sections recognize them.
-- Run in Supabase Dashboard → SQL Editor

update public.fleet_vehicles
set kind = case
  when lower(trim(kind)) in ('van', 'minibus', 'mikroautobuss', 'mikroautobusi') then 'van'
  when lower(trim(kind)) in ('coach', 'autobuss', 'autobusi', 'autobus') then 'coach'
  when lower(trim(kind)) in ('vip', 'auto', 'car', 'car rental', 'auto noma') then 'vip'
  when lower(trim(kind)) in ('retro', 'retroauto', 'retro auto', 'retro-auto') then 'retro'
  else 'van'
end
where kind is distinct from case
  when lower(trim(kind)) in ('van', 'minibus', 'mikroautobuss', 'mikroautobusi') then 'van'
  when lower(trim(kind)) in ('coach', 'autobuss', 'autobusi', 'autobus') then 'coach'
  when lower(trim(kind)) in ('vip', 'auto', 'car', 'car rental', 'auto noma') then 'vip'
  when lower(trim(kind)) in ('retro', 'retroauto', 'retro auto', 'retro-auto') then 'retro'
  else 'van'
end;

-- Ensure rows show on Autoparks
update public.fleet_vehicles
set is_active = true
where is_active is distinct from true;
