"use client";

import { Users } from "lucide-react";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepPartyProps {
  label: string;
  guests: GuestRsvpData[];
  onNext: () => void;
  onBack: () => void;
}

export default function StepParty({
  label,
  guests,
  onNext,
  onBack,
}: StepPartyProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
        <Users className="h-6 w-6 text-sage" />
      </div>

      <h2 className="mt-5 font-serif text-3xl text-charcoal sm:text-4xl">
        {label}
      </h2>
      <p className="mt-2 font-sans text-sm text-charcoal-light">
        We found your invitation! Please confirm these are the right guests.
      </p>

      <div className="mt-8 space-y-3">
        {guests.map((guest) => (
          <div
            key={guest.guest_id}
            className="flex items-center justify-between rounded-lg border border-linen bg-white px-5 py-4 text-left"
          >
            <span className="font-serif text-lg text-charcoal">
              {guest.name_status === "PLACEHOLDER_UNKNOWN"
                ? "Your guest (plus-one)"
                : guest.display_name}
            </span>
            {guest.name_status === "PLACEHOLDER_UNKNOWN" && (
              <span className="font-sans text-xs uppercase tracking-[0.15em] text-warm-gray">
                Name added next
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button onClick={onBack} className="btn-outline">
          Not Me
        </button>
        <button onClick={onNext} className="btn-primary">
          That&apos;s Us!
        </button>
      </div>
    </div>
  );
}
