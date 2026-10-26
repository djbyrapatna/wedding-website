# Wedding website

Next.js frontend and API routes with Supabase storage, individual dashboard
accounts, and RSVP lookup by either guest name or household invitation code.

- [Personalization](docs/PERSONALIZATION.md): public content, photos, metadata.
- [Dashboard accounts](docs/ADMIN_ACCOUNTS.md): owners, read-only viewers, auth setup.
- [Invitation access](docs/INVITATION_ACCESS.md): codes, sessions, RSVP validation.

Install with `npm ci`; copy `.env.local.example` to `.env.local` and configure it.
Run `npm run dev` for local development. Run `npm run build`, `npm test`,
`npm run lint`, and `npm run test:access` for validation (HTTP tests require a build).

A new database needs SQL migrations **001–008 in order**. On an existing database,
apply only missing migrations. Migration 003 replaces an old demo schema and
must never be rerun on a live guest list. Account emails and invitation delivery
require your own Supabase Auth setup; see the guides above.

## RSVP Guest List Import

The guest list lives in **`Wedding_Guests_RSVP_Clean.xlsx`** (sheet `Guests`),
which is the single source of truth. `scripts/import-guests.mjs` syncs it into
Supabase. It is **idempotent and safe to re-run** — re-importing an edited file
updates the database in place and **never wipes RSVP responses guests have
already submitted**.

### How it works (two layers)

- **Imported tables** — `households` and `guests` are rebuilt from the sheet on
  every run (upserted on `household_id` / `guest_id`).
- **Response table** — `rsvps` is written _only_ by the website, keyed on the
  stable `guest_id`. The importer never touches it, so responses always survive.
- Guests that disappear from the sheet are **soft-removed** (`removed = true`),
  never hard-deleted, so an existing RSVP can never be orphaned.

### One-time setup

1. Run the SQL migrations in the Supabase SQL editor, in order:
   `supabase/migrations/001_initial_schema.sql`,
   `002_checklist.sql`, `003_rsvp_guest_list.sql`, then migrations 004–008 for the remaining features.
2. Create `.env.local` (see `.env.local.example`) with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...   # secret, server-only
   ```

### Importing

```bash
npm run import-guests -- --dry-run     # preview the diff, write nothing
npm run import-guests                  # apply changes
npm run import-guests -- path/to.xlsx  # explicit file (default: the clean xlsx)
```

Each run prints a summary (inserted / updated / soft-removed / households /
placeholders) and any **non-fatal warnings** (missing/duplicate primary contact,
blank `side` on a confirmed guest, malformed zip). A dry run needs no database.

### The `guest_id` contract

`guest_id` (format `G###`) is immutable — **never renumber existing guests.**

- Add a guest in the sheet with a fresh `G###`, or leave it blank: the importer
  assigns the next available id and **reports it** so you can write it back into
  the sheet.
- `PLACEHOLDER_UNKNOWN` rows are real seats for unnamed plus-ones; the website
  lets the primary contact fill in the name at RSVP time (stored on
  `rsvps.plus_one_name`, not back in the sheet).

Run `npm test` to exercise the importer logic (`node --test`).
