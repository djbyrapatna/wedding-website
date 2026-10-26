"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "./AdminAuthGate";
import type { AdminProfile as Account } from "@/lib/admin/types";
export default function AccountsTab() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const res = await adminFetch("/api/admin/accounts");
    setAccounts((await res.json()).accounts);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function save(body: object) {
    setBusy(true);
    setError("");
    try {
      await adminFetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await load();
      setEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-8 space-y-5">
      <h2 className="font-serif text-2xl">Dashboard accounts</h2>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void save({ action: "invite", email, role });
        }}
      >
        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ml-2 rounded border p-2"
          />
        </label>
        <label>
          Role
          <select
            aria-label="Invitation role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="ml-2 rounded border p-2"
          >
            <option value="viewer">View only</option>
            <option value="owner">Owner</option>
          </select>
        </label>
        <button className="btn-primary" disabled={busy}>
          Invite account
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {accounts.map((a) => (
        <div
          key={a.user_id}
          className="flex flex-wrap items-center gap-3 rounded border p-4"
        >
          <span className="min-w-0 break-all">{a.email}</span>
          <select
            aria-label={`Role for ${a.email}`}
            disabled={busy}
            value={a.role}
            onChange={(e) =>
              void save({
                action: "update",
                user_id: a.user_id,
                role: e.target.value,
                active: a.active,
              })
            }
          >
            <option value="owner">Owner</option>
            <option value="viewer">View only</option>
          </select>
          <button
            className="underline"
            disabled={busy}
            onClick={() =>
              void save({
                action: "update",
                user_id: a.user_id,
                role: a.role,
                active: !a.active,
              })
            }
          >
            {a.active ? "Revoke access" : "Restore access"}
          </button>
        </div>
      ))}
    </section>
  );
}
