"use client";

import { useAdmin } from "./AdminAuthGate";

import { useRsvpSettings } from "@/hooks/useRsvpSettings";
import { Loader2, Lock, Unlock } from "lucide-react";

// Admin control to open/close the public RSVP form. Reads the current state on
// mount and flips it via /api/admin/settings. Closing shows a confirmation so
// it can't happen with a stray click.
export default function RsvpStatusToggle() {
  const { canEdit } = useAdmin();
  const { open, saving, error, save } = useRsvpSettings();

  const toggle = async () => {
    if (!canEdit || open === null || saving) return;
    const next = !open;

    if (
      !next &&
      !window.confirm(
        "Close RSVPs? Guests will see a “RSVPs are closed” message and can no longer submit or edit their response until you reopen it.",
      )
    ) {
      return;
    }

    await save(next);
  };

  if (error)
    return (
      <p role="alert" className="mt-8 text-sm">
        {error}
      </p>
    );
  if (!canEdit)
    return (
      <p className="mt-8 text-sm">
        RSVP status: {open === null ? "Loading…" : open ? "Open" : "Closed"}
      </p>
    );

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-lg border border-linen bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            open === false ? "bg-gold/10" : "bg-sage/10"
          }`}
        >
          {open === false ? (
            <Lock className="h-5 w-5 text-gold" />
          ) : (
            <Unlock className="h-5 w-5 text-sage" />
          )}
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-charcoal">
            Public RSVP form
          </p>
          <p className="mt-0.5 font-sans text-xs text-warm-gray">
            {open === null
              ? "Checking status…"
              : open
                ? "Open — guests can submit and edit their responses."
                : "Closed — guests see a “RSVPs are closed” message."}
          </p>
        </div>
      </div>

      <button
        onClick={toggle}
        disabled={open === null || saving}
        className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-sans text-sm font-medium transition-colors disabled:opacity-60 ${
          open === false
            ? "bg-sage text-white hover:bg-sage-dark"
            : "border border-charcoal-light/30 text-charcoal hover:bg-ivory"
        }`}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : open === false ? (
          <>
            <Unlock className="h-4 w-4" />
            Reopen RSVPs
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Close RSVPs
          </>
        )}
      </button>
    </div>
  );
}
