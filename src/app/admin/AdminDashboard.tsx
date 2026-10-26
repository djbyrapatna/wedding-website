"use client";
import { useState } from "react";
import { Download, ClipboardList, ListChecks, Armchair } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminAuthGate";
import AccountsTab from "@/components/admin/AccountsTab";
import ChecklistTab from "@/components/admin/ChecklistTab";
import SeatingTab from "@/components/admin/SeatingTab";
import RsvpReport from "@/components/admin/RsvpReport";
import InvitationCodesTab from "@/components/admin/InvitationCodesTab";
import { useAdminData } from "@/hooks/useAdminData";
import { rsvpCsv, downloadCsv } from "@/lib/admin/csv";
type Tab = "rsvps" | "checklist" | "seating" | "accounts" | "invitations";
export default function AdminDashboard() {
  const { canEdit } = useAdmin();
  const { data, error, loading, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("rsvps");
  const exportCsv = () => {
    if (data) downloadCsv(rsvpCsv(data), "rsvp-responses.csv");
  };
  return (
    <div className="min-h-screen bg-ivory pb-20 pt-8 sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">
              Wedding Admin
            </h1>
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

        {error && (
          <p role="alert" className="mt-4">
            {error}
          </p>
        )}
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

        {canEdit && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-outline" onClick={() => setTab("accounts")}>
              Accounts
            </button>
            <button
              className="btn-outline"
              onClick={() => setTab("invitations")}
            >
              Invitation codes
            </button>
          </div>
        )}
        <button
          className="mt-4 text-sm underline"
          disabled={loading}
          onClick={reload}
        >
          {loading ? "Loading…" : "Refresh data"}
        </button>

        {!loading &&
          !error &&
          data &&
          (tab === "invitations" && canEdit ? (
            <InvitationCodesTab />
          ) : tab === "accounts" && canEdit ? (
            <AccountsTab />
          ) : tab === "checklist" ? (
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
            <RsvpReport data={data} />
          ))}
      </div>
    </div>
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
