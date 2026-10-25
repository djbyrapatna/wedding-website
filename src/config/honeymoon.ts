// ============================================
// Honeymoon fund — experience definitions
//
// This is the ONE place to edit the honeymoon fund content. Each experience
// renders as a card with a progress bar on /registry/honeymoon. The `id` is a
// stable key used to total contributions in Supabase — once money is attached
// to an id, don't rename it (change title/blurb/goal freely).
//
// The trip: 5 nights in Mallorca → a few in Florence → the rest in Rome.
// ============================================

export type HoneymoonExperience = {
  /** Stable key — do not rename once contributions exist. */
  id: string;
  /** Short emoji shown in the card badge. */
  emoji: string;
  /** Card title. */
  title: string;
  /** Where it happens — small uppercase label. */
  location: string;
  /** One-line pitch in the couple's voice. */
  blurb: string;
  /**
   * Fundraising target in whole dollars. Bars can exceed this. Set to `null`
   * for an open-ended fund — it shows the running total with no goal/bar.
   */
  goalDollars: number | null;
};

export const HONEYMOON_EXPERIENCES: HoneymoonExperience[] = [
  {
    id: "general-fund",
    emoji: "💙",
    title: "The honeymoon fund",
    location: "Everywhere",
    blurb: "Toward anything and everything else — every bit helps us celebrate.",
    goalDollars: null,
  },
  {
    id: "mallorca-massage",
    emoji: "💆",
    title: "A massage in Mallorca",
    location: "Mallorca",
    blurb: "Side by side and fully unwound, with the Mediterranean just outside.",
    goalDollars: 300,
  },
  {
    id: "florence-wine-tasting",
    emoji: "🍷",
    title: "Wine tasting in Florence",
    location: "Florence",
    blurb: "A slow afternoon among the Tuscan vines, glass in hand.",
    goalDollars: 200,
  },
  {
    id: "vatican-tour",
    emoji: "⛪",
    title: "A Vatican tour",
    location: "Rome",
    blurb: "St. Peter's and the Sistine Chapel, with a guide all to ourselves.",
    goalDollars: 200,
  },
];

// Lookup helper used by the checkout route to validate an incoming id.
export function getExperience(id: string): HoneymoonExperience | undefined {
  return HONEYMOON_EXPERIENCES.find((e) => e.id === id);
}

// ---------------------------------------------------------------------------
// PREVIEW / DEMO data
//
// Shown ONLY when Supabase isn't configured (local preview before Stripe is
// connected) so the bars look alive while you scan and edit the page. Once
// Supabase + the webhook are live, real contributions replace these entirely.
// ---------------------------------------------------------------------------
export const DEMO_RAISED_DOLLARS: Record<string, number> = {
  "mallorca-massage": 180,
  "florence-wine-tasting": 200, // fully funded — shows the celebratory state
  "vatican-tour": 75,
  // general-fund intentionally omitted — it never shows a dollar metric.
};

// Preset "quick amount" chips offered in the contribute dialog (dollars).
export const QUICK_AMOUNTS = [25, 50, 100, 250];

export function formatUSD(dollars: number): string {
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
