-- Newsletter subscribers from the contact page subscribe form
-- Run in Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  topics jsonb not null default '[]'::jsonb,
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email)
);

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- No public policies: inserts go through the service role key (server action).
-- Staff can view rows in the Table Editor with the service role.
