-- Sample staff rows. Safe to re-run.
insert into public.employees (id, full_name, email, phone, role)
values
  ('11111111-1111-4111-8111-111111111111', 'Jānis Bērziņš', 'janis.berzins@berro.lv', '+371 26 11 01 01', 'driver'),
  ('22222222-2222-4222-8222-222222222222', 'Anna Ozola', 'anna.ozola@berro.lv', '+371 26 22 02 02', 'driver'),
  ('44444444-4444-4444-8444-444444444444', 'Mārtiņš Kalniņš', 'martins.kalnins@berro.lv', '+371 26 33 03 03', 'driver'),
  ('55555555-5555-4555-8555-555555555555', 'Ilze Liepa', 'ilze.liepa@berro.lv', '+371 26 44 04 04', 'driver'),
  ('66666666-6666-4666-8666-666666666666', 'Andris Krūmiņš', 'andris.krumins@berro.lv', '+371 26 55 05 05', 'driver'),
  ('33333333-3333-4333-8333-333333333333', 'Kristīne Vītola', 'kristine.vitola@berro.lv', '+371 26 66 06 06', 'dispatcher')
on conflict (id) do nothing;

insert into public.driver_availability (employee_id, status, note)
values
  ('11111111-1111-4111-8111-111111111111', 'available', 'Gatavs nākamajam reisam'),
  ('22222222-2222-4222-8222-222222222222', 'on_trip', 'Rīta reiss uz Jūrmalu'),
  ('44444444-4444-4444-8444-444444444444', 'available', null),
  ('55555555-5555-4555-8555-555555555555', 'off_duty', 'Brīvdiena līdz trešdienai'),
  ('66666666-6666-4666-8666-666666666666', 'unavailable', 'Tehniskā apskate')
on conflict (employee_id) do nothing;

insert into public.vehicles (
  id,
  name,
  plate,
  passengers,
  image_path,
  insurance_expires_on,
  inspection_expires_on,
  readiness_note
)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01', 'Executive Mercedes Sprinter', 'BT-1001', 8, '/fleet/sprinter-black.jpg', '2027-03-12', '2027-01-20', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02', 'Executive Mercedes Sprinter', 'BT-1002', 8, '/fleet/sprinter-black.jpg', '2026-11-28', '2027-05-04', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03', 'Executive Mercedes Sprinter', 'BT-1003', 8, '/fleet/sprinter-black.jpg', '2026-09-01', '2026-11-18', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04', 'Van Hool CX45 Luxury Coach', 'BT-5601', 56, '/fleet/coach-white.jpg', '2027-06-01', '2026-12-10', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05', 'Van Hool CX45 Luxury Coach', 'BT-5602', 56, '/fleet/coach-white.jpg', '2026-11-22', '2027-02-14', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06', 'Van Hool CX45 Luxury Coach', 'BT-5603', 56, '/fleet/coach-white.jpg', '2026-08-15', '2026-10-02', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07', 'Van Hool CX45 Luxury Coach', 'BT-1401', 14, '/fleet/sprinter-silver.jpg', '2027-04-22', '2027-01-08', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08', 'Van Hool CX45 Luxury Coach', 'BT-1402', 14, '/fleet/sprinter-silver.jpg', '2026-12-05', '2026-11-25', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa09', 'Van Hool CX45 Luxury Coach', 'BT-1403', 14, '/fleet/sprinter-silver.jpg', '2026-07-12', '2026-11-15', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10', 'Mercedes-Benz S-Class', 'BT-0401', 4, '/fleet/mercedes-s-class-black.jpg', '2027-08-01', '2027-03-01', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11', 'Mercedes-Benz S-Class', 'BT-0402', 4, '/fleet/mercedes-s-class-black.jpg', '2026-11-30', '2027-06-18', null),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12', 'Mercedes-Benz S-Class', 'BT-0403', 4, '/fleet/mercedes-s-class-black.jpg', '2026-05-20', '2026-11-12', null)
on conflict (id) do nothing;

insert into public.orders (
  id,
  reference,
  origin,
  destination,
  return_to,
  passenger_count,
  requestor_name,
  requestor_email,
  requestor_phone,
  status,
  departure_on,
  return_on,
  assigned_driver_id,
  assigned_vehicle_id
)
values
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    'ORD-1042',
    'Rīga',
    'Tallinn',
    'Rīga',
    42,
    'Anna Berzina',
    'anna@example.com',
    '+371 2000 1001',
    'new',
    '2026-11-18',
    '2026-11-20',
    null,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'ORD-1038',
    'Rīga Airport',
    'Jūrmala',
    null,
    6,
    'Hotel Baltic',
    'ops@hotelbaltic.lv',
    '+371 2000 1002',
    'in_progress',
    '2026-11-12',
    null,
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    'ORD-1029',
    'Rīga',
    'Vilnius',
    'Rīga',
    28,
    'EduTravel',
    'trips@edutravel.lv',
    '+371 2000 1003',
    'sent',
    '2026-11-22',
    '2026-11-24',
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    'ORD-1015',
    'Liepāja',
    'Rīga',
    'Liepāja',
    14,
    'Pēteris Ozols',
    'peteris@example.lv',
    '+371 2000 1004',
    'approved',
    '2026-11-15',
    '2026-11-15',
    '44444444-4444-4444-8444-444444444444',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
    'ORD-1007',
    'Rīga',
    'Sigulda',
    'Rīga',
    4,
    'Claire Dupont',
    'claire@example.com',
    '+33 600 000 100',
    'paid',
    '2026-11-08',
    '2026-11-08',
    '55555555-5555-4555-8555-555555555555',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10'
  )
on conflict (id) do nothing;
