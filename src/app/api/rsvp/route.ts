import { WEDDING } from "@/config/wedding";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getRsvpOpen } from "@/lib/settings";

// Never cache submissions.
export const dynamic = "force-dynamic";

interface GuestRsvpInput {
  guest_id: string;
  attending_wedding: boolean | null;
  attending_rehearsal: boolean | null;
  meal_preference: string | null;
  dietary_notes: string | null;
  plus_one_name: string | null;
  plus_one_type: string | null;
}

interface RsvpBody {
  guests: GuestRsvpInput[];
  primary_guest_id?: string;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
}

// Writes ONLY to the rsvps table, keyed on guest_id. Idempotent: a guest can
// submit again to edit their response. Email/phone are stored on the primary
// contact's row. The imported guests/households tables are never touched here.
export async function POST(request: NextRequest) {
  // Hard gate: once the admin closes RSVPs, reject all submissions/edits. This
  // is the real lock — the RSVP page hiding the form is just the UI half.
  if (!(await getRsvpOpen())) {
    return NextResponse.json(
      {
        error:
          `RSVPs are now closed. Please reach out to ${WEDDING.coupleName} directly if you need to update your response.`,
      },
      { status: 403 }
    );
  }

  const body = (await request.json()) as RsvpBody;
  const { guests, primary_guest_id, email, phone, note } = body;

  if (!guests || !Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: "No guest data provided" }, { status: 400 });
  }

  // Reject incomplete submissions (every guest must have a yes/no answer and a
  // guest_id). Client-side validation is convenience; this is the real gate.
  const invalid = guests.some(
    (g) => !g.guest_id || g.attending_wedding === null || g.attending_wedding === undefined
  );
  if (invalid) {
    return NextResponse.json(
      { error: "Each guest needs a yes/no response." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const rows = guests.map((g) => ({
    guest_id: g.guest_id,
    attending_wedding: g.attending_wedding,
    attending_rehearsal: g.attending_rehearsal,
    meal_preference: g.meal_preference || null,
    dietary_notes: g.dietary_notes || null,
    plus_one_name: g.plus_one_name || null,
    plus_one_type: g.plus_one_type || null,
    // Contact info and the free-text note live on the primary contact's row.
    rsvp_email: g.guest_id === primary_guest_id ? email || null : null,
    rsvp_phone: g.guest_id === primary_guest_id ? phone || null : null,
    notes: g.guest_id === primary_guest_id ? note || null : null,
    updated_at: now,
  }));

  if (supabase) {
    const { error } = await supabase
      .from("rsvps")
      .upsert(rows, { onConflict: "guest_id" });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save your RSVP. Please try again." },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  }

  // Demo mode — just acknowledge.
  console.log("Demo RSVP submission:", rows);
  return NextResponse.json({ success: true, demo: true });
}
