"use client";

import { useState } from "react";
import { Check, X, Wine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepRehearsalProps {
  guests: GuestRsvpData[];
  updateGuest: (id: string, updates: Partial<GuestRsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Separate RSVP for the rehearsal dinner — attendance only, no meal choice.
// Shown only to guests invited to the rehearsal dinner.
export default function StepRehearsal({
  guests,
  updateGuest,
  onNext,
  onBack,
}: StepRehearsalProps) {
  const [error, setError] = useState("");
  const invited = guests.filter((g) => g.invited_rehearsal_dinner);

  const nameFor = (g: GuestRsvpData) =>
    g.name_status === "PLACEHOLDER_UNKNOWN"
      ? g.plus_one_name.trim() || "Your guest"
      : g.display_name;

  const handleContinue = () => {
    if (invited.some((g) => g.attending_rehearsal === null)) {
      setError("Please respond for each guest before continuing.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
          <Wine className="h-6 w-6 text-gold" />
        </div>
        <h2 className="mt-5 font-serif text-3xl text-charcoal sm:text-4xl">
          Rehearsal Dinner
        </h2>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          You&apos;re invited to join us the evening before. Will you be there?
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {invited.map((guest) => (
          <div
            key={guest.guest_id}
            className="rounded-lg border border-linen bg-white p-5"
          >
            <p className="font-serif text-lg text-charcoal">{nameFor(guest)}</p>
            <div className="mt-3 flex gap-2 sm:gap-3">
              <button
                onClick={() =>
                  updateGuest(guest.guest_id, { attending_rehearsal: true })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 font-sans text-xs font-medium transition-all sm:gap-2 sm:text-sm",
                  guest.attending_rehearsal === true
                    ? "border-sage bg-sage text-white"
                    : "border-linen bg-white text-charcoal-light hover:border-sage/50",
                )}
              >
                <Check className="h-4 w-4 shrink-0" />
                Attending
              </button>
              <button
                onClick={() =>
                  updateGuest(guest.guest_id, { attending_rehearsal: false })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 font-sans text-xs font-medium transition-all sm:gap-2 sm:text-sm",
                  guest.attending_rehearsal === false
                    ? "border-charcoal-light bg-charcoal-light text-white"
                    : "border-linen bg-white text-charcoal-light hover:border-charcoal-light/50",
                )}
              >
                <X className="h-4 w-4 shrink-0" />
                Can&apos;t Make It
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-center font-sans text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="mt-10 flex items-center justify-center gap-4">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <button onClick={handleContinue} className="btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
}
