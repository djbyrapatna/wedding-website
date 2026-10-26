import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import {
  generateInvitationCode,
  invitationCodeHash,
} from "@/lib/server/invitation-auth";
import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

async function activeHouseholds() {
  const { data, error } = await supabase!
    .from("guests")
    .select("household_id")
    .eq("removed", false);
  if (error) throw error;
  return new Set<number>(data.map((g) => g.household_id));
}
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  if (auth.account?.role !== "owner")
    return NextResponse.json(
      { error: "Owner permission required." },
      { status: 403 },
    );
  try {
    const active = await activeHouseholds();
    const [households, codes] = await Promise.all([
      supabase!
        .from("households")
        .select("household_id,search_name")
        .order("search_name"),
      supabase!.from("household_access").select("household_id"),
    ]);
    if (households.error || codes.error) throw new Error("Database error");
    const existing = new Set(codes.data.map((c) => c.household_id));
    return NextResponse.json({
      households: households.data
        .filter((h) => active.has(h.household_id))
        .map((h) => ({ ...h, has_code: existing.has(h.household_id) })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load invitations. Check migration 008." },
      { status: 503 },
    );
  }
}
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, true);
  if (auth.response) return auth.response;
  try {
    const body = await request.json();
    if (
      !body ||
      !["generate-missing", "replace"].includes(body.action) ||
      (body.action === "replace" && !Number.isInteger(body.household_id))
    )
      return NextResponse.json(
        { error: "Invalid code request." },
        { status: 400 },
      );
    const active = await activeHouseholds();
    const { data: households, error } = await supabase!
      .from("households")
      .select("household_id,search_name");
    if (error) throw error;
    let targets = households.filter((h) => active.has(h.household_id));
    if (body.action === "replace")
      targets = targets.filter((h) => h.household_id === body.household_id);
    if (body.action === "replace" && !targets.length)
      return NextResponse.json(
        { error: "Active household not found." },
        { status: 404 },
      );
    if (body.action === "generate-missing") {
      const existing = await supabase!
        .from("household_access")
        .select("household_id");
      if (existing.error) throw existing.error;
      const ids = new Set(existing.data.map((c) => c.household_id));
      targets = targets.filter((h) => !ids.has(h.household_id));
    }
    const generated: Array<{
      household_id: number;
      search_name: string;
      code: string;
    }> = [];
    let failed = 0;
    for (const h of targets) {
      const code = generateInvitationCode();
      const record = {
        household_id: h.household_id,
        code_hash: invitationCodeHash(code),
        updated_at: new Date().toISOString(),
      };
      const result =
        body.action === "replace"
          ? await supabase!
              .from("household_access")
              .upsert(record, { onConflict: "household_id" })
          : await supabase!.from("household_access").insert(record);
      if (result.error) {
        failed++;
        continue;
      }
      generated.push({ ...h, code });
    }
    // Preserve successful plaintext codes even when some writes fail. They can
    // only be downloaded now; the database stores hashes, not recoverable codes.
    return NextResponse.json(
      { generated, failed },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to generate codes. Please try again." },
      { status: 503 },
    );
  }
}
