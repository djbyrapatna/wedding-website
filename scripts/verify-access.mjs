// Integration tests run the real Next.js production server against a local
// Supabase HTTP fixture. No live accounts, database writes, or emails.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";

const ids = { owner: "00000000-0000-4000-8000-000000000001", viewer: "00000000-0000-4000-8000-000000000002" };
const jwt = role => [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ sub: ids[role], role: "authenticated", exp: Math.floor(Date.now()/1000)+3600 })).toString("base64url"), "fixture"].join(".");
let revoked = false;
let writes = 0;
const mock = createServer(async (req, res) => {
  const url = new URL(req.url, "http://fixture");
  const token = req.headers.authorization?.replace("Bearer ", "");
  const role = token === jwt("viewer") ? "viewer" : "owner";
  const user = { id: ids[role], email: `${role}@example.com`, role: "authenticated", aud: "authenticated", created_at: new Date().toISOString() };
  let text = ""; for await (const part of req) text += part;
  const body = text ? JSON.parse(text) : {};
  let result = [];
  if (url.pathname === "/auth/v1/token") {
    const kind = body.email?.startsWith("viewer") ? "viewer" : "owner";
    result = { access_token: jwt(kind), refresh_token: `refresh-${kind}`, expires_in: 3600, token_type: "bearer", user: { ...user, id: ids[kind], email: `${kind}@example.com` } };
  } else if (url.pathname === "/auth/v1/user") {
    if (![jwt("viewer"), jwt("owner")].includes(token)) { res.writeHead(401, { "Content-Type": "application/json" }); res.end(JSON.stringify({ message: "Invalid token" })); return; }
    result = user;
  }
  else if (url.pathname === "/rest/v1/admin_accounts") {
    const kind = url.searchParams.get("user_id")?.includes(ids.viewer) ? "viewer" : "owner";
    result = { user_id: ids[kind], email: `${kind}@example.com`, role: kind, active: !(revoked && kind === "viewer") };
  } else if (url.pathname.startsWith("/rest/v1/") && req.method !== "GET" && req.method !== "HEAD") writes++;
  res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(result));
});
mock.listen(0, "127.0.0.1"); await once(mock, "listening");
const dbUrl = `http://127.0.0.1:${mock.address().port}`;
const port = Number(process.env.ACCESS_TEST_PORT ?? 3187);
const base = `http://localhost:${port}`;
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  cwd: process.cwd(), env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SUPABASE_URL: dbUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key", SUPABASE_SERVICE_ROLE_KEY: "fixture-service-key", INVITATION_SESSION_SECRET: "fixture-only-secret-with-more-than-32-characters" }, stdio: ["ignore", "pipe", "pipe"],
});
let logs = ""; app.stdout.on("data", d => logs += d); app.stderr.on("data", d => logs += d);
async function request(path, { cookie, method = "GET", body, origin = base } = {}) {
  return fetch(base+path, { method, headers: { ...(cookie ? { cookie } : {}), ...(method !== "GET" ? { origin, "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
async function login(role) {
  const res = await request("/api/admin/auth", { method: "POST", body: { email: `${role}@example.com`, password: "fixture-password-long-enough" } });
  assert.equal(res.status, 200, await res.clone().text());
  return res.headers.getSetCookie().map(c => c.split(";")[0]).join("; ");
}
try {
  let ready = false;
  for (let i=0; i<100; i++) {
    try { if ((await fetch(base+"/admin")).ok) { ready = true; break; } } catch {}
    if (app.exitCode !== null) throw new Error(logs);
    await new Promise(r => setTimeout(r, 200));
  }
  assert.ok(ready, logs);
  const reads = ["/api/admin/rsvps", "/api/admin/checklist", "/api/admin/seating", "/api/admin/settings"];
  for (const path of reads) assert.equal((await request(path)).status, 401, `unauthenticated ${path}`);
  const viewer = await login("viewer");
  const owner = await login("owner");
  for (const path of reads) assert.equal((await request(path, { cookie: viewer })).status, 200, `viewer read ${path}`);
  assert.equal((await request("/api/admin/accounts", { cookie: viewer })).status, 403);
  for (const path of ["/api/admin/checklist", "/api/admin/seating", "/api/admin/settings", "/api/admin/accounts"]) {
    assert.equal((await request(path, { cookie: viewer, method: "POST", body: { role: "owner" } })).status, 403, `viewer write ${path}`);
  }
  assert.equal(writes, 0, "viewer never reaches a database mutation");
  assert.equal((await request("/api/admin/checklist", { cookie: owner, method: "POST", body: { item_id: "fixture", checked: true, notes: "" } })).status, 200);
  assert.equal(writes, 1);
  assert.equal((await request("/api/admin/checklist", { cookie: owner, method: "POST", origin: "https://other.example", body: { item_id: "fixture", checked: true } })).status, 403);
  revoked = true;
  assert.equal((await request("/api/admin/rsvps", { cookie: viewer })).status, 403, "revoked account loses access with its existing session");
  assert.equal((await request("/api/admin/rsvps", { cookie: "wedding-admin-access=forged-role-owner" })).status, 401, "role comes from database, not cookie claims");
  console.log("Admin integration checks passed: login, read-only access, mutation denial, owner write, origin protection, and revocation.");
} catch (error) { console.error(logs); throw error; }
finally { app.kill("SIGTERM"); mock.close(); await once(app, "exit").catch(() => {}); }
