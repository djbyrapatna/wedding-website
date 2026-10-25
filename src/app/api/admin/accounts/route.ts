import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  if (auth.account?.role !== "owner") return NextResponse.json({ error: "Owner permission required." }, { status: 403 });
  const { data, error } = await supabase!.from("admin_accounts").select("user_id,email,role,active").order("email");
  return error ? NextResponse.json({ error: "Unable to load accounts." }, { status: 503 }) : NextResponse.json({ accounts: data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, true);
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (!["owner", "viewer"].includes(body.role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    let target = body.user_id;
    let email = body.email;
    if (body.action === "invite") {
      if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
      const { data, error } = await supabase!.auth.admin.inviteUserByEmail(email.trim(), { redirectTo: `${request.nextUrl.origin}/admin` });
      if (error || !data.user) return NextResponse.json({ error: "Unable to invite this account. It may already exist." }, { status: 400 });
      target = data.user.id;
    } else if (body.action === "update") {
      if (typeof target !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Invalid account update." }, { status: 400 });
      const { data } = await supabase!.from("admin_accounts").select("email").eq("user_id", target).single();
      if (!data) return NextResponse.json({ error: "Account not found." }, { status: 404 });
      email = data.email;
    } else return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    const { error } = await supabase!.rpc("manage_admin_account", { actor: auth.account!.user_id, target, account_email: email, account_role: body.role, account_active: body.action === "invite" ? true : body.active });
    if (error) return NextResponse.json({ error: "Unable to update access. At least one active owner must remain." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Invalid account request." }, { status: 400 }); }
}
