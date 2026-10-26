import type {
  Guest,
  Household,
  Rsvp,
  NameStatus,
  GuestType,
} from "@/lib/database.types";

export type InvitationHousehold = Pick<
  Household,
  "household_id" | "search_name"
>;
export type InvitationGuest = Pick<
  Guest,
  | "guest_id"
  | "first_name"
  | "last_name"
  | "display_name"
  | "name_status"
  | "guest_type"
  | "is_primary_contact"
  | "invited_rehearsal_dinner"
>;
export type InvitationResponse = Omit<Rsvp, "submitted_at" | "updated_at">;
export type Invitation = {
  household: InvitationHousehold;
  guests: InvitationGuest[];
  rsvps: InvitationResponse[];
};
export type GuestResult = { guest_id: string; display_name: string };
export interface GuestRsvpData {
  guest_id: string;
  display_name: string;
  name_status: NameStatus;
  guest_type: GuestType;
  is_primary_contact: boolean;
  invited_rehearsal_dinner: boolean;
  attending_wedding: boolean | null;
  attending_rehearsal: boolean | null;
  meal_preference: string;
  dietary_notes: string;
  plus_one_name: string;
  plus_one_type: string;
}
export type RsvpSubmission = {
  primary_guest_id?: string;
  email?: string | null;
  phone?: string | null;
  note?: string | null;
  guests: Array<
    Pick<
      GuestRsvpData,
      "guest_id" | "attending_wedding" | "attending_rehearsal"
    > & {
      meal_preference: string | null;
      dietary_notes: string | null;
      plus_one_name: string | null;
      plus_one_type: string | null;
    }
  >;
};
