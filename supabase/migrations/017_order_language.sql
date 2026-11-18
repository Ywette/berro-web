alter table public.orders
  add column if not exists request_locale text
  check (request_locale is null or request_locale in ('lv', 'en', 'fr', 'ru'));
