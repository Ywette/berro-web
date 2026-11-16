-- Company / staff documentation (licences, certificates, etc.)
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.company_documents (
  id text primary key,
  title text not null,
  description text not null default '',
  file_name text not null,
  file_path text not null,
  mime_type text not null default 'application/octet-stream',
  file_size integer not null default 0 check (file_size >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_documents_title_idx
  on public.company_documents (title);

alter table public.company_documents enable row level security;

-- Staff reads/writes go through the service role key (bypasses RLS).
-- No anon policies on purpose.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-documents',
  'company-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public storage policies: only the service role reads/writes objects.
