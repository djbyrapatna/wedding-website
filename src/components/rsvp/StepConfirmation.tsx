"use client";

import { RSVP_COPY } from "@/config/rsvp";

import { motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import Link from "next/link";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepConfirmationProps {
  guests: GuestRsvpData[];
  searchName: string;
}

export default function StepConfirmation({
  guests,
  searchName,
}: StepConfirmationProps) {
  const anyAccepted = guests.some((g) => g.attending_wedding === true);
  const anyRehearsal = guests.some(
    (g) => g.invited_rehearsal_dinner && g.attending_rehearsal === true,
  );

  const nameFor = (g: GuestRsvpData) =>
    g.name_status === "PLACEHOLDER_UNKNOWN"
      ? g.plus_one_name.trim() || "Your guest"
      : g.display_name;

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="mt-8 font-serif text-3xl text-charcoal sm:text-4xl">
          {anyAccepted ? RSVP_COPY.acceptedTitle : RSVP_COPY.declinedTitle}
        </h2>

        <div className="divider-gold mt-2" />

        {anyAccepted ? (
          <p className="mt-4 font-serif text-lg text-charcoal-light">
            {RSVP_COPY.acceptedMessage(searchName)}
          </p>
        ) : (
          <p className="mt-4 font-serif text-lg text-charcoal-light">
            {RSVP_COPY.declinedMessage(searchName)}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mx-auto mt-8 max-w-sm"
      >
        <div className="rounded-lg border border-linen bg-white p-6">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-warm-gray">
            Your Response
          </p>
          <div className="mt-4 space-y-2">
            {guests.map((guest) => (
              <div
                key={guest.guest_id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-charcoal">{nameFor(guest)}</span>
                <span
                  className={
                    guest.attending_wedding === true
                      ? "font-medium text-sage"
                      : "text-warm-gray"
                  }
                >
                  {guest.attending_wedding === true
                    ? "Attending"
                    : "Not Attending"}
                </span>
              </div>
            ))}
          </div>

          {anyRehearsal && (
            <div className="mt-4 border-t border-linen pt-4">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-warm-gray">
                Rehearsal Dinner
              </p>
              <div className="mt-3 space-y-2">
                {guests
                  .filter(
                    (g) =>
                      g.invited_rehearsal_dinner &&
                      g.attending_rehearsal === true,
                  )
                  .map((guest) => (
                    <div
                      key={guest.guest_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-charcoal">{nameFor(guest)}</span>
                      <span className="font-medium text-sage">Attending</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <Heart className="h-5 w-5 text-gold" />
        <Link
          href="/"
          className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-sage transition-colors hover:text-gold"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
