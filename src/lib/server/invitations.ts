import "server-only";
import { supabase } from "@/lib/supabase";
import type { Invitation } from "@/lib/rsvp/types";

export const PUBLIC_GUEST_FIELDS =
  "guest_id,first_name,last_name,display_name,name_status,guest_type,is_primary_contact,invited_rehearsal_dinner";
const RESPONSE_FIELDS =
  "guest_id,attending_wedding,attending_rehearsal,meal_preference,dietary_notes,rsvp_email,rsvp_phone,notes,plus_one_name,plus_one_type";
export async function loadInvitation(
  householdId: number,
): Promise<Invitation | null> {
  if (!supabase) throw new Error("Invitation database is not configured.");
  const [household, guests] = await Promise.all([
    supabase
      .from("households")
      .select("household_id,search_name")
      .eq("household_id", householdId)
      .maybeSingle(),
    supabase
      .from("guests")
      .select(PUBLIC_GUEST_FIELDS)
      .eq("household_id", householdId)
      .eq("removed", false)
      .order("is_primary_contact", { ascending: false })
      .order("guest_id"),
  ]);
  if (household.error || guests.error)
    throw new Error("Unable to load invitation.");
  if (!household.data || !guests.data?.length) return null;
  const responses = await supabase
    .from("rsvps")
    .select(RESPONSE_FIELDS)
    .in(
      "guest_id",
      guests.data.map((g) => g.guest_id),
    );
  if (responses.error) throw new Error("Unable to load existing responses.");
  return {
    household: household.data,
    guests: guests.data,
    rsvps: responses.data ?? [],
  };
}
