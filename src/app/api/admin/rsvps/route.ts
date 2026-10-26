import { requireAdmin } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Always run fresh — the admin dashboard must reflect live RSVP data.
export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  if (supabase) {
    try {
      const [householdsRes, guestsRes, rsvpsRes] = await Promise.all([
        supabase!.from("households").select("*").order("search_name"),
        supabase!.from("guests").select("*").eq("removed", false).order("guest_id"),
        supabase!.from("rsvps").select("*"),
      ]);

      if (householdsRes.error || guestsRes.error || rsvpsRes.error) {
        // DB reachable but a query failed (e.g. tables not created yet).
        return NextResponse.json({ error: "Unable to load RSVP data." }, { status: 503 });
      }

      return NextResponse.json({
        households: householdsRes.data,
        guests: guestsRes.data,
        rsvps: rsvpsRes.data,
      });
    } catch {
      // Couldn't reach Supabase at all (bad URL/key, project paused, etc.).
      // work — the RSVP list will just be empty until the DB is connected.
      return NextResponse.json({ error: "Unable to reach the database." }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
}
