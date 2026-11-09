-- Staff directory and driver availability for Berro.
-- Paste this into the Supabase SQL editor, then run supabase/seed.sql
-- if you want a few sample rows.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'employee_role') then
    create type public.employee_role as enum (
      'driver',
      'dispatcher',
      'office',
      'mechanic',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'driver_status') then
    create type public.driver_status as enum (
      'available',
      'on_trip',
      'off_duty',
      'unavailable'
    );
  end if;
end
$$;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  role public.employee_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.driver_availability (
  employee_id uuid primary key references public.employees (id) on delete cascade,
  status public.driver_status not null default 'unavailable',
  note text,
  updated_at timestamptz not null default now()
);

create index if not exists employees_role_idx on public.employees (role);
create index if not exists employees_active_idx on public.employees (is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

drop trigger if exists driver_availability_set_updated_at on public.driver_availability;
create trigger driver_availability_set_updated_at
before update on public.driver_availability
for each row execute function public.set_updated_at();

alter table public.employees enable row level security;
alter table public.driver_availability enable row level security;

drop policy if exists "Authenticated users can read employees" on public.employees;
create policy "Authenticated users can read employees"
on public.employees
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read driver availability" on public.driver_availability;
create policy "Authenticated users can read driver availability"
on public.driver_availability
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert driver availability" on public.driver_availability;
create policy "Authenticated users can insert driver availability"
on public.driver_availability
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update driver availability" on public.driver_availability;
create policy "Authenticated users can update driver availability"
on public.driver_availability
for update
to authenticated
using (true)
with check (true);

grant select on table public.employees to authenticated;
grant select, insert, update on table public.driver_availability to authenticated;
