import { NextRequest, NextResponse } from "next/server";
import { authClient, clearSession, requireAdmin, sameOrigin, saveSession } from "@/lib/server/admin-auth";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ account: auth.account });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const client = authClient();
    if (body.action === "recover") {
      if (typeof body.email !== "string" || body.email.length > 254) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
      await client.auth.resetPasswordForEmail(body.email.trim(), { redirectTo: `${request.nextUrl.origin}/admin` });
      return NextResponse.json({ ok: true, message: "If that account exists, a password reset email is on its way." });
    }
    if (typeof body.password !== "string" || body.password.length < 12 || body.password.length > 256) return NextResponse.json({ error: "Use a password between 12 and 256 characters." }, { status: 400 });
    if (body.action === "set-password") {
      if (typeof body.access_token !== "string" || typeof body.refresh_token !== "string") return NextResponse.json({ error: "Invalid account link." }, { status: 400 });
      const { data, error } = await client.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
      if (error || !data.user) return NextResponse.json({ error: "This link has expired. Request a new password reset." }, { status: 401 });
      const { data: account, error: roleError } = await supabase.from("admin_accounts").select("active").eq("user_id", data.user.id).maybeSingle();
      if (roleError) return NextResponse.json({ error: "Unable to verify account permissions." }, { status: 503 });
      if (!account?.active) return NextResponse.json({ error: "Account access is not enabled." }, { status: 403 });
      const updated = await client.auth.updateUser({ password: body.password });
      if (updated.error) return NextResponse.json({ error: "Unable to set password." }, { status: 400 });
      if (data.session) saveSession(data.session);
      return NextResponse.json({ ok: true });
    }
    if (typeof body.email !== "string" || body.email.length > 254) return NextResponse.json({ error: "Enter an email address." }, { status: 400 });
    const { data, error } = await client.auth.signInWithPassword({ email: body.email.trim(), password: body.password });
    if (error || !data.session) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    const { data: account, error: roleError } = await supabase.from("admin_accounts").select("user_id,email,role,active").eq("user_id", data.user.id).maybeSingle();
    if (roleError) return NextResponse.json({ error: "Unable to verify account permissions." }, { status: 503 });
    if (!account?.active) return NextResponse.json({ error: "Account access is not enabled." }, { status: 403 });
    saveSession(data.session);
    return NextResponse.json({ account });
  } catch {
    return NextResponse.json({ error: "Unable to complete authentication. Please try again." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const auth = await requireAdmin(request);
  clearSession();
  if (auth.token && supabase) await supabase.auth.admin.signOut(auth.token, "local");
  return NextResponse.json({ ok: true });
}
