"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRsvpForm } from "@/hooks/useRsvpForm";
import {
  SEARCH,
  PARTY,
  RSVP,
  REHEARSAL,
  MEALS,
  NOTES,
  CONFIRM,
} from "@/lib/rsvp/steps";
import StepSearch from "./StepSearch";
import StepParty from "./StepParty";
import StepRsvp from "./StepRsvp";
import StepRehearsal from "./StepRehearsal";
import StepMeals from "./StepMeals";
import StepNotes from "./StepNotes";
import StepConfirmation from "./StepConfirmation";

export type { GuestRsvpData } from "@/lib/rsvp/types";

// Logical steps. Rehearsal and meals are conditionally skipped, but we keep
// stable numeric ids and compute the visible sequence so the progress bar and
// next/back navigation stay correct regardless of which steps apply.
// Vertical fade rather than a horizontal slide: a horizontal x-offset makes the
// entering step start off-screen, which momentarily widens the page on mobile
// (the flashing/jump). A small y + opacity crossfade stays within the layout.
const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, y: direction > 0 ? 10 : -10 }),
  center: { opacity: 1, y: 0 },
  exit: (direction: number) => ({ opacity: 0, y: direction > 0 ? -10 : 10 }),
};

export default function RsvpForm() {
  const {
    step,
    direction,
    household,
    householdLabel,
    guestData,
    email,
    phone,
    note,
    submitting,
    submitError,
    setEmail,
    setPhone,
    setNote,
    sequence,
    goNext,
    goBack,
    handleHouseholdFound,
    updateGuest,
    handleSubmit,
  } = useRsvpForm();
  const stepsBeforeConfirm = sequence.length - 1;
  const currentIndex = sequence.indexOf(step) + 1;
  return (
    <div className="mx-auto max-w-2xl">
      {submitError && (
        <p role="alert" className="mb-6 text-center text-sm text-red-600">
          {submitError}
        </p>
      )}
      {step !== CONFIRM && (
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-warm-gray">
              Step {currentIndex} of {stepsBeforeConfirm}
            </span>
            <span className="font-sans text-xs text-warm-gray">
              {Math.round((currentIndex / stepsBeforeConfirm) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-linen">
            <motion.div
              className="h-full bg-gold"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentIndex / stepsBeforeConfirm) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {step === SEARCH && (
            <StepSearch onHouseholdFound={handleHouseholdFound} />
          )}

          {step === PARTY && household && (
            <StepParty
              label={householdLabel}
              guests={guestData}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === RSVP && (
            <StepRsvp
              guests={guestData}
              updateGuest={updateGuest}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === REHEARSAL && (
            <StepRehearsal
              guests={guestData}
              updateGuest={updateGuest}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === MEALS && (
            <StepMeals
              guests={guestData.filter(
                (g) =>
                  g.attending_wedding === true && g.guest_type !== "infant",
              )}
              updateGuest={updateGuest}
              onNext={goNext}
              onBack={goBack}
            />
          )}

          {step === NOTES && (
            <StepNotes
              guests={guestData}
              email={email}
              phone={phone}
              note={note}
              setEmail={setEmail}
              setPhone={setPhone}
              setNote={setNote}
              onSubmit={handleSubmit}
              onBack={goBack}
              submitting={submitting}
            />
          )}

          {step === CONFIRM && (
            <StepConfirmation guests={guestData} searchName={householdLabel} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
