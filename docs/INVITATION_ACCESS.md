# Name and code RSVP access

Apply migration 008 after migrations 001–007. For an existing database, apply
only missing migrations. Set `INVITATION_SESSION_SECRET` to at least 32 random
characters in `.env.local` and the deployment. Generate it locally with
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Do not commit the secret. Replacing it invalidates all existing invitation sessions.

Guests enter either a name or a code in the same input. Name searches show up to
12 named, active guests; selecting a match opens that household. Codes beginning
with `WED-` open a household directly. Either method grants the same ability to
view and edit that household's responses; knowing a guest name is intentionally
sufficient. Unnamed placeholder seats and removed guests are not searchable.

After lookup, a signed HttpOnly cookie scopes access to that household for two
hours. Household reads and RSVP writes reject missing, forged, expired, and
mismatched sessions. Writes validate the current active household membership,
primary contact, yes/no answers, meals, rehearsal eligibility, and plus-one data.
Guests can reopen an invitation to edit their response. The importer's stable
IDs and separate response table are unchanged.

Guest-facing responses include invitation names, applicable options, and existing
RSVP/contact fields needed by the form. They exclude mailing addresses, tiers,
review flags, and other internal guest-list metadata. Closing RSVPs prevents both
new access and submissions. Missing database/session configuration returns an
explicit error; submissions are never acknowledged without being saved.

Owners manage codes in Admin → Invitation codes. Generate missing codes in bulk,
or generate/replace a specific household's code. Download the generated CSV before
leaving the tab: only SHA-256 hashes are stored, so plaintext codes cannot be
retrieved later. The CSV contains household names and bearer codes; keep it private
and outside Git. Replacing a code stops new lookups using the previous code;
existing sessions expire within two hours. Name lookup remains available.

`household_access` is independent of spreadsheet columns. Reimports preserve
codes. Soft-removing all members makes the invitation unavailable until an active
guest returns. Partial code-generation failures are reported, while successful
codes remain downloadable.

Interfaces:

- `POST /api/invitations/access`: `{guest_id}` from a selected name result, or
  `{code}`. Returns a minimal invitation and establishes its session.
- `GET /api/households/:id`: returns the same invitation for a matching session.
- `POST /api/rsvp`: existing response fields; now requires that session and all
  active guests from the household.
- Owner-only `GET/POST /api/admin/invitations`: list code availability, generate
  missing codes (`action: generate-missing`), or replace one (`action: replace`,
  `household_id`). Successful plaintext codes are returned only on generation.

Run `npm run build`, `npm test`, and `npm run test:access`. The HTTP tests run real
Next.js routes against a local, in-memory Supabase fixture. Set
`VERIFY_KEEP_ALIVE=1 npm run test:access` to retain the local preview for manual
browser testing; the printed example accounts and codes are synthetic test data.
