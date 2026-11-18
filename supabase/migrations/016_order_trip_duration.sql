alter table public.orders
  add column if not exists trip_duration_days integer
  generated always as (
    case
      when departure_on is not null and return_on >= departure_on
        then return_on - departure_on + 1
      else null
    end
  ) stored;
