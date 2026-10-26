"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "./AdminAuthGate";
import { downloadCsv } from "@/lib/admin/csv";
type Household = {
  household_id: number;
  search_name: string;
  has_code: boolean;
};
type Generated = { household_id: number; search_name: string; code: string };
const csvCell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
export default function InvitationCodesTab() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [generated, setGenerated] = useState<Generated[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const res = await adminFetch("/api/admin/invitations");
    setHouseholds((await res.json()).households);
  }
  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, []);
  async function generate(householdId?: number) {
    if (
      householdId !== undefined &&
      !window.confirm(
        "Replace this invitation code? Its previous code will stop working. Download the new code before leaving this tab.",
      )
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const res = await adminFetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          householdId === undefined
            ? { action: "generate-missing" }
            : { action: "replace", household_id: householdId },
        ),
      });
      const body = await res.json();
      setGenerated((previous) => [
        ...previous.filter(
          (p) =>
            !body.generated.some(
              (g: Generated) => g.household_id === p.household_id,
            ),
        ),
        ...body.generated,
      ]);
      setMessage(
        `${body.generated.length} codes generated.${body.failed ? ` ${body.failed} could not be saved; retry those households.` : ""} Download them before leaving this tab.`,
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to generate codes.");
    } finally {
      setBusy(false);
    }
  }
  function download() {
    downloadCsv(
      [
        "household_id,household_name,invitation_code",
        ...generated.map((g) =>
          [g.household_id, g.search_name, g.code].map(csvCell).join(","),
        ),
      ].join("\r\n"),
      "invitation-codes.csv",
    );
  }
  return (
    <section className="mt-8 space-y-4">
      <h2 className="font-serif text-2xl">Invitation codes</h2>
      <p className="text-sm">
        Generate a code for each household to print on its invitation. Guests
        can also find their invitation by name.
      </p>
      <p className="text-sm">
        Codes are only available to download immediately after generation.
        Download them before leaving this tab. Replace a code if you lose it.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => void generate()}
        >
          Generate missing codes
        </button>
        <button
          className="btn-outline"
          disabled={!generated.length}
          onClick={download}
        >
          Download generated codes
        </button>
      </div>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      {households.map((h) => (
        <div
          key={h.household_id}
          className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
        >
          <span>
            {h.search_name} · {h.has_code ? "Code ready" : "No code"}
          </span>
          <button
            className="underline"
            disabled={busy}
            onClick={() => void generate(h.household_id)}
          >
            {h.has_code ? "Replace code" : "Generate code"}
          </button>
        </div>
      ))}
    </section>
  );
}
