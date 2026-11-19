begin;

alter table public.drivers
  add column if not exists licence_categories text[] not null default '{}'::text[]
    constraint drivers_licence_categories_format check (
      cardinality(licence_categories) = 0
      or (
        array_ndims(licence_categories) = 1
        and string_to_array(array_to_string(licence_categories, ',', ''), ',') = licence_categories
        and array_to_string(licence_categories, ',', '') ~
          '^[A-Z][A-Z0-9]{0,7}(,[A-Z][A-Z0-9]{0,7})*$'
      )
    );

alter table public.fleet_vehicles
  add column if not exists required_licence_category text
    constraint fleet_vehicles_required_licence_category_format check (
      required_licence_category is null
      or required_licence_category ~ '^[A-Z][A-Z0-9]{0,7}$'
    );

comment on column public.drivers.licence_categories is
  'Recorded driving licence category codes. An empty array means no categories have been recorded.';

comment on column public.fleet_vehicles.required_licence_category is
  'Driving licence category code required for this vehicle. NULL means no requirement has been recorded.';

create index if not exists drivers_licence_categories_idx
  on public.drivers using gin (licence_categories);

create index if not exists fleet_vehicles_required_licence_category_idx
  on public.fleet_vehicles (required_licence_category);

notify pgrst, 'reload schema';

commit;
