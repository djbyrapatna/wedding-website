"use client";
import { useState } from "react";
import type {
  GuestRsvpData,
  Invitation,
  InvitationHousehold,
} from "@/lib/rsvp/types";
import { SEARCH, PARTY, MEALS, CONFIRM } from "@/lib/rsvp/steps";
import { useRsvpNavigation } from "./useRsvpNavigation";
export function useRsvpForm() {
  const [household, setHousehold] = useState<InvitationHousehold | null>(null);
  const [householdLabel, setHouseholdLabel] = useState("");
  const [guestData, setGuestData] = useState<GuestRsvpData[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    step,
    setStep,
    direction,
    setDirection,
    sequence,
    goTo,
    goNext,
    goBack,
  } = useRsvpNavigation(guestData);
  const primaryGuestId =
    guestData.find((g) => g.is_primary_contact)?.guest_id ??
    guestData[0]?.guest_id;

  const handleHouseholdFound = (invitation: Invitation) => {
    const { household: foundHousehold, guests, rsvps } = invitation;
    setSubmitError("");
    const byId = new Map(rsvps.map((r) => [r.guest_id, r]));
    setHousehold(foundHousehold);
    // Display label: a deliberately-set party name (the stored search_name
    // already ending in "Party", e.g. "Dickman and Geneslaw Party") wins as an
    // override; otherwise default to the primary contact's last name + " Party"
    // (e.g. "Milligan Party"), falling back to the raw stored name.
    const primaryGuest = guests.find((g) => g.is_primary_contact) ?? guests[0];
    const lastName = primaryGuest?.last_name?.trim();
    const stored = foundHousehold.search_name?.trim();
    setHouseholdLabel(
      stored && /party$/i.test(stored)
        ? stored
        : lastName
          ? `${lastName} Party`
          : (stored ?? ""),
    );
    setGuestData(
      guests.map((g) => {
        const existing = byId.get(g.guest_id);
        return {
          guest_id: g.guest_id,
          display_name: g.display_name,
          name_status: g.name_status,
          guest_type: g.guest_type,
          is_primary_contact: g.is_primary_contact,
          invited_rehearsal_dinner: g.invited_rehearsal_dinner,
          attending_wedding: existing?.attending_wedding ?? null,
          attending_rehearsal: existing?.attending_rehearsal ?? null,
          meal_preference: existing?.meal_preference ?? "",
          dietary_notes: existing?.dietary_notes ?? "",
          plus_one_name:
            existing?.plus_one_name ??
            (g.name_status === "PLACEHOLDER_UNKNOWN" ? "" : g.display_name),
          plus_one_type:
            g.name_status === "PLACEHOLDER_UNKNOWN"
              ? (existing?.plus_one_type ??
                (g.guest_type === "child" || g.guest_type === "toddler"
                  ? "child"
                  : "adult"))
              : "",
        };
      }),
    );
    // Prefill contact/note from the primary's existing response, if any.
    const primary = guests.find((g) => g.is_primary_contact) ?? guests[0];
    const primaryRsvp = primary ? byId.get(primary.guest_id) : undefined;
    setEmail(primaryRsvp?.rsvp_email ?? "");
    setPhone(primaryRsvp?.rsvp_phone ?? "");
    setNote(primaryRsvp?.notes ?? "");
    goTo(PARTY, 1);
  };

  const updateGuest = (id: string, updates: Partial<GuestRsvpData>) => {
    setGuestData((prev) =>
      prev.map((g) => (g.guest_id === id ? { ...g, ...updates } : g)),
    );
  };

  const handleSubmit = async () => {
    // Final guard: every attending, non-infant guest must have a meal. This
    // closes the edge where someone changes a meal/toggle then navigates Back
    // (skipping the meal step's own check) before submitting.
    const missingMeal = guestData.some(
      (g) =>
        g.attending_wedding === true &&
        g.guest_type !== "infant" &&
        !g.meal_preference,
    );
    if (missingMeal) {
      setDirection(-1);
      setStep(MEALS);
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_guest_id: primaryGuestId,
          email: email.trim() || null,
          phone: phone.trim() || null,
          note: note.trim() || null,
          guests: guestData.map((g) => ({
            guest_id: g.guest_id,
            attending_wedding: g.attending_wedding,
            attending_rehearsal: g.invited_rehearsal_dinner
              ? g.attending_rehearsal
              : null,
            meal_preference:
              g.attending_wedding && g.guest_type !== "infant"
                ? g.meal_preference || null
                : null,
            dietary_notes: g.dietary_notes || null,
            plus_one_name:
              g.name_status === "PLACEHOLDER_UNKNOWN"
                ? g.plus_one_name || null
                : null,
            plus_one_type:
              g.name_status === "PLACEHOLDER_UNKNOWN"
                ? g.plus_one_type || null
                : null,
          })),
        }),
      });
      if (!res.ok) {
        // Surface the server's reason when there is one (e.g. RSVPs have been
        // closed while the form was open); fall back to a generic message.
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) goTo(SEARCH, -1);
        throw new Error(body.error || "Failed to submit");
      }
      goTo(CONFIRM, 1);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}
