import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("account migration enforces owner management and preserves the last owner", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users (id uuid primary key);
      insert into auth.users values
      ('00000000-0000-4000-8000-000000000001'),
      ('00000000-0000-4000-8000-000000000002'),
      ('00000000-0000-4000-8000-000000000003');`);
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/007_admin_accounts.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const owner = "00000000-0000-4000-8000-000000000001";
    const viewer = "00000000-0000-4000-8000-000000000002";
    const other = "00000000-0000-4000-8000-000000000003";
    await db.query(
      "insert into admin_accounts values ($1,'owner@example.com','owner',true,now()),($2,'viewer@example.com','viewer',true,now())",
      [owner, viewer],
    );
    async function manage(actor, target, role, active = true) {
      return db.query(
        "select manage_admin_account($1,$2,'test@example.com',$3,$4)",
        [actor, target, role, active],
      );
    }
    await assert.rejects(
      manage(viewer, other, "owner"),
      /Owner permission required/,
    );
    await assert.rejects(manage(owner, owner, "viewer"), /last owner/);
    await assert.rejects(manage(owner, owner, "owner", false), /last owner/);
    await manage(owner, other, "owner");
    await manage(owner, owner, "viewer");
    await assert.rejects(
      manage(owner, viewer, "owner"),
      /Owner permission required/,
    );
    await assert.rejects(manage(other, other, "owner", false), /last owner/);
    await manage(other, viewer, "viewer", false);
    assert.equal(
      (
        await db.query("select active from admin_accounts where user_id=$1", [
          viewer,
        ])
      ).rows[0].active,
      false,
    );
    assert.equal(
      (
        await db.query(
          "select count(*)::int as count from admin_accounts where role='owner' and active",
        )
      ).rows[0].count,
      1,
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query(
        "select manage_admin_account($1,$1,'x@example.com','owner',true)",
        [other],
      ),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});

test("household codes survive guest-list reimports and remain private", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create table households (household_id integer primary key, search_name text); insert into households values (1,'Original name');",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/008_household_access.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      "insert into household_access (household_id,code_hash) values (1,'hash-only'); insert into households values (1,'Updated name') on conflict(household_id) do update set search_name=excluded.search_name;",
    );
    assert.equal(
      (
        await db.query(
          "select code_hash from household_access where household_id=1",
        )
      ).rows[0].code_hash,
      "hash-only",
    );
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from household_access"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
