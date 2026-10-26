"use client";

import { useAdmin, adminFetch } from "@/components/admin/AdminAuthGate";
import AccountsTab from "@/components/admin/AccountsTab";

import { useState, useEffect } from "react";
import {
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Wine,
  Utensils,
  ClipboardList,
  ListChecks,
  Armchair,
} from "lucide-react";
import type { Guest, Household, Rsvp } from "@/lib/database.types";
import { ADULT_ENTREES, KIDS_MEALS, ALTERNATIVE_MEAL } from "@/lib/constants";
import ChecklistTab from "@/components/admin/ChecklistTab";
import SeatingTab from "@/components/admin/SeatingTab";
import RsvpStatusToggle from "@/components/admin/RsvpStatusToggle";

type Tab = "rsvps" | "checklist" | "seating" | "accounts";

type AdminData = {
  households: Household[];
  guests: Guest[];
  rsvps: Rsvp[];
  demo?: boolean;
  dbError?: boolean;
  detail?: string;
};

const MEAL_LABELS: Record<string, string> = Object.fromEntries(
  [...ADULT_ENTREES, ...KIDS_MEALS, ALTERNATIVE_MEAL].map((m) => [m.value, m.label])
);

export default function AdminDashboard() {
  const { canEdit } = useAdmin();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("rsvps");
  useEffect(() => {
    adminFetch("/api/admin/rsvps").then(r => r.json()).then(setData).catch(e => setError(e.message));
  }, []);

  // CSV columns mirror the database (guests + rsvps) so the export is easy to
  // read against the schema and edit. Imported guest fields first, then the
  // response fields. Booleans render as Y/yes to match the spreadsheet style.
  const exportCsv = () => {
    if (!data) return;
    const rsvpById = new Map(data.rsvps.map((r) => [r.guest_id, r]));
    const householdById = new Map(data.households.map((h) => [h.household_id, h]));

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
        attending_rehearsal: g.invited_rehearsal_dinner ? bool(r?.attending_rehearsal) : "",
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

    const csv = [cols.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvp-responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ivory pb-20 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">
              Wedding Admin
            </h1>
            {data?.demo && (
              <span className="mt-1 inline-block rounded-full bg-gold/10 px-3 py-1 font-sans text-xs font-medium text-gold">
                Demo Mode
              </span>
            )}
          </div>
          {tab === "rsvps" && (
            <button
              onClick={exportCsv}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        {error && <p role="alert" className="mt-4">{error}</p>}
        <div className="mt-6 flex gap-1 border-b border-linen">
          <TabButton
            active={tab === "rsvps"}
            onClick={() => setTab("rsvps")}
            icon={<ClipboardList className="h-4 w-4" />}
            label="RSVPs"
          />
          <TabButton
            active={tab === "checklist"}
            onClick={() => setTab("checklist")}
            icon={<ListChecks className="h-4 w-4" />}
            label="Checklist"
          />
          <TabButton
            active={tab === "seating"}
            onClick={() => setTab("seating")}
            icon={<Armchair className="h-4 w-4" />}
            label="Seating"
          />
        </div>

        {canEdit && <button className="btn-outline mt-4" onClick={() => setTab("accounts")}>Accounts</button>}

        {tab === "accounts" && canEdit ? <AccountsTab /> : tab === "checklist" ? (
          <div className="mt-8">
            <ChecklistTab />
          </div>
        ) : tab === "seating" ? (
          <div className="mt-8">
            <SeatingTab
             
              guests={data?.guests ?? []}
              households={data?.households ?? []}
              rsvps={data?.rsvps ?? []}
            />
          </div>
        ) : (
          <RsvpPanel data={data} />
        )}
      </div>
    </div>
  );
}

function RsvpPanel({
  data,
}: {
  data: AdminData | null;
}) {
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
    const primary = guests.find((g) => g.household_id === hid && g.is_primary_contact);
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
    (g) => rsvpById.get(g.guest_id)?.attending_rehearsal === true
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
      ? MEAL_LABELS[r.meal_preference] ?? r.meal_preference
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
              {["Guest", "Household", "Reception", "Reception Meal", "Rehearsal", "Dietary", "Notes", "Contact"].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-linen bg-ivory px-4 py-3 text-left font-sans text-xs font-semibold uppercase tracking-wider text-warm-gray"
                  >
                    {h}
                  </th>
                )
              )}
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
                      <span className="ml-1.5 text-xs text-warm-gray">({v.typeTag})</span>
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
            rsvpById.has(g.guest_id)
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

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 font-sans text-sm font-medium transition-colors ${
        active
          ? "border-sage text-sage"
          : "border-transparent text-warm-gray hover:text-charcoal"
      }`}
    >
      {icon}
      {label}
    </button>
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
