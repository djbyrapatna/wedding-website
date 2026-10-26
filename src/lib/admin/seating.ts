export type Status = "accepted" | "declined" | "pending";
export type FilterMode = "accepted" | "maybe"; // "maybe" = accepted + not-yet-responded

export type GuestView = {
  id: string;
  name: string;
  side: string | null;
  status: Status;
  meal: string | null; // label
  dietary: boolean;
  householdId: number;
  householdLabel: string;
  typeTag: string; // child/toddler/infant/plus-one
};
