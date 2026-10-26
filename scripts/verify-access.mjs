// Integration tests run the real Next.js production server against a local
// Supabase HTTP fixture. No live accounts, database writes, or emails.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createHash, createHmac } from "node:crypto";

const ids = {
  owner: "00000000-0000-4000-8000-000000000001",
  viewer: "00000000-0000-4000-8000-000000000002",
};
const tokenExpires = Math.floor(Date.now() / 1000) + 3600;
const jwt = (role) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: ids[role],
        role: "authenticated",
        exp: tokenExpires,
      }),
    ).toString("base64url"),
    "fixture",
  ].join(".");
let revoked = false;
let writes = 0;
let rsvpOpen = true;
const fixtureCode = "WED-0123456789ABCDEF0123";
const hashCode = (code) => createHash("sha256").update(code).digest("hex");
const households = [
  {
    household_id: 1,
    search_name: "Patel Party",
    address_line1: "PRIVATE ADDRESS",
  },
  { household_id: 2, search_name: "Lee Party" },
];
const guests = [
  {
    guest_id: "G001",
    household_id: 1,
    display_name: "Alex Patel",
    first_name: "Alex",
    last_name: "Patel",
    is_primary_contact: true,
    invited_rehearsal_dinner: false,
    guest_type: "adult",
    name_status: "confirmed",
    removed: false,
    side: "PRIVATE SIDE",
    tier: "PRIVATE TIER",
  },
  {
    guest_id: "G002",
    household_id: 2,
    display_name: "Jordan Lee",
    first_name: "Jordan",
    last_name: "Lee",
    is_primary_contact: true,
    invited_rehearsal_dinner: true,
    guest_type: "adult",
    name_status: "confirmed",
    removed: false,
  },
  {
    guest_id: "G003",
    household_id: 2,
    display_name: "Jordan's Guest",
    first_name: null,
    last_name: null,
    is_primary_contact: false,
    invited_rehearsal_dinner: false,
    guest_type: "adult",
    name_status: "PLACEHOLDER_UNKNOWN",
    removed: false,
  },
  {
    guest_id: "G004",
    household_id: 1,
    display_name: "Removed Guest",
    name_status: "confirmed",
    removed: true,
  },
];
let responses = [];
const codeRows = [{ household_id: 1, code_hash: hashCode(fixtureCode) }];
const mock = createServer(async (req, res) => {
  const url = new URL(req.url, "http://fixture");
  const token = req.headers.authorization?.replace("Bearer ", "");
  const role = token === jwt("viewer") ? "viewer" : "owner";
  const user = {
    id: ids[role],
    email: `${role}@example.com`,
    role: "authenticated",
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };
  let text = "";
  for await (const part of req) text += part;
  const body = text ? JSON.parse(text) : {};
  let result = [];
  if (url.pathname === "/auth/v1/token") {
    const kind =
      body.email?.startsWith("viewer") ||
      body.refresh_token === "refresh-viewer"
        ? "viewer"
        : "owner";
    result = {
      access_token: jwt(kind),
      refresh_token: `refresh-${kind}`,
      expires_in: 3600,
      token_type: "bearer",
      user: { ...user, id: ids[kind], email: `${kind}@example.com` },
    };
  } else if (url.pathname === "/auth/v1/user") {
    if (![jwt("viewer"), jwt("owner")].includes(token)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid token" }));
      return;
    }
    result = user;
  } else if (url.pathname === "/rest/v1/admin_accounts") {
    const accounts = ["owner", "viewer"].map((kind) => ({
      user_id: ids[kind],
      email: `${kind}@example.com`,
      role: kind,
      active: !(revoked && kind === "viewer"),
    }));
    result = url.searchParams.has("user_id")
      ? accounts.filter(
          (a) => `eq.${a.user_id}` === url.searchParams.get("user_id"),
        )
      : accounts;
  } else if (url.pathname.startsWith("/rest/v1/")) {
    const table = url.pathname.split("/").pop();
    if (req.method !== "GET" && req.method !== "HEAD") {
      writes++;
      if (table === "rsvps") responses = body;
      if (table === "site_settings") rsvpOpen = body.value;
      if (table === "household_access") {
        const index = codeRows.findIndex(
          (r) => r.household_id === body.household_id,
        );
        if (index >= 0) codeRows[index] = body;
        else codeRows.push(body);
      }
    } else {
      const source =
        {
          households,
          guests,
          rsvps: responses,
          household_access: codeRows,
          site_settings: [{ key: "rsvp_open", value: rsvpOpen }],
          checklist_items: [],
          seating_tables: [],
          seating_assignments: [],
        }[table] ?? [];
      result = source.filter((row) =>
        [...url.searchParams].every(([key, value]) => {
          if (value.startsWith("eq."))
            return String(row[key]) === value.slice(3);
          if (value.startsWith("neq."))
            return String(row[key]) !== value.slice(4);
          if (value.startsWith("in.("))
            return value.slice(4, -1).split(",").includes(String(row[key]));
          return true;
        }),
      );
      const select = url.searchParams.get("select");
      if (select && select !== "*")
        result = result.map((row) =>
          Object.fromEntries(select.split(",").map((key) => [key, row[key]])),
        );
      if (req.headers.accept?.includes("application/vnd.pgrst.object+json"))
        result = result[0] ?? null;
    }
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result));
});
mock.listen(0, "127.0.0.1");
await once(mock, "listening");
const dbUrl = `http://127.0.0.1:${mock.address().port}`;
const port = Number(process.env.ACCESS_TEST_PORT ?? 3187);
const base = `http://localhost:${port}`;
const app = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_PUBLIC_SUPABASE_URL: dbUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "fixture-service-key",
      INVITATION_SESSION_SECRET:
        "fixture-only-secret-with-more-than-32-characters",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
