"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepRsvpProps {
  guests: GuestRsvpData[];
  updateGuest: (id: string, updates: Partial<GuestRsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepRsvp({
  guests,
  updateGuest,
  onNext,
  onBack,
}: StepRsvpProps) {
  const [error, setError] = useState("");

  const isPlaceholder = (g: GuestRsvpData) =>
    g.name_status === "PLACEHOLDER_UNKNOWN";

  const handleContinue = () => {
    // Every guest must have an explicit answer.
    if (guests.some((g) => g.attending_wedding === null)) {
      setError("Please respond for each guest before continuing.");
      return;
    }
    // An attending plus-one needs a name.
    if (
      guests.some(
        (g) =>
          isPlaceholder(g) &&
          g.attending_wedding === true &&
          !g.plus_one_name.trim(),
      )
    ) {
      setError(
        "Please enter a name for your guest, or mark them as not attending.",
      );
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">
          Will You Be Joining Us?
        </h2>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          Please respond for each guest in your party.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {guests.map((guest) => (
          <div
            key={guest.guest_id}
            className="rounded-lg border border-linen bg-white p-5"
          >
            {isPlaceholder(guest) ? (
              <div>
                <label className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-warm-gray">
                  Your guest&apos;s name
                </label>
                <input
                  type="text"
                  value={guest.plus_one_name}
                  onChange={(e) =>
                    updateGuest(guest.guest_id, {
                      plus_one_name: e.target.value,
                    })
                  }
                  placeholder="First and last name"
                  className="mt-1.5 w-full rounded-lg border border-linen bg-white px-4 py-2.5 font-serif text-lg text-charcoal outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:text-warm-gray/60 focus:border-sage focus:ring-2 focus:ring-sage/20"
                />
              </div>
            ) : (
              <p className="font-serif text-lg text-charcoal">
                {guest.display_name}
              </p>
            )}

            <div className="mt-3 flex gap-2 sm:gap-3">
              <button
                onClick={() =>
                  updateGuest(guest.guest_id, { attending_wedding: true })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 font-sans text-xs font-medium transition-all sm:gap-2 sm:text-sm",
                  guest.attending_wedding === true
                    ? "border-sage bg-sage text-white"
                    : "border-linen bg-white text-charcoal-light hover:border-sage/50",
                )}
              >
                <Check className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">Accepts</span>
                <span className="hidden sm:inline">Joyfully Accepts</span>
              </button>
              <button
                onClick={() =>
                  updateGuest(guest.guest_id, { attending_wedding: false })
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 font-sans text-xs font-medium transition-all sm:gap-2 sm:text-sm",
                  guest.attending_wedding === false
                    ? "border-charcoal-light bg-charcoal-light text-white"
                    : "border-linen bg-white text-charcoal-light hover:border-charcoal-light/50",
                )}
              >
                <X className="h-4 w-4 shrink-0" />
                <span className="sm:hidden">Declines</span>
                <span className="hidden sm:inline">Regretfully Declines</span>
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
