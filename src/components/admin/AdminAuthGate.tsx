"use client";

import LabeledInput from "@/components/ui/LabeledInput";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { AdminProfile as Account } from "@/lib/admin/types";

const AdminContext = createContext<{
  account: Account;
  canEdit: boolean;
} | null>(null);
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("Admin components require an authenticated account.");
  return context;
}

// Every admin request uses this helper, including session-expiration handling.
export async function adminFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (res.status === 401 || res.status === 403)
    window.dispatchEvent(new Event("admin-session-expired"));
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Unable to complete this request.");
  }
  return res;
}

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tokens, setTokens] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("access_token") && hash.get("refresh_token")) {
      setTokens({
        access_token: hash.get("access_token")!,
        refresh_token: hash.get("refresh_token")!,
      });
      window.history.replaceState(null, "", window.location.pathname);
      setChecking(false);
      return;
    }
    if (hash.get("error_description")) {
      setMessage(hash.get("error_description")!);
      window.history.replaceState(null, "", window.location.pathname);
    }
    fetch("/api/admin/auth", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok) setAccount(body.account);
        else if (res.status !== 401)
          setMessage(body.error ?? "Unable to sign in.");
      })
      .catch(() => setMessage("Unable to reach the server."))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    const expired = () => {
      setAccount(null);
      setPassword("");
      setMessage("Your session or permissions changed. Please sign in again.");
    };
    window.addEventListener("admin-session-expired", expired);
    return () => window.removeEventListener("admin-session-expired", expired);
  }, []);

  async function authenticate(recover = false) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          recover
            ? { action: "recover", email }
            : tokens
              ? { action: "set-password", password, ...tokens }
              : { email, password },
        ),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      if (recover) setMessage(body.message);
      else {
        const current = await fetch("/api/admin/auth", { cache: "no-store" });
        const session = await current.json();
        if (!current.ok) throw new Error(session.error);
        setAccount(session.account);
        setTokens(null);
        setPassword("");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  if (checking)
    return (
      <p className="px-6 pb-12 pt-32" role="status">
        Checking account…
      </p>
    );
  if (!account)
    return (
      <section className="mx-auto min-h-screen max-w-md px-6 pb-16 pt-32">
        <h1 className="font-serif text-3xl">
          {tokens ? "Set your password" : "Wedding dashboard"}
        </h1>
        <p className="mt-3 text-sm">
          {tokens
            ? "Choose a password of at least 12 characters."
            : "Sign in with your invited account."}
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void authenticate();
          }}
        >
          {!tokens && (
            <LabeledInput
              label="Email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <LabeledInput
            label="Password"
            type="password"
            autoComplete={tokens ? "new-password" : "current-password"}
            required
            minLength={12}
            maxLength={256}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-primary" disabled={busy}>
            {busy ? "Please wait…" : tokens ? "Save password" : "Sign in"}
          </button>
          {!tokens && (
            <button
              type="button"
              className="ml-4 underline"
              disabled={busy || !email}
              onClick={() => void authenticate(true)}
            >
              Reset password
            </button>
          )}
          {message && (
            <p role="alert" className="text-sm text-charcoal">
              {message}
            </p>
          )}
        </form>
      </section>
    );
  return (
    <AdminContext.Provider
      value={{ account, canEdit: account.role === "owner" }}
    >
      <div className="flex flex-wrap items-center justify-end gap-3 bg-cream px-6 pt-24 text-sm">
        <span>
          {account.email} · {account.role === "owner" ? "Owner" : "View only"}
        </span>
        <button
          className="underline"
          onClick={async () => {
            try {
              await adminFetch("/api/admin/auth", { method: "DELETE" });
              setAccount(null);
            } catch (e) {
              setMessage(String(e));
            }
          }}
        >
          Sign out
        </button>
      </div>
      {children}
    </AdminContext.Provider>
  );
}
