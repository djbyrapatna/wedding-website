# Dashboard accounts

Apply migrations 001–007 in order to a new Supabase project. On an existing
project, apply only missing migrations: migration 003 replaces the original demo
schema and must never be rerun against live data.

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and your deployment. The service-role
key stays server-only. Set `SITE_URL` to your site's origin for bootstrap invites.

In Supabase Authentication settings:

1. Disable public signup and enable email/password login.
2. Set the Site URL and allow redirect URLs for `https://YOUR-DOMAIN/admin` and
   `http://localhost:3000/admin` during development.
3. Configure email delivery for invitations and password recovery. Keep email
   templates using Supabase's confirmation URL so links deliver session tokens.

Run `npm run bootstrap-admins -- YOUR_EMAIL SAI_EMAIL` once to invite the two
owners. Invitations open `/admin`, where each person chooses a password of at
least 12 characters. The script refuses to run if an active owner exists; manage
subsequent accounts through the Accounts tab. If setup is interrupted, an owner
already created can finish inviting the second owner in that tab.

Owners can invite viewers or owners, change roles, and revoke/restore access.
Viewers may read all dashboard data, filter it, and export CSV, but cannot modify
RSVP availability, checklist notes/status, seating, or accounts. The database
serializes role changes and prevents removing the final active owner.

Sessions use HttpOnly, SameSite cookies, secure in production. All endpoints
validate the Supabase user and read the current account role on each request.
Cross-origin mutations are rejected. Revoking access takes effect on the next
request; the UI returns to login when authorization expires or changes.

Missing configuration and database errors fail closed. Admin features no longer
switch to local editing on errors. Real credentials are required to exercise the
live account experience; no development password or demo owner bypass exists.

Run `npm run build` followed by `npm run test:access` for HTTP integration checks
against an isolated local Supabase fixture. This does not send email or modify a
live database. Validate invitation emails, recovery redirects, and migration 007
in your own Supabase staging project before production rollout.
