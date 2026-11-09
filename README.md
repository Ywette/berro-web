# Berro

Landing page and staff board for employees and driver availability.

Built with Next.js, React, Supabase Auth, and Resend. Deploy it on Vercel. The Git remote is [Ywette/berro-web](https://github.com/Ywette/berro-web.git).

## Folder map

```text
src/
  app/
    page.tsx                 public landing page and contact form
    contact/page.tsx         same email form on its own route
    login/page.tsx           staff email and password login
    employees/page.tsx       employee list, login required
    drivers/page.tsx         driver availability, login required
    auth/callback/route.ts   Supabase email-link return
  actions/                   server actions for login, email, availability
  components/                header, forms, tables, driver board
  lib/
    supabase/                browser client, server client, session proxy
    auth/                    current user check
    data/                    employee and driver queries
    email/                   Resend sender
  proxy.ts                   refreshes the session and guards staff routes
  types/staff.ts             roles and availability statuses
supabase/
  migrations/                tables, row level security, grants
  seed.sql                   sample employees and driver statuses
```

Public pages are `/`, `/contact`, and `/login`. `/employees` and `/drivers` require a signed-in Supabase user. The contact form does not.

## Local setup

1. Copy environment variables.

```bash
cp .env.example .env.local
```

2. In Supabase, create a project and paste the project URL and publishable key into `.env.local`. Older projects call that key the anon key. Either value works in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

3. In the Supabase SQL editor, run `supabase/migrations/0001_employees_and_availability.sql`, then `supabase/seed.sql` if you want sample rows.

4. In Authentication → Providers, keep Email enabled. Create a staff user under Authentication → Users. For local password login, confirm the user in the dashboard so Supabase does not wait on a confirmation email.

5. Add these redirect URLs under Authentication → URL configuration:

- `http://localhost:3000/auth/callback`
- the same path on the Vercel domain once you have one

6. Create a Resend API key. `CONTACT_TO_EMAIL` is who receives the form. `CONTACT_FROM_EMAIL` must be a sender Resend allows. Until a domain is verified, Resend’s onboarding sender can deliver only to the Resend account email.

7. Start the app.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel

Import `https://github.com/Ywette/berro-web.git` in Vercel. Framework preset is Next.js. Add the same variables from `.env.example` in the project settings, then deploy.

The landing page and contact form still render when Supabase is missing. Staff pages then show what still needs to be connected. Email sending fails with a clear message until the Resend variables are set.

## What is not in this pass

There is no screen yet for adding or editing employees. Add people in the Supabase table editor, or extend `employees` later. Availability updates are open to any signed-in user. Tighten that with a role column and a stricter row level security policy when the staff roles are settled.
