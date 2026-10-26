// Run once after migration 007. Requires exactly two owner email addresses.
import { createClient } from "@supabase/supabase-js";
const emails = process.argv.slice(2).map(v => v.trim().toLowerCase());
if (emails.length !== 2 || new Set(emails).size !== 2 || emails.some(v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) throw new Error("Usage: npm run bootstrap-admins -- your@email.com sai@email.com");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const site = process.env.SITE_URL;
if (!url || !key || !site) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SITE_URL in .env.local.");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { count, error: countError } = await db.from("admin_accounts").select("user_id", { count: "exact", head: true }).eq("active", true).eq("role", "owner");
if (countError) throw countError;
if (count) throw new Error("Owners already exist. Use the dashboard Accounts tab to manage access.");
for (const email of emails) {
  const { data, error } = await db.auth.admin.inviteUserByEmail(email, { redirectTo: new URL('/admin', site).href });
  if (error) throw error;
  const result = await db.from("admin_accounts").insert({ user_id: data.user.id, email, role: "owner", active: true });
  if (result.error) throw result.error;
  console.log(`Invited owner: ${email}`);
}
