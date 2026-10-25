import { requireAdmin } from "@/lib/server/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Always run fresh — seating edits must reflect immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;



// GET — return every table and every assignment.
// and the feature still works in local development.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;

  if (!supabase) {
    return NextResponse.json({ error: "Unable to load seating." }, { status: 503 });
  }

  try {
    const [tablesRes, assignmentsRes] = await Promise.all([
      supabase!.from("seating_tables").select("*").order("sort_order"),
      supabase!.from("seating_assignments").select("*"),
    ]);

    if (tablesRes.error || assignmentsRes.error) {
      return NextResponse.json({ error: "Unable to load seating." }, { status: 503 });
    }

    return NextResponse.json({
      tables: tablesRes.data,
      assignments: assignmentsRes.data,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load seating." }, { status: 503 });
  }
}

// POST — a single action-based endpoint keeps all mutations in one place.
// Body: { action, ...payload }
//   upsertTable  { table: { id?, name, pos_x, pos_y, capacity, sort_order } }
//   deleteTable  { id }            (assignments cascade away with the table)
//   assign       { guest_id, table_id, seat_index? }
//   unassign     { guest_id }
type Body =
  | { action: "upsertTable"; table: Record<string, unknown> }
  | { action: "deleteTable"; id: string }
  | { action: "assign"; guest_id: string; table_id: string; seat_index?: number | null }
  | { action: "unassign"; guest_id: string };

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request, true);
  if (auth.response) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!supabase) {
    return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
  }

  try {
    switch (body.action) {
      case "upsertTable": {
        const { data, error } = await supabase!
          .from("seating_tables")
          .upsert(body.table as never)
          .select()
          .single();
        if (error) return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
        return NextResponse.json({ ok: true, table: data });
      }

      case "deleteTable": {
        const { error } = await supabase!
          .from("seating_tables")
          .delete()
          .eq("id", body.id);
        if (error) return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
        return NextResponse.json({ ok: true });
      }

      case "assign": {
        const { error } = await supabase!.from("seating_assignments").upsert(
          {
            guest_id: body.guest_id,
            table_id: body.table_id,
            seat_index: body.seat_index ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "guest_id" }
        );
        if (error) return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
        return NextResponse.json({ ok: true });
      }

      case "unassign": {
        const { error } = await supabase!
          .from("seating_assignments")
          .delete()
          .eq("guest_id", body.guest_id);
        if (error) return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Unable to save changes." }, { status: 503 });
  }
}
