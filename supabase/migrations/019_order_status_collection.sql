alter table public.orders
  add column if not exists completed_statuses text[] not null default array['new']::text[];

update public.orders
set completed_statuses = array_append(completed_statuses, status)
where not (status = any(completed_statuses));

alter table public.orders drop constraint if exists orders_completed_statuses_check;
alter table public.orders add constraint orders_completed_statuses_check
  check (completed_statuses <@ array['new', 'calculated', 'transport', 'sent', 'approved', 'paid']::text[]);
