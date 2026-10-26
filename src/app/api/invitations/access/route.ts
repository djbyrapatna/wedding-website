import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sameOrigin } from "@/lib/server/admin-auth";
import {
  invitationConfigured,
  invitationCodeHash,
  openInvitation,
} from "@/lib/server/invitation-auth";
import { loadInvitation } from "@/lib/server/invitations";
import { getRsvpOpen } from "@/lib/settings";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!supabase || !invitationConfigured())
    return NextResponse.json(
      {
        error:
          "Invitation access is not configured. Please contact the couple.",
      },
      { status: 503 },
    );
  if (!(await getRsvpOpen()))
    return NextResponse.json(
      { error: "RSVPs are closed. Please contact the couple." },
      { status: 403 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid invitation request." },
      { status: 400 },
    );
  }
  if (
    !body ||
    typeof body !== "object" ||
    Boolean(body.code) === Boolean(body.guest_id)
  )
    return NextResponse.json(
      { error: "Choose a name or enter an invitation code." },
      { status: 400 },
    );
  try {
    let householdId: number | undefined;
    if (
      typeof body.code === "string" &&
      /^WED-[A-F0-9]{20}$/i.test(body.code.trim())
    ) {
      const { data, error } = await supabase
        .from("household_access")
        .select("household_id")
        .eq("code_hash", invitationCodeHash(body.code))
        .maybeSingle();
      if (error) throw error;
      householdId = data?.household_id;
    } else if (
      typeof body.guest_id === "string" &&
      body.guest_id.length <= 64
    ) {
      const { data, error } = await supabase
        .from("guests")
        .select("household_id")
        .eq("guest_id", body.guest_id)
        .eq("removed", false)
        .neq("name_status", "PLACEHOLDER_UNKNOWN")
        .maybeSingle();
      if (error) throw error;
      householdId = data?.household_id;
    }
    const invitation =
      householdId === undefined ? null : await loadInvitation(householdId);
    if (!invitation)
      return NextResponse.json(
        {
          error: "Invitation not found. Check the name or code and try again.",
        },
        { status: 404 },
      );
    openInvitation(householdId!);
    return NextResponse.json(invitation, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to open your invitation. Please try again." },
      { status: 503 },
    );
  }
}
