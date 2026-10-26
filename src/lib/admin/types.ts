import type {
  Guest,
  Household,
  Rsvp,
  AdminAccountRow,
} from "@/lib/database.types";
export type AdminData = {
  households: Household[];
  guests: Guest[];
  rsvps: Rsvp[];
};

export type AdminRole = AdminAccountRow["role"];
export type AdminProfile = Omit<AdminAccountRow, "created_at">;
