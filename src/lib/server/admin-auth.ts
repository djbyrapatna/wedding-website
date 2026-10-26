import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type AdminRole = "owner" | "viewer";
export type AdminAccount = { user_id: string; email: string; role: AdminRole; active: boolean };
const ACCESS = "wedding-admin-access";
const REFRESH = "wedding-admin-refresh";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !supabase) throw new Error("Admin authentication is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function saveSession(session: { access_token: string; refresh_token: string; expires_in?: number }) {
  cookies().set(ACCESS, session.access_token, { ...cookieOptions, maxAge: session.expires_in ?? 3600 });
  cookies().set(REFRESH, session.refresh_token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
}

export function clearSession() {
  cookies().set(ACCESS, "", { ...cookieOptions, maxAge: 0 });
  cookies().set(REFRESH, "", { ...cookieOptions, maxAge: 0 });
}

export function sameOrigin(request: NextRequest) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export async function requireAdmin(request: NextRequest, write = false) {
  if (write && !sameOrigin(request)) return { response: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }) };
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { response: NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 }) };
  const client = authClient();
  let token = cookies().get(ACCESS)?.value;
  const refresh = cookies().get(REFRESH)?.value;
  let user = token ? (await client.auth.getUser(token)).data.user : null;
  if (!user && refresh) {
    const { data, error } = await client.auth.refreshSession({ refresh_token: refresh });
    if (!error && data.session) {
      saveSession(data.session);
      token = data.session.access_token;
      user = data.user;
    }
  }
  if (!user) { clearSession(); return { response: NextResponse.json({ error: "Please sign in." }, { status: 401 }) }; }
  const { data, error } = await supabase.from("admin_accounts").select("user_id,email,role,active").eq("user_id", user.id).maybeSingle();
  if (error) return { response: NextResponse.json({ error: "Unable to verify account permissions." }, { status: 503 }) };
  if (!data?.active || (write && data.role !== "owner")) return { response: NextResponse.json({ error: "You do not have permission for this action." }, { status: 403 }) };
  return { account: data as AdminAccount, token };
}
