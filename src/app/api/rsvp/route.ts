import { NextRequest, NextResponse } from "next/server";
import { WEDDING } from "@/config/wedding";
import { ADULT_ENTREES, KIDS_MEALS, ALTERNATIVE_MEAL } from "@/config/menu";
import { supabase } from "@/lib/supabase";
import { getRsvpOpen } from "@/lib/settings";
import { sameOrigin } from "@/lib/server/admin-auth";
import { invitationHousehold } from "@/lib/server/invitation-auth";
import { loadInvitation } from "@/lib/server/invitations";
import { validateRsvp } from "@/lib/rsvp/validation.mjs";
import type { RsvpSubmission } from "@/lib/rsvp/types";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const id = invitationHousehold();
  if (id === null)
    return NextResponse.json(
      {
        error:
          "Your invitation session expired. Please find your invitation again.",
      },
      { status: 401 },
    );
  if (!supabase)
    return NextResponse.json(
      {
        error:
          "Responses cannot be saved right now. Please contact the couple.",
      },
      { status: 503 },
    );
  if (!(await getRsvpOpen()))
    return NextResponse.json(
      {
        error: `RSVPs are closed. Please contact ${WEDDING.coupleName} to update your response.`,
      },
      { status: 403 },
    );
  let body: RsvpSubmission;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid RSVP request." },
      { status: 400 },
    );
  }
  try {
    const invitation = await loadInvitation(id);
    if (!invitation)
      return NextResponse.json(
        { error: "Invitation not found." },
        { status: 404 },
      );
    const validation = validateRsvp(body, invitation.guests, {
      adults: [...ADULT_ENTREES.map((m) => m.value), ALTERNATIVE_MEAL.value],
      children: KIDS_MEALS.map((m) => m.value),
      alternative: ALTERNATIVE_MEAL.value,
    });
    if (validation)
      return NextResponse.json({ error: validation }, { status: 400 });
    const primary =
      invitation.guests.find((g) => g.is_primary_contact)?.guest_id ??
      invitation.guests[0].guest_id;
    const rows = body.guests.map((g) => ({
      guest_id: g.guest_id,
      attending_wedding: g.attending_wedding,
      attending_rehearsal: invitation.guests.find(
        (profile) => profile.guest_id === g.guest_id,
      )?.invited_rehearsal_dinner
        ? g.attending_rehearsal
        : null,
      meal_preference:
        g.attending_wedding &&
        invitation.guests.find((profile) => profile.guest_id === g.guest_id)
          ?.guest_type !== "infant"
          ? g.meal_preference?.trim() || null
          : null,
      dietary_notes: g.dietary_notes?.trim() || null,
      plus_one_name: g.plus_one_name?.trim() || null,
      plus_one_type: g.plus_one_type || null,
      rsvp_email: g.guest_id === primary ? body.email?.trim() || null : null,
      rsvp_phone: g.guest_id === primary ? body.phone?.trim() || null : null,
      notes: g.guest_id === primary ? body.note?.trim() || null : null,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("rsvps")
      .upsert(rows, { onConflict: "guest_id" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save your RSVP. Please try again." },
      { status: 503 },
    );
  }
}
