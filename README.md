# Berro

Landing page and staff board for employees and driver availability.

Built with Next.js, React, Clerk, Supabase, and Resend. Deploy it on Vercel. The Git remote is [Ywette/berro-web](https://github.com/Ywette/berro-web.git).

## Folder map

```text
src/
  app/
    page.tsx                 public landing page and contact form
    contact/page.tsx         same email form on its own route
    sign-in/                 Clerk sign-in
    sign-up/                 Clerk sign-up
    login/page.tsx           redirects to /sign-in
    employees/page.tsx       employee list, Clerk login required
    drivers/page.tsx         driver availability, Clerk login required
  actions/                   server actions for email and availability
  components/                header, forms, tables, driver board
  lib/
    supabase/                public client + staff (service role) client
    auth/                    Clerk session helpers
    data/                    employee and driver queries
    email/                   Resend sender
  proxy.ts                   Clerk middleware; guards staff routes
  types/staff.ts             roles and availability statuses
supabase/
  migrations/                tables, row level security, grants
  seed.sql                   sample employees and driver statuses
```

Public pages are `/`, `/contact`, `/blog`, and `/excursions`. `/employees` and `/drivers` require a signed-in Clerk user. The contact form does not.

## Local setup

1. Copy environment variables.

```bash
cp .env.example .env.local
```

2. Clerk: use the linked Dashboard app (`clerk init` / `clerk env pull`) so `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Sign-in/up URLs should point at `/sign-in` and `/sign-up`.

3. Supabase: paste the project URL and publishable/anon key. For staff pages after the Clerk migration, also add `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API). Keep that key server-only.

4. In the Supabase SQL editor, run `supabase/migrations/0001_employees_and_availability.sql`, then `supabase/seed.sql` if you want sample rows.

5. Create a Resend API key. `CONTACT_TO_EMAIL` is who receives the form. `CONTACT_FROM_EMAIL` must be a sender Resend allows.

6. Start the app.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Import `https://github.com/Ywette/berro-web.git` in Vercel. Framework preset is Next.js. Add the same variables from `.env.example` in the project settings (including Clerk keys for the production instance), then deploy.

The landing page and contact form still render when Supabase is missing. Staff pages then show what still needs to be connected. Email sending fails with a clear message until the Resend variables are set.

## What is not in this pass

There is no screen yet for adding or editing employees. Add people in the Supabase table editor, or extend `employees` later. Availability updates are open to any signed-in Clerk user who reaches the staff routes. Tighten that with Clerk roles or organization permissions when staff roles are settled.
