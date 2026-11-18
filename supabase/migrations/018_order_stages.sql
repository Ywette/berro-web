begin;

alter table public.orders drop constraint if exists orders_status_check;
update public.orders set status = 'new' where status = 'in_progress';
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'calculated', 'transport', 'sent', 'approved', 'paid'));

commit;
