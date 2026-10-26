"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ADULT_ENTREES,
  KIDS_MEALS,
  ALTERNATIVE_MEAL,
  SHARED_SIDES,
  STARTER,
} from "@/lib/constants";
import type { GuestRsvpData } from "@/lib/rsvp/types";

interface StepMealsProps {
  guests: GuestRsvpData[]; // already filtered to attending, non-infant guests
  updateGuest: (id: string, updates: Partial<GuestRsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const isPlaceholder = (g: GuestRsvpData) =>
  g.name_status === "PLACEHOLDER_UNKNOWN";

// Kids' meals are locked to a single option for now — no choice, just show it.
const KIDS_FIXED_MEAL =
  KIDS_MEALS.find((m) => m.value === "Tenders") ?? KIDS_MEALS[0];

// Whether to show the kids' menu for a guest. Placeholder (plus-one) seats use
// the adult/child choice made on this step; everyone else uses their guest_type.
const wantsKidsMenu = (g: GuestRsvpData) =>
  isPlaceholder(g)
    ? g.plus_one_type === "child"
    : g.guest_type === "child" || g.guest_type === "toddler";

export default function StepMeals({
  guests,
  updateGuest,
  onNext,
  onBack,
}: StepMealsProps) {
  const [error, setError] = useState("");

  // Kids can only have the fixed children's meal — auto-assign it so there's no
  // choice to make (and the "meal required" check passes). Re-runs if a plus-one
  // seat is toggled to "child".
  useEffect(() => {
    for (const g of guests) {
      if (wantsKidsMenu(g) && g.meal_preference !== KIDS_FIXED_MEAL.value) {
        updateGuest(g.guest_id, { meal_preference: KIDS_FIXED_MEAL.value });
      }
    }
  }, [guests, updateGuest]);

  const nameFor = (g: GuestRsvpData) =>
    isPlaceholder(g) ? g.plus_one_name.trim() || "Your guest" : g.display_name;

  const handleContinue = () => {
    if (guests.some((g) => !g.meal_preference)) {
      setError("Please choose a meal for each guest before continuing.");
      return;
    }
    // If anyone picked the alternative meal, make sure they described it.
    if (
      guests.some(
        (g) =>
          g.meal_preference === ALTERNATIVE_MEAL.value &&
          !g.dietary_notes.trim(),
      )
    ) {
      setError(
        "Please describe the alternative meal / dietary need in the box under that guest.",
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
          Dinner Selection
        </h2>
        <p className="mt-2 font-sans text-sm text-charcoal-light">
          Please choose an entrée for each guest.
        </p>
      </div>

      {/* Starter + sides — informational, served to everyone. Shown up top so
          guests see the full plate before choosing an entrée. */}
      <div className="mt-6 rounded-lg border border-linen bg-ivory/60 p-5 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-warm-gray">
          Every dinner includes
        </p>
        <p className="mt-2 font-serif text-base text-charcoal-light">
          {STARTER} · {SHARED_SIDES.join(" · ")}
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {guests.map((guest) => {
          const kids = wantsKidsMenu(guest);
          return (
            <div key={guest.guest_id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 break-words font-serif text-lg text-charcoal">
                  {nameFor(guest)}
                </p>

                {/* Plus-one seats: let the guest say whether this is an adult or a child. */}
                {isPlaceholder(guest) && (
                  <div className="inline-flex overflow-hidden rounded-lg border border-linen">
                    {(["adult", "child"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() =>
                          updateGuest(guest.guest_id, {
                            plus_one_type: t,
                            meal_preference: "", // menu changes, so reset the pick
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 font-sans text-xs font-medium capitalize transition-colors",
                          guest.plus_one_type === t
                            ? "bg-sage text-white"
                            : "bg-white text-charcoal-light hover:bg-ivory",
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {kids ? (
                // Kids' meal is fixed for now — show it, no choice to make.
                <div className="mt-3 rounded-lg border border-gold bg-gold/5 p-4 shadow-gold">
                  <span className="block font-sans text-sm font-medium text-charcoal">
                    {KIDS_FIXED_MEAL.label}
                  </span>
                  <span className="mt-1 block font-sans text-xs text-warm-gray">
                    The children&apos;s meal.
                  </span>
                </div>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    {ADULT_ENTREES.map((meal) => (
                      <button
                        key={meal.value}
                        onClick={() =>
                          updateGuest(guest.guest_id, {
                            meal_preference: meal.value,
                          })
                        }
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          guest.meal_preference === meal.value
                            ? "border-gold bg-gold/5 shadow-gold"
                            : "border-linen bg-white hover:border-gold/40",
                        )}
                      >
                        <span className="block font-sans text-sm font-medium text-charcoal">
                          {meal.label}
                        </span>
                        {meal.description && (
                          <span className="mt-1 block font-sans text-sm text-warm-gray sm:text-xs">
                            {meal.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Third option: alternative meal (smaller, full width). */}
                  <button
                    onClick={() =>
                      updateGuest(guest.guest_id, {
                        meal_preference: ALTERNATIVE_MEAL.value,
                      })
                    }
                    className={cn(
                      "mt-2.5 w-full rounded-lg border px-4 py-2.5 text-left font-sans text-xs transition-all",
                      guest.meal_preference === ALTERNATIVE_MEAL.value
                        ? "border-gold bg-gold/5 text-charcoal shadow-gold"
                        : "border-dashed border-linen bg-white text-warm-gray hover:border-gold/40",
                    )}
                  >
                    <span className="font-medium">
                      {ALTERNATIVE_MEAL.label}
                    </span>
                    <span className="ml-1">
                      — {ALTERNATIVE_MEAL.description}
                    </span>
                  </button>
                </>
              )}

              {/* Dietary restrictions, on the same step so it can explain the choice. */}
              <input
                type="text"
                placeholder="Dietary restrictions / allergies (and any alternative meal)..."
                value={guest.dietary_notes}
                onChange={(e) =>
                  updateGuest(guest.guest_id, { dietary_notes: e.target.value })
                }
                className="mt-2.5 w-full rounded-lg border border-linen bg-white px-4 py-2.5 font-sans text-sm text-charcoal outline-none transition-colors placeholder:text-warm-gray/60 focus:border-sage focus:ring-2 focus:ring-sage/20"
              />
            </div>
          );
        })}
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
