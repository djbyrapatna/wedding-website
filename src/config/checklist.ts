// ============================================
// Wedding planning checklist
// Source: "Bride and Groom's Checklist.pdf" — prepared by Alyson Desha,
// Mockingbird Lane Weddings & Events.
//
// These are STATIC definitions (text + grouping + tags). Only the *state* of
// each item (checked / notes) is persisted — in Supabase when configured, or in
// localStorage in demo mode. IDs are stable; do not renumber existing items
// (saved check/note state is keyed by id).
// ============================================

export interface ChecklistItem {
  id: string;
  text: string;
  /** Category tags for filtering/search, e.g. ["DJ", "Music"]. */
  tags: string[];
}

export interface ChecklistSection {
  id: string;
  /** The timing window for this group of tasks. */
  timing: string;
  /** Optional sub-label (e.g. "week of the wedding"). */
  note?: string;
  items: ChecklistItem[];
}

export const CHECKLIST: ChecklistSection[] = [
  {
    id: "s1",
    timing: "Now through May 15th, 2026",
    items: [
      { id: "s1-01", text: "Insure your engagement ring, if you will be doing this.", tags: ["Rings", "Insurance"] },
      { id: "s1-02", text: "Start researching your recommended DJs.", tags: ["DJ"] },
      { id: "s1-03", text: "Set up appointments with your recommended florists to discuss options.", tags: ["Flowers"] },
      { id: "s1-04", text: "Meet with your officiant to discuss ceremony structure and any religious requirements (such as counseling).", tags: ["Ceremony"] },
      { id: "s1-05", text: "Interview and get price lists from your recommended wedding photographers.", tags: ["Photography"] },
      { id: "s1-06", text: "Book reception DJ, sign the contract, and send a deposit.", tags: ["DJ", "Payments"] },
      { id: "s1-07", text: "Begin looking for a baker to make your wedding cake.", tags: ["Cake"] },
      { id: "s1-08", text: "Reserve photographer, decide on a package, sign contract, and send deposit.", tags: ["Photography", "Payments"] },
      { id: "s1-09", text: "Choose your florist and send a deposit to reserve their services.", tags: ["Flowers", "Payments"] },
      { id: "s1-10", text: "Bride: Start shopping for bridesmaid dresses.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-11", text: "Make sure your maid of honor and best man are aware of what you expect of them — providing a list of their duties will help.", tags: ["Wedding Party"] },
      { id: "s1-12", text: "Register for your wedding gifts, and don't forget to include some choices appropriate for your upcoming bridal shower or engagement party as well.", tags: ["Registry"] },
      { id: "s1-13", text: "Bride: Decide on the bridesmaid dresses.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-14", text: "Book a baker, choose your wedding cake design, and send a deposit.", tags: ["Cake", "Payments"] },
      { id: "s1-15", text: "Bride: Collect necessary measurements from attendants or pass along vendor information so that they can order the dresses themselves.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-16", text: "Start planning the rehearsal dinner. Provide the host with contact information for your attendants and any other guests.", tags: ["Rehearsal Dinner"] },
      { id: "s1-17", text: "Start working on your invitation wording and design.", tags: ["Invitations"] },
      { id: "s1-18", text: "Finalize menu and service details (buffet or plated?) with caterer.", tags: ["Catering"] },
      { id: "s1-19", text: "Finalize your invitation wording.", tags: ["Invitations"] },
      { id: "s1-20", text: "Order your invitations and announcements (don't forget plenty of extra envelopes).", tags: ["Invitations"] },
      { id: "s1-21", text: "Research and purchase wedding insurance.", tags: ["Insurance"] },
      { id: "s1-22", text: "Decide on a floral scheme, choose flowers, and negotiate prices with florist. Be sure to sign a contract outlining what you agreed upon.", tags: ["Flowers"] },
      { id: "s1-23", text: "Groom: Decide what style of formalwear you will be wearing.", tags: ["Attire"] },
      { id: "s1-24", text: "Confirm rentals and reserve them with your rental company.", tags: ["Rentals"] },
      { id: "s1-25", text: "Groom: Start looking to buy or rent tux, suit, or other formal attire.", tags: ["Attire"] },
      { id: "s1-26", text: "Book rehearsal dinner site.", tags: ["Rehearsal Dinner"] },
      { id: "s1-27", text: "Book hotel room for your wedding night.", tags: ["Hotel"] },
      { id: "s1-28", text: "Add hotel reservation and city information to your wedding website.", tags: ["Hotel", "Website"] },
      { id: "s1-29", text: "Book your honeymoon flights and make all your other travel reservations.", tags: ["Honeymoon", "Travel"] },
      { id: "s1-30", text: "Groom: Decide on your groomsmen's attire.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-31", text: "Bride: Choose your bridesmaids' accessories (shoes, gloves, etc.) and either purchase or pass along purchasing information.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-32", text: "Groom: Give the groomsmen the information they need to buy and/or reserve their attire.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-33", text: "If you haven't registered yet, be sure to do so before any upcoming pre-wedding parties.", tags: ["Registry"] },
      { id: "s1-34", text: "Shop for and purchase wedding bands.", tags: ["Rings"] },
      { id: "s1-35", text: "Schedule your hair and makeup trial and bridal portrait session.", tags: ["Beauty", "Photography"] },
      { id: "s1-36", text: "Bride: Make sure your attendants have purchased their dresses and accessories.", tags: ["Attire", "Wedding Party"] },
      { id: "s1-37", text: "Groom: If you are renting a tux, visit the formalwear shop to get measured.", tags: ["Attire"] },
      { id: "s1-38", text: "Bride: Buy any special lingerie your gown requires in time for first fittings.", tags: ["Attire"] },
      { id: "s1-39", text: "Get anything you need for an international honeymoon (passport, birth certificate, visas, vaccinations, etc.).", tags: ["Honeymoon", "Travel"] },
      { id: "s1-40", text: "Talk to your maid of honor and best man about party plans (such as the shower and bachelor party).", tags: ["Wedding Party"] },
      { id: "s1-41", text: "Pick up your invitations.", tags: ["Invitations"] },
      { id: "s1-42", text: "Start addressing invitations or drop them off with the calligrapher (you'll need to send them out at the two-month mark).", tags: ["Invitations"] },
      { id: "s1-43", text: "Talk to people you'd want to do special performances or readings as part of the ceremony.", tags: ["Ceremony"] },
      { id: "s1-44", text: "If you are handling the bridesmaid dress order, confirm the delivery date.", tags: ["Attire", "Wedding Party"] },
    ],
  },
  {
    id: "s2",
    timing: "May 16th – June 15th, 2026",
    items: [
      { id: "s2-01", text: "Arrange for all insurance policies to include you and your future spouse: health, auto, homeowner's, and life insurance.", tags: ["Insurance"] },
      { id: "s2-02", text: "Send wedding bands out to be engraved (make sure they'll be back in time for the wedding).", tags: ["Rings"] },
      { id: "s2-03", text: "Groom: Choose and buy any accessories you will need: shoes, shirt stays, cuff links, and a pocket square.", tags: ["Attire"] },
      { id: "s2-04", text: "Bride: Provide a guest list to bridesmaids for your shower.", tags: ["Wedding Party"] },
      { id: "s2-05", text: "Bride: Begin your fittings.", tags: ["Attire"] },
      { id: "s2-06", text: "Arrange wedding-day transportation for you, your wedding party, and guests (as needed).", tags: ["Transportation"] },
      { id: "s2-07", text: "Send out invitations (be sure to add extra postage for overseas guests).", tags: ["Invitations"] },
      { id: "s2-08", text: "Bride: Decide on and purchase major accessories (veil and shoes) prior to final fittings.", tags: ["Attire"] },
      { id: "s2-09", text: "Begin working on vows, particularly if you're writing your own.", tags: ["Vows"] },
      { id: "s2-10", text: "Begin writing the ceremony program if you are having one.", tags: ["Program", "Ceremony"] },
      { id: "s2-11", text: "As you receive presents, be sure to update and/or add items to your registry list and record the gifts you get.", tags: ["Registry", "Gifts"] },
    ],
  },
  {
    id: "s3",
    timing: "June 16th – July 15th, 2026",
    items: [
      { id: "s3-01", text: "Arrange for a babysitter for the reception, if necessary.", tags: ["Misc"] },
      { id: "s3-02", text: "Set aside some time to write thank-you notes for gifts received.", tags: ["Thank-Yous", "Gifts"] },
      { id: "s3-03", text: "Finalize vows.", tags: ["Vows"] },
      { id: "s3-04", text: "Buy a guest book (and a nice pen).", tags: ["Misc"] },
      { id: "s3-05", text: "Bride: Buy gifts for your maid of honor and bridesmaids.", tags: ["Gifts", "Wedding Party"] },
      { id: "s3-06", text: "Bride: Attend final wedding-gown fitting.", tags: ["Attire"] },
      { id: "s3-07", text: "Groom: Buy gifts for your best man, groomsmen, and ushers.", tags: ["Gifts", "Wedding Party"] },
      { id: "s3-08", text: "Finish and print ceremony programs.", tags: ["Program", "Ceremony"] },
      { id: "s3-09", text: "Send rehearsal dinner invitations.", tags: ["Rehearsal Dinner"] },
      { id: "s3-10", text: "Finalize your wedding-day beauty appointments.", tags: ["Beauty"] },
      { id: "s3-11", text: "Discuss music with ceremony musicians and agree on final choices.", tags: ["Music", "Ceremony"] },
      { id: "s3-12", text: "Work on a list of \"must-play\" (and \"must-not play\") songs for your DJ.", tags: ["DJ", "Music"] },
      { id: "s3-13", text: "Make sure your homeowner's or renter's insurance covers your rings and gifts.", tags: ["Insurance", "Rings"] },
      { id: "s3-14", text: "Pick up wedding rings and check the inscriptions before you leave the store.", tags: ["Rings"] },
      { id: "s3-15", text: "Bride: Shop for all additional accessories like earrings, evening bag, etc.", tags: ["Attire"] },
      { id: "s3-16", text: "Wrap all gifts for the wedding party and write each attendant a nice note.", tags: ["Gifts", "Wedding Party"] },
      { id: "s3-17", text: "Confirm wedding night and honeymoon reservations.", tags: ["Honeymoon", "Hotel"] },
      { id: "s3-18", text: "Have a follow-up meeting or phone call with the officiant to go over ceremony timing and details.", tags: ["Ceremony"] },
      { id: "s3-19", text: "Attend venue walk-through meeting with your Mockingbird Lane coordinator.", tags: ["Coordinator"] },
      { id: "s3-20", text: "Work out wedding day timing and details with your Mockingbird Lane coordinator.", tags: ["Coordinator"] },
      { id: "s3-21", text: "Get your marriage license one month before the wedding (you cannot get a license within 72 hours of the wedding, or more than 89 days prior).", tags: ["License"] },
    ],
  },
  {
    id: "s4",
    timing: "July 16th – August 7th, 2026",
    items: [
      { id: "s4-01", text: "Do paperwork for official documents if you are changing your name.", tags: ["License"] },
      { id: "s4-02", text: "Get a head start on those thank-you notes.", tags: ["Thank-Yous"] },
      { id: "s4-03", text: "Finalize any special preferences, readings, or other ceremony details (in writing) with your officiant.", tags: ["Ceremony"] },
      { id: "s4-04", text: "Finalize your timeline, layout, and set-up checklist with your Mockingbird Lane coordinator.", tags: ["Coordinator"] },
      { id: "s4-05", text: "Bride: Get final pre-wedding haircut, if necessary.", tags: ["Beauty"] },
      { id: "s4-06", text: "Sit for your bridal portrait, if you decide to get one.", tags: ["Photography"] },
      { id: "s4-07", text: "Call or email wedding party to relay critical info related to rehearsal and wedding (dates, times, directions, duties) and send the final timeline over to them.", tags: ["Wedding Party"] },
      { id: "s4-08", text: "Bride: Make sure you have your garter and \"something old, new, borrowed, and blue\" if you want to include these customs in your wedding.", tags: ["Attire"] },
      { id: "s4-09", text: "Plan a party or go out for cocktails to thank your attendants for all their help.", tags: ["Wedding Party"] },
      { id: "s4-10", text: "Give final head count to the caterer. Confirm set-up instructions and menu items.", tags: ["Catering"] },
      { id: "s4-11", text: "Bride: Practice walking in your wedding shoes.", tags: ["Attire"] },
      { id: "s4-12", text: "Relay all responsibilities to all those involved and make sure your Mockingbird Lane coordinator has a list of responsibilities.", tags: ["Coordinator", "Wedding Party"] },
      { id: "s4-13", text: "Groom: Get your final haircut.", tags: ["Beauty"] },
      { id: "s4-14", text: "Communicate with transportation providers regarding schedule and addresses for pickups on wedding day.", tags: ["Transportation"] },
      { id: "s4-15", text: "Plan any additional night-before activities with friends and/or attendants.", tags: ["Misc"] },
      { id: "s4-16", text: "Prepare your toasts or thanks to friends and family.", tags: ["Misc"] },
      { id: "s4-17", text: "Groom: Pick up your tux and try it on. (Don't wait until the day of to do this!)", tags: ["Attire"] },
      { id: "s4-18", text: "Get ideas for \"must-take\" photos and give this list to your photographer and your Mockingbird Lane coordinator.", tags: ["Photography"] },
      { id: "s4-19", text: "Confirm all final payment amounts with your vendors.", tags: ["Payments"] },
      { id: "s4-20", text: "Shop and pack for honeymoon.", tags: ["Honeymoon", "Travel"] },
    ],
  },
  {
    id: "s5",
    timing: "August 8th – August 14th, 2026",
    note: "Week of the wedding",
    items: [
      { id: "s5-01", text: "Bride: Get a manicure and pedicure.", tags: ["Beauty"] },
      { id: "s5-02", text: "Confirm playlist with DJ or ceremony musicians.", tags: ["DJ", "Music"] },
      { id: "s5-03", text: "Leave a copy of your honeymoon itinerary with someone in case of emergency.", tags: ["Honeymoon", "Travel"] },
      { id: "s5-04", text: "Confirm all specific honeymoon travel plans (including transportation to airport, etc.).", tags: ["Honeymoon", "Travel"] },
      { id: "s5-05", text: "Put final payments and cash tips in marked envelopes and give to your Mockingbird Lane coordinator on the day of the rehearsal to distribute on the wedding day.", tags: ["Payments", "Coordinator"] },
      { id: "s5-06", text: "Rehearse the ceremony with officiant and wedding party.", tags: ["Ceremony", "Wedding Party"] },
      { id: "s5-07", text: "Drop off décor items, final vendor payments and tips to your Mockingbird Lane coordinator on the day of the rehearsal.", tags: ["Décor", "Payments", "Coordinator"] },
      { id: "s5-08", text: "Have fun and relax at your rehearsal dinner.", tags: ["Rehearsal Dinner"] },
      { id: "s5-09", text: "Give wedding announcements to your honor attendant to be mailed on the wedding day.", tags: ["Invitations", "Wedding Party"] },
      { id: "s5-10", text: "Bride: Pull together wedding gown, veil, shoes, etc.", tags: ["Attire"] },
      { id: "s5-11", text: "Get some much-needed sleep — if you can!", tags: ["Misc"] },
      { id: "s5-12", text: "Put together an overnight bag for your wedding night (toothbrush, lingerie, etc.). Bring it to your wedding and your Mockingbird Lane coordinator will make sure it will be packed in your getaway vehicle or in your hotel room (if on premises).", tags: ["Misc", "Coordinator"] },
    ],
  },
  {
    id: "s6",
    timing: "After Your Wedding",
    items: [
      { id: "s6-01", text: "If you're saving the top layer of your cake, get it packaged and into the freezer as soon as possible.", tags: ["Cake"] },
      { id: "s6-02", text: "Take the bridal bouquet and other wedding mementos to be preserved, if doing so.", tags: ["Flowers"] },
      { id: "s6-03", text: "Arrange for gown and veil to be cleaned and preserved. Make sure the provider is experienced in preserving wedding gowns.", tags: ["Attire"] },
      { id: "s6-04", text: "Mail gifts to your parents to thank them for their help and support, if you didn't give them out at the rehearsal dinner.", tags: ["Gifts", "Thank-Yous"] },
      { id: "s6-05", text: "Within two months of your wedding, set aside some romantic evenings to write that stack of thank-you notes.", tags: ["Thank-Yous"] },
    ],
  },
];

/** Total number of checklist items across all sections. */
export const CHECKLIST_TOTAL = CHECKLIST.reduce(
  (sum, section) => sum + section.items.length,
  0
);

/** Every tag used across the checklist, sorted alphabetically. */
export const ALL_TAGS: string[] = Array.from(
  new Set(CHECKLIST.flatMap((s) => s.items.flatMap((i) => i.tags)))
).sort((a, b) => a.localeCompare(b));

/**
 * Pull a "Bride" / "Groom" tag out of an item's text, if present.
 * Returns the cleaned text plus an optional tag for rendering a badge.
 */
export function parseTag(text: string): {
  tag: "Bride" | "Groom" | null;
  text: string;
} {
  const match = text.match(/^(Bride|Brides|Groom):\s*/);
  if (!match) return { tag: null, text };
  const tag = match[1].startsWith("Bride") ? "Bride" : "Groom";
  return { tag, text: text.slice(match[0].length) };
}
