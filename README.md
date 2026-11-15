# Berro

Landing page and staff board for employees and driver availability.

Built with Next.js, React, Clerk, and Resend. Deploy it on Vercel. The Git remote is [Ywette/berro-web](https://github.com/Ywette/berro-web.git).

Staff lists (orders, fleet, employees, drivers) use in-memory sample data for now. There is no database in this build.

## Folder map

```text
src/
  app/
    page.tsx                 public landing page and contact form
    contact/page.tsx         same email form on its own route
    sign-in/                 Clerk sign-in
    sign-up/                 Clerk sign-up
    login/page.tsx           redirects to /sign-in
    staff/                   Personāls dashboard (Clerk login required)
    employees/page.tsx       employee list, Clerk login required
    drivers/page.tsx         driver availability, Clerk login required
  actions/                   server actions for email and availability
  components/                header, forms, tables, driver board
  lib/
    data/                    sample employees, drivers, orders, vehicles
    auth/                    Clerk session helpers
    email/                   Resend sender
  proxy.ts                   Clerk middleware; guards staff routes
  types/staff.ts             roles and availability statuses
```

Public pages are `/`, `/contact`, `/blog`, and `/excursions`. `/staff`, `/employees`, and `/drivers` require a signed-in Clerk user. The contact form does not.

## Local setup

1. Copy environment variables.

```bash
cp .env.example .env.local
```

2. Clerk: use the linked Dashboard app (`clerk init` / `clerk env pull`) so `.env.local` has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Sign-in/up URLs should point at `/sign-in` and `/sign-up`.

3. Supabase: Project Settings → API. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable), and `SUPABASE_SERVICE_ROLE_KEY` (secret). Run these in the SQL Editor: `supabase/migrations/001_fleet_and_excursions.sql`, then `002_newsletter_subscribers.sql`. Fleet, excursions, and newsletter signups sync to Supabase.

4. Create a Resend API key. `CONTACT_TO_EMAIL` is who receives the form. `CONTACT_FROM_EMAIL` must be a sender Resend allows.

5. Start the app.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Import `https://github.com/Ywette/berro-web.git` in Vercel. Framework preset is Next.js. Add the same variables from `.env.example` in the project settings (including Clerk keys for the production instance), then deploy.

The landing page and contact form still render when optional keys are missing. Email sending fails with a clear message until the Resend variables are set.

## What is not in this pass

Orders and employees still use in-code demo data. Tighten access with Clerk roles or organization permissions when staff roles are settled.
