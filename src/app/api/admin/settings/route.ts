import { requireAdmin } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { getRsvpOpen, setRsvpOpen } from "@/lib/settings";


// Read fresh — the toggle must always reflect (and set) live state.
export const dynamic = "force-dynamic";


// GET — current site settings for the admin dashboard.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ rsvp_open: await getRsvpOpen() });
}

// POST — update a setting. Body: { rsvp_open: boolean }
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, true);
  if (auth.response) return auth.response;

  let body: Partial<{ rsvp_open: boolean }>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof body.rsvp_open !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const ok = await setRsvpOpen(body.rsvp_open);
  if (!ok) {
    return NextResponse.json(
      { error: "Failed to save. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, rsvp_open: body.rsvp_open });
}
