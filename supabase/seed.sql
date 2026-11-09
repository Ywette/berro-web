-- Sample staff rows. Safe to re-run.
insert into public.employees (id, full_name, email, phone, role)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Sample Driver One',
    'driver.one@example.com',
    '+40 700 000 001',
    'driver'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Sample Driver Two',
    'driver.two@example.com',
    '+40 700 000 002',
    'driver'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Sample Dispatcher',
    'dispatch@example.com',
    '+40 700 000 003',
    'dispatcher'
  )
on conflict (id) do nothing;

insert into public.driver_availability (employee_id, status, note)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'available',
    'Ready for the next assignment'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'on_trip',
    'Out on a morning run'
  )
on conflict (employee_id) do nothing;
