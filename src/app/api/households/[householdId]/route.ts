import { NextRequest, NextResponse } from "next/server";
import { invitationHousehold } from "@/lib/server/invitation-auth";
import { loadInvitation } from "@/lib/server/invitations";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(
  _request: NextRequest,
  { params }: { params: { householdId: string } },
) {
  const id = Number(params.householdId);
  if (!Number.isInteger(id))
    return NextResponse.json({ error: "Invalid household." }, { status: 400 });
  const session = invitationHousehold();
  if (session === null)
    return NextResponse.json(
      { error: "Please find your invitation again." },
      { status: 401 },
    );
  if (session !== id)
    return NextResponse.json(
      { error: "This invitation belongs to another household." },
      { status: 403 },
    );
  try {
    const invitation = await loadInvitation(id);
    return invitation
      ? NextResponse.json(invitation, {
          headers: { "Cache-Control": "private, no-store" },
        })
      : NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Unable to load invitation." },
      { status: 503 },
    );
  }
}
