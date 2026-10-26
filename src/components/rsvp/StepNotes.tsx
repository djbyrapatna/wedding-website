"use client";

import LabeledInput from "@/components/ui/LabeledInput";

import { Loader2 } from "lucide-react";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepNotesProps {
  guests: GuestRsvpData[];
  email: string;
  phone: string;
  note: string;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setNote: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

const inputClass =
  "mt-2 w-full rounded-lg border border-linen bg-white px-4 py-3 font-sans text-sm text-charcoal outline-none transition-colors placeholder:text-warm-gray/60 focus:border-sage focus:ring-2 focus:ring-sage/20";

export default function StepNotes({
  guests,
  email,
  phone,
  note,
  setEmail,
  setPhone,
  setNote,
  onSubmit,
  onBack,
  submitting,
}: StepNotesProps) {
  const anyAttending = guests.some((g) => g.attending_wedding === true);

  return (
    <div>
      <div className="text-center">
        <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">
          A Few Last Things
        </h2>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          {anyAttending
            ? "Anything else you'd like us to know?"
            : "We're sorry you can't make it — anything you'd like to share?"}
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Shared note to the couple. */}
        <div>
          <label
            htmlFor="rsvp-note"
            className="block font-sans text-sm font-medium text-charcoal"
          >
            Note to the couple
          </label>
          <textarea
            id="rsvp-note"
            maxLength={4000}
            placeholder="Song requests, well wishes, anything else..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Optional contact info, kept on the primary contact. */}
        <div className="rounded-lg border border-linen bg-ivory/50 p-5">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-warm-gray">
            Contact info (optional)
          </p>
          <p className="mt-1 font-sans text-xs text-warm-gray">
            So we can reach you with any updates.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabeledInput
              label="Email"
              type="email"
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <LabeledInput
              label="Phone"
              type="tel"
              maxLength={50}
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button onClick={onBack} className="btn-outline" disabled={submitting}>
          Back
        </button>
        <button
          onClick={onSubmit}
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit RSVP"
          )}
        </button>
      </div>
    </div>
  );
}
