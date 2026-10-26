-- Codes are separate from imported data so reimporting a guest list preserves them.
create table public.household_access (
  household_id integer primary key references public.households(household_id) on delete cascade,
  code_hash text not null unique,
  updated_at timestamptz not null default now()
);
alter table public.household_access enable row level security;
-- No public policies: code verification and generation are server-only.