app.stdout.on("data", (d) => (logs += d));
app.stderr.on("data", (d) => (logs += d));
async function request(
  path,
  { cookie, method = "GET", body, origin = base } = {},
) {
  return fetch(base + path, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(method !== "GET"
        ? { origin, "Content-Type": "application/json" }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
async function login(role) {
  const res = await request("/api/admin/auth", {
    method: "POST",
    body: {
      email: `${role}@example.com`,
      password: "fixture-password-long-enough",
    },
  });
  assert.equal(res.status, 200, await res.clone().text());
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(base + "/admin")).ok) {
        ready = true;
        break;
      }
    } catch {}
    if (app.exitCode !== null) throw new Error(logs);
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(ready, logs);
  const reads = [
    "/api/admin/rsvps",
    "/api/admin/checklist",
    "/api/admin/seating",
    "/api/admin/settings",
  ];
  for (const path of reads)
    assert.equal((await request(path)).status, 401, `unauthenticated ${path}`);
  const viewer = await login("viewer");
  const owner = await login("owner");
  const refreshed = await request("/api/admin/auth", {
    cookie:
      "wedding-admin-access=expired; wedding-admin-refresh=refresh-viewer",
  });
  assert.equal(refreshed.status, 200);
  assert.equal(
    (await refreshed.json()).account.role,
    "viewer",
    "refresh retains the viewer role",
  );
  for (const path of reads)
    assert.equal(
      (await request(path, { cookie: viewer })).status,
      200,
      `viewer read ${path}`,
    );
  assert.equal(
    (await request("/api/admin/accounts", { cookie: viewer })).status,
    403,
  );
  if (process.env.VERIFY_INVITATIONS !== "0")
    assert.equal(
      (await request("/api/admin/invitations", { cookie: viewer })).status,
      403,
    );
  for (const path of [
    "/api/admin/checklist",
    "/api/admin/seating",
    "/api/admin/settings",
    "/api/admin/accounts",
  ]) {
    assert.equal(
      (
        await request(path, {
          cookie: viewer,
          method: "POST",
          body: { role: "owner" },
        })
      ).status,
      403,
      `viewer write ${path}`,
    );
  }
  assert.equal(writes, 0, "viewer never reaches a database mutation");
  assert.equal(
    (
      await request("/api/admin/checklist", {
        cookie: owner,
        method: "POST",
        body: { item_id: "fixture", checked: true, notes: "" },
      })
    ).status,
    200,
  );
  assert.equal(writes, 1);
  assert.equal(
    (
      await request("/api/admin/checklist", {
        cookie: owner,
        method: "POST",
        origin: "https://other.example",
        body: { item_id: "fixture", checked: true },
      })
    ).status,
    403,
  );
  revoked = true;
  assert.equal(
    (await request("/api/admin/rsvps", { cookie: viewer })).status,
    403,
    "revoked account loses access with its existing session",
  );
  assert.equal(
    (
      await request("/api/admin/rsvps", {
        cookie: "wedding-admin-access=forged-role-owner",
      })
    ).status,
    401,
    "role comes from database, not cookie claims",
  );
  console.log(
    "Admin integration checks passed: login, read-only access, mutation denial, owner write, origin protection, and revocation.",
  );
  if (process.env.VERIFY_INVITATIONS !== "0") {
    assert.equal((await request("/api/households/1")).status, 401);
    assert.equal(
      (await request("/api/rsvp", { method: "POST", body: {} })).status,
      401,
    );
    assert.equal(
      (
        await request("/api/invitations/access", {
          method: "POST",
          body: { code: "WED-INVALID" },
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request("/api/invitations/access", {
          method: "POST",
          body: { guest_id: "G004" },
        })
      ).status,
      404,
      "removed guests cannot open an invitation",
    );
    assert.equal(
      (
        await request("/api/invitations/access", {
          method: "POST",
          body: { guest_id: "G003" },
        })
      ).status,
      404,
      "placeholder seats cannot be selected by name",
    );
    const byName = await request("/api/invitations/access", {
      method: "POST",
      body: { guest_id: "G001" },
    });
    assert.equal(byName.status, 200, await byName.clone().text());
    const invitation = await byName.json();
    assert.equal(invitation.household.household_id, 1);
    assert.ok(!("address_line1" in invitation.household));
    assert.ok(
      !("side" in invitation.guests[0]) && !("tier" in invitation.guests[0]),
    );
    const cookie = byName.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    assert.equal((await request("/api/households/1", { cookie })).status, 200);
    assert.equal((await request("/api/households/2", { cookie })).status, 403);
    assert.equal(
      (await request("/api/households/1", { cookie: cookie + "tampered" }))
        .status,
      401,
    );
    const tokenValue = Buffer.from(
      JSON.stringify({ household_id: 1, expires: Date.now() - 1000 }),
    ).toString("base64url");
    const sig = createHmac(
      "sha256",
      "fixture-only-secret-with-more-than-32-characters",
    )
      .update(tokenValue)
      .digest("base64url");
    assert.equal(
      (
        await request("/api/households/1", {
          cookie: `wedding-invitation=${tokenValue}.${sig}`,
        })
      ).status,
      401,
      "expired sessions fail",
    );
    const byCode = await request("/api/invitations/access", {
      method: "POST",
      body: { code: fixtureCode.toLowerCase() },
    });
    assert.equal(byCode.status, 200);
    assert.deepEqual(
      await byCode.json(),
      invitation,
      "name and code open the same invitation",
    );
    const input = {
      primary_guest_id: "G001",
      email: "alex@example.com",
      guests: [
        {
          guest_id: "G001",
          attending_wedding: true,
          attending_rehearsal: null,
          meal_preference: "Beef",
          dietary_notes: "",
          plus_one_name: null,
          plus_one_type: null,
        },
      ],
    };
    assert.equal(
      (
        await request("/api/rsvp", {
          cookie,
          method: "POST",
          body: {
            ...input,
            guests: [{ ...input.guests[0], guest_id: "G002" }],
          },
        })
      ).status,
      400,
      "cross-household write rejected",
    );
    assert.equal(
      (
        await request("/api/rsvp", {
          cookie,
          method: "POST",
          body: {
            ...input,
            guests: [{ ...input.guests[0], meal_preference: "Invalid meal" }],
          },
        })
      ).status,
      400,
    );
    assert.equal(
      (await request("/api/rsvp", { cookie, method: "POST", body: input }))
        .status,
      200,
    );
    const updated = await (
      await request("/api/households/1", { cookie })
    ).json();
    assert.equal(updated.rsvps[0].rsvp_email, "alex@example.com");
    assert.equal(updated.rsvps[0].meal_preference, "Beef");
    assert.equal(
      (
        await request("/api/admin/invitations", {
          cookie: owner,
          method: "POST",
          body: { action: "replace", household_id: 1 },
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await request("/api/invitations/access", {
          method: "POST",
          body: { code: fixtureCode },
        })
      ).status,
      404,
      "replaced code no longer opens an invitation",
    );
    rsvpOpen = false;
    assert.equal(
      (await request("/api/rsvp", { cookie, method: "POST", body: input }))
        .status,
      403,
    );
    assert.equal(
      (
        await request("/api/invitations/access", {
          method: "POST",
          body: { guest_id: "G001" },
        })
      ).status,
      403,
    );
    console.log(
      "Invitation integration checks passed: name/code parity, minimized data, scoped/expired/forged sessions, membership validation, saved responses, code rotation, and closed RSVPs.",
    );
  }
  if (process.env.VERIFY_KEEP_ALIVE) {
    revoked = false;
    rsvpOpen = true;
    codeRows[0] = { household_id: 1, code_hash: hashCode(fixtureCode) };
    console.log(
      `Local fixture preview ready at ${base}. Test accounts: owner@example.com / viewer@example.com, password fixture-password-long-enough. Code: ${fixtureCode}`,
    );
    await new Promise((resolve) => process.once("SIGTERM", resolve));
  }
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  app.kill("SIGTERM");
  mock.close();
  await once(app, "exit").catch(() => {});
}
