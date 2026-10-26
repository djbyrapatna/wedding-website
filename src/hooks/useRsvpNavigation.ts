"use client";
import { useEffect, useMemo, useState } from "react";
import type { GuestRsvpData } from "@/lib/rsvp/types";
import {
  SEARCH,
  PARTY,
  RSVP,
  REHEARSAL,
  MEALS,
  NOTES,
  CONFIRM,
} from "@/lib/rsvp/steps";
export function useRsvpNavigation(guestData: GuestRsvpData[]) {
  const [step, setStep] = useState(SEARCH);
  const [direction, setDirection] = useState(1);
  const anyRehearsalInvited = guestData.some((g) => g.invited_rehearsal_dinner);
  // Infants don't need a meal, so the meal step only applies if a non-infant is attending.
  const anyNeedsMeal = guestData.some(
    (g) => g.attending_wedding === true && g.guest_type !== "infant",
  );

  // The ordered list of steps that actually apply to this party.
  const sequence = useMemo(() => {
    const s = [SEARCH, PARTY, RSVP];
    if (anyRehearsalInvited) s.push(REHEARSAL);
    if (anyNeedsMeal) s.push(MEALS);
    s.push(NOTES, CONFIRM);
    return s;
  }, [anyRehearsalInvited, anyNeedsMeal]);

  // Safety net: if a step stops applying while the user is on it (e.g. they go
  // back and change answers so the meal/rehearsal step disappears), snap to the
  // RSVP step so Back/Continue can never become a dead-end.
  useEffect(() => {
    if (step !== CONFIRM && !sequence.includes(step)) {
      setStep(RSVP);
    }
  }, [sequence, step]);

  const goTo = (target: number, dir: number) => {
    setDirection(dir);
    setStep(target);
  };

  const goNext = () => {
    const i = sequence.indexOf(step);
    if (i >= 0 && i < sequence.length - 1) goTo(sequence[i + 1], 1);
  };

  const goBack = () => {
    const i = sequence.indexOf(step);
    if (i > 0) goTo(sequence[i - 1], -1);
  };

  return {
    step,
    setStep,
    direction,
    setDirection,
    sequence,
    goTo,
    goNext,
    goBack,
  };
}
