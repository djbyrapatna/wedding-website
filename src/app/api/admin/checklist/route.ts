import { requireAdmin } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


type ItemState = { checked: boolean; notes: string };
type StateMap = Record<string, ItemState>;


// GET — return the saved state for every touched checklist item.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  if (!supabase) {
    return NextResponse.json({ error: "Unable to load checklist." }, { status: 503 });
  }

  try {
    const { data, error } = await supabase!.from("checklist_items").select("*");

    if (error) {
      return NextResponse.json({ error: "Unable to load checklist." }, { status: 503 });
    }

    const items: StateMap = {};
    for (const row of data) {
      items[row.item_id] = { checked: row.checked, notes: row.notes ?? "" };
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Unable to load checklist." }, { status: 503 });
  }
}

// POST — upsert the state for a single item.
// Body: { item_id: string, checked: boolean, notes: string }
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, true);
  if (auth.response) return auth.response;

  let body: Partial<{ item_id: string; checked: boolean; notes: string }>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { item_id, checked, notes } = body;
  if (typeof item_id !== "string" || typeof checked !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
  }

  try {
    const { error } = await supabase!.from("checklist_items").upsert(
      {
        item_id,
        checked,
        notes: notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "item_id" }
    );

    if (error) {
      return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
  }
}
