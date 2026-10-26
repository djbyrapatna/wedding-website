"use client";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, useAdmin } from "@/components/admin/AdminAuthGate";
export function useRsvpSettings() {
  const { canEdit } = useAdmin();
  const [open, setOpen] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/settings")
      .then((r) => r.json())
      .then((body) => {
        if (active) setOpen(body.rsvp_open);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const save = useCallback(
    async (next: boolean) => {
      if (!canEdit) return;
      setSaving(true);
      setError("");
      try {
        await adminFetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rsvp_open: next }),
        });
        setOpen(next);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to update RSVP status.",
        );
      } finally {
        setSaving(false);
      }
    },
    [canEdit],
  );
  return { open, saving, error, save };
}
