// ============================================
// RECEPTION DINNER MENU
// ============================================
// Adults choose one entrée; children choose one kids' meal; infants need no
// meal (the RSVP form skips them). The shared sides are served to everyone and
// are informational only — guests do not pick them.

export const ADULT_ENTREES = [
  {
    value: "Beef",
    label: "Peppercorn Crusted Beef Tenderloin",
    description: "Caramelized shallots, thyme, veal jus",
  },
  {
    value: "Chicken",
    label: "Herb Roasted Chicken Breast",
    description: "Charred poblano cream sauce",
  },
] as const;

export const KIDS_MEALS = [
  { value: "Burger", label: "Burger & Fries", description: "" },
  { value: "Tenders", label: "Chicken Tenders & Fries", description: "" },
] as const;

// A third choice offered alongside the entrées for anyone whose needs aren't met
// by the menu — they explain in the dietary field on the same step.
export const ALTERNATIVE_MEAL = {
  value: "Alternative",
  label: "Alternative meal preferred",
  description: "We'll note it in dietary restrictions below",
} as const;

// Starter, served to all guests — shown on the site, not selectable.
export const STARTER = "Caesar salad";

// Sides served alongside every entrée — shown on the site, not selectable.
export const SHARED_SIDES = [
  "House mac & cheese",
  "Crispy brussels sprouts (balsamic reduction & parmesan)",
] as const;

