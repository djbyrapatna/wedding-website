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
    await db.exec(await readFile(new URL("../supabase/migrations/007_admin_accounts.sql", import.meta.url), "utf8"));
    const owner = "00000000-0000-4000-8000-000000000001";
    const viewer = "00000000-0000-4000-8000-000000000002";
    const other = "00000000-0000-4000-8000-000000000003";
    await db.query("insert into admin_accounts values ($1,'owner@example.com','owner',true,now()),($2,'viewer@example.com','viewer',true,now())", [owner, viewer]);
    async function manage(actor, target, role, active = true) {
      return db.query("select manage_admin_account($1,$2,'test@example.com',$3,$4)", [actor, target, role, active]);
    }
    await assert.rejects(manage(viewer, other, "owner"), /Owner permission required/);
    await assert.rejects(manage(owner, owner, "viewer"), /last owner/);
    await assert.rejects(manage(owner, owner, "owner", false), /last owner/);
    await manage(owner, other, "owner");
    await manage(owner, owner, "viewer");
    await assert.rejects(manage(owner, viewer, "owner"), /Owner permission required/);
    await assert.rejects(manage(other, other, "owner", false), /last owner/);
    await manage(other, viewer, "viewer", false);
    assert.equal((await db.query("select active from admin_accounts where user_id=$1", [viewer])).rows[0].active, false);
    assert.equal((await db.query("select count(*)::int as count from admin_accounts where role='owner' and active")).rows[0].count, 1);
    await db.exec("set role anon");
    await assert.rejects(db.query("select manage_admin_account($1,$1,'x@example.com','owner',true)", [other]), /permission denied/);
  } finally { await db.close(); }
});
