"use client";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Wine,
  Utensils,
} from "lucide-react";
import type { Guest } from "@/lib/database.types";
import type { AdminData } from "@/lib/admin/types";
import { ADULT_ENTREES, KIDS_MEALS, ALTERNATIVE_MEAL } from "@/config/menu";
import RsvpStatusToggle from "./RsvpStatusToggle";
const MEAL_LABELS: Record<string, string> = Object.fromEntries(
  [...ADULT_ENTREES, ...KIDS_MEALS, ALTERNATIVE_MEAL].map((m) => [
    m.value,
    m.label,
  ]),
);

export default function RsvpReport({ data }: { data: AdminData | null }) {
  const guests = data?.guests ?? [];
  const households = data?.households ?? [];
  const rsvps = data?.rsvps ?? [];

  const rsvpById = new Map(rsvps.map((r) => [r.guest_id, r]));
  const householdById = new Map(households.map((h) => [h.household_id, h]));

  const statusOf = (g: Guest): "accepted" | "declined" | "pending" => {
    const r = rsvpById.get(g.guest_id);
    if (!r || r.attending_wedding == null) return "pending";
    return r.attending_wedding ? "accepted" : "declined";
  };

  // Household display label: a deliberately-set party name (the stored
  // search_name already ending in "Party", e.g. "Dickman and Geneslaw Party")
  // wins as an override; otherwise default to the primary contact's last name
  // + " Party" (e.g. "Milligan Party"), falling back to the raw stored name.
  const householdLabel = (hid: number): string => {
    const primary = guests.find(
      (g) => g.household_id === hid && g.is_primary_contact,
    );
    const last = primary?.last_name?.trim();
    const stored = householdById.get(hid)?.search_name?.trim();
    if (stored && /party$/i.test(stored)) return stored;
    if (last) return `${last} Party`;
    return stored ?? "—";
  };

  const accepted = guests.filter((g) => statusOf(g) === "accepted");
  const declined = guests.filter((g) => statusOf(g) === "declined");
  const pending = guests.filter((g) => statusOf(g) === "pending");
  const responded = guests.filter((g) => rsvpById.has(g.guest_id));

  // Rehearsal dinner tallies.
  const rehearsalInvited = guests.filter((g) => g.invited_rehearsal_dinner);
  const rehearsalYes = rehearsalInvited.filter(
    (g) => rsvpById.get(g.guest_id)?.attending_rehearsal === true,
  );

  // Meal counts among attending guests.
  const mealCounts = new Map<string, number>();
  for (const g of accepted) {
    const meal = rsvpById.get(g.guest_id)?.meal_preference;
    if (meal) mealCounts.set(meal, (mealCounts.get(meal) ?? 0) + 1);
  }

  // One place to derive a guest's display values, shared by the desktop table
  // and the mobile card list.
  const rowView = (guest: Guest) => {
    const r = rsvpById.get(guest.guest_id);
    const isPlaceholder = guest.name_status === "PLACEHOLDER_UNKNOWN";
    const name = isPlaceholder
      ? r?.plus_one_name || "Unnamed plus-one"
      : guest.display_name;
    const typeTag = isPlaceholder
      ? `plus-one${r?.plus_one_type ? `, ${r.plus_one_type}` : ""}`
      : guest.guest_type !== "adult"
        ? guest.guest_type
        : "";
    const meal = r?.meal_preference
      ? (MEAL_LABELS[r.meal_preference] ?? r.meal_preference)
      : "—";
    const rehearsal = !guest.invited_rehearsal_dinner
      ? "—"
      : r?.attending_rehearsal == null
        ? "pending"
        : r.attending_rehearsal
          ? "Yes"
          : "No";
    const dietary = r?.dietary_notes || "—";
    const notes = r?.notes || "—";
    const contact =
      [r?.rsvp_email, r?.rsvp_phone].filter(Boolean).join(" · ") || "—";
    return {
      name,
      typeTag,
      household: householdLabel(guest.household_id),
      status: statusOf(guest),
      meal,
      rehearsal,
      dietary,
      notes,
      contact,
    };
  };

  // Group guests by household for the mobile "card per party" view, preserving
  // the order households first appear in.
  const partyOrder: number[] = [];
  const guestsByParty = new Map<number, Guest[]>();
  for (const g of guests) {
    if (!guestsByParty.has(g.household_id)) {
      guestsByParty.set(g.household_id, []);
      partyOrder.push(g.household_id);
    }
    guestsByParty.get(g.household_id)!.push(g);
  }

  return (
    <>
      <RsvpStatusToggle />

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-sage" />}
          label="Total Guests"
          value={guests.length}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-sage" />}
          label="Accepted"
          value={accepted.length}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-charcoal-light" />}
          label="Declined"
          value={declined.length}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-gold" />}
          label="Pending"
          value={pending.length}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Response Rate */}
        <div className="rounded-lg border border-linen bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="font-sans text-sm font-medium text-charcoal">
              Response Rate
            </span>
            <span className="font-sans text-sm font-semibold text-sage">
              {guests.length > 0
                ? Math.round((responded.length / guests.length) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-linen">
            <div
              className="h-full bg-sage transition-all"
              style={{
                width: `${guests.length > 0 ? (responded.length / guests.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="mt-2 font-sans text-xs text-warm-gray">
            {responded.length} of {guests.length} guests have responded
          </p>
        </div>

        {/* Reception meal counts (NOT the rehearsal dinner) */}
        <div className="rounded-lg border border-linen bg-white p-5">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-sage" />
            <span className="font-sans text-sm font-medium text-charcoal">
              Reception Meals
            </span>
          </div>
          {mealCounts.size > 0 ? (
            <div className="mt-3 space-y-1">
              {Array.from(mealCounts.entries()).map(([meal, count]) => (
                <div
                  key={meal}
                  className="flex items-center justify-between font-sans text-xs text-charcoal-light"
                >
                  <span>{MEAL_LABELS[meal] ?? meal}</span>
                  <span className="font-semibold text-charcoal">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 font-sans text-xs text-warm-gray">
              No meal selections yet
            </p>
          )}
        </div>

        {/* Rehearsal dinner — attendance only, no meal */}
        <div className="rounded-lg border border-linen bg-white p-5">
          <div className="flex items-center gap-2">
            <Wine className="h-4 w-4 text-gold" />
            <span className="font-sans text-sm font-medium text-charcoal">
              Rehearsal Dinner
            </span>
          </div>
          <p className="mt-1 font-serif text-2xl text-charcoal">
            {rehearsalYes.length}
            <span className="font-sans text-sm text-warm-gray">
              {" "}
              of {rehearsalInvited.length} invited
            </span>
          </p>
          <p className="mt-1 font-sans text-xs italic text-warm-gray">
            Attendance only — no meal selection
          </p>
        </div>
      </div>

      {/* Table */}
      <p className="mt-8 font-sans text-xs text-warm-gray">
        “Reception” is the wedding-day RSVP and meal. “Rehearsal” is a separate
        yes/no — the rehearsal dinner has no meal selection.
      </p>
      {/* Desktop: full table */}
      <div className="mt-2 hidden max-h-[70vh] overflow-auto rounded-lg border border-linen bg-white md:block">
        <table className="w-full min-w-[980px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-ivory">
              {[
                "Guest",
                "Household",
                "Reception",
                "Reception Meal",
                "Rehearsal",
                "Dietary",
                "Notes",
                "Contact",
              ].map((h) => (
                <th
                  key={h}
                  className="border-b border-linen bg-ivory px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-warm-gray"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-linen">
            {guests.map((guest) => {
              const v = rowView(guest);
              return (
                <tr key={guest.guest_id} className="hover:bg-ivory/50">
                  <td className="px-4 py-3 font-sans text-sm text-charcoal">
                    {v.name}
                    {v.typeTag && (
                      <span className="ml-1.5 text-xs text-warm-gray">
                        ({v.typeTag})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.household}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.meal}
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.rehearsal}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.dietary}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.notes}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-sans text-sm text-charcoal-light">
                    {v.contact}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per party, each member's results nested inside */}
      <div className="mt-2 space-y-3 md:hidden">
        {partyOrder.map((hid) => {
          const members = guestsByParty.get(hid)!;
          const respondedCount = members.filter((g) =>
            rsvpById.has(g.guest_id),
          ).length;
          return (
            <div
              key={hid}
              className="overflow-hidden rounded-lg border border-linen bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-linen bg-ivory px-4 py-2.5">
                <p className="min-w-0 break-words font-serif text-base text-charcoal">
                  {householdLabel(hid)}
                </p>
                <span className="shrink-0 font-sans text-xs text-warm-gray">
                  {respondedCount}/{members.length} responded
                </span>
              </div>

              <div className="divide-y divide-linen">
                {members.map((guest) => {
                  const v = rowView(guest);
                  return (
                    <div key={guest.guest_id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-words font-sans text-sm font-medium text-charcoal">
                          {v.name}
                          {v.typeTag && (
                            <span className="ml-1.5 text-xs font-normal text-warm-gray">
                              ({v.typeTag})
                            </span>
                          )}
                        </p>
                        <StatusBadge status={v.status} />
                      </div>

                      <dl className="mt-2 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 font-sans text-xs">
                        <dt className="text-warm-gray">Meal</dt>
                        <dd className="text-charcoal-light">{v.meal}</dd>
                        <dt className="text-warm-gray">Rehearsal</dt>
                        <dd className="text-charcoal-light">{v.rehearsal}</dd>
                        {v.dietary !== "—" && (
                          <>
                            <dt className="text-warm-gray">Dietary</dt>
                            <dd className="break-words text-charcoal-light">
                              {v.dietary}
                            </dd>
                          </>
                        )}
                        {v.notes !== "—" && (
                          <>
                            <dt className="text-warm-gray">Notes</dt>
                            <dd className="break-words text-charcoal-light">
                              {v.notes}
                            </dd>
                          </>
                        )}
                        {v.contact !== "—" && (
                          <>
                            <dt className="text-warm-gray">Contact</dt>
                            <dd className="break-words text-charcoal-light">
                              {v.contact}
                            </dd>
                          </>
                        )}
                      </dl>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-linen bg-white p-5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-sans text-xs uppercase tracking-wider text-warm-gray">
          {label}
        </span>
      </div>
      <p className="mt-2 font-serif text-3xl text-charcoal">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    accepted: "bg-sage/10 text-sage",
    declined: "bg-charcoal-light/10 text-charcoal-light",
    pending: "bg-gold/10 text-gold",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-sans text-xs font-medium capitalize ${styles[status as keyof typeof styles] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
