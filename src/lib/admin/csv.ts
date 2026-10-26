import type { AdminData } from "./types";
export function rsvpCsv(data: AdminData): string {
  const rsvpById = new Map(data.rsvps.map((r) => [r.guest_id, r]));
  const householdById = new Map(
    data.households.map((h) => [h.household_id, h]),
  );

  const cols = [
    "guest_id",
    "household_id",
    "household_search_name",
    "display_name",
    "first_name",
    "last_name",
    "name_status",
    "guest_type",
    "side",
    "invite_group",
    "tier",
    "is_primary_contact",
    "invited_rehearsal_dinner",
    "plus_one_allowed",
    "attending_wedding",
    "attending_rehearsal",
    "meal_preference",
    "plus_one_name",
    "plus_one_type",
    "dietary_notes",
    "rsvp_email",
    "rsvp_phone",
    "notes",
    "responded_at",
  ];

  const bool = (v: boolean | null | undefined) =>
    v == null ? "" : v ? "yes" : "no";

  const rows = data.guests.map((g) => {
    const r = rsvpById.get(g.guest_id);
    const h = householdById.get(g.household_id);
    const val: Record<string, string | number> = {
      guest_id: g.guest_id,
      household_id: g.household_id,
      household_search_name: h?.search_name ?? "",
      display_name: g.display_name,
      first_name: g.first_name ?? "",
      last_name: g.last_name ?? "",
      name_status: g.name_status,
      guest_type: g.guest_type,
      side: g.side ?? "",
      invite_group: g.invite_group ?? "",
      tier: g.tier ?? "",
      is_primary_contact: g.is_primary_contact ? "Y" : "",
      invited_rehearsal_dinner: g.invited_rehearsal_dinner ? "Y" : "",
      plus_one_allowed: g.plus_one_allowed ?? "",
      attending_wedding: bool(r?.attending_wedding),
      attending_rehearsal: g.invited_rehearsal_dinner
        ? bool(r?.attending_rehearsal)
        : "",
      meal_preference: r?.meal_preference ?? "",
      plus_one_name: r?.plus_one_name ?? "",
      plus_one_type: r?.plus_one_type ?? "",
      dietary_notes: r?.dietary_notes ?? "",
      rsvp_email: r?.rsvp_email ?? "",
      rsvp_phone: r?.rsvp_phone ?? "",
      notes: r?.notes ?? "",
      responded_at: r?.updated_at ?? "",
    };
    return cols.map((c) => `"${String(val[c]).replace(/"/g, '""')}"`);
  });

  return [cols.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(contents: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", contents], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
