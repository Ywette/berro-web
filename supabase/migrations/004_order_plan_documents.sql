-- Plan document files for quote orders (Supabase Storage + path on orders)
-- Run in Supabase Dashboard → SQL Editor after 003_orders.sql

alter table public.orders
  add column if not exists plan_document_path text;

-- Private bucket for attached travel plans (PDF / DOCX / TXT).
-- Uploads go through the service role key from the Next.js server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-plans',
  'order-plans',
  false,
  4194304,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public storage policies: only the service role reads/writes objects.
