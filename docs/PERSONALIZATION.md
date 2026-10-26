# Personalizing the wedding website

All public wedding content lives in `src/config/`. These files are shipped to
visitors: never put passwords, API secrets, guest lists, or invitation codes here.
The original wedding content is intentionally preserved until you replace it.

- `wedding.ts`: names, date/time, location, venues, website URL, navigation, schedule.
- `menu.ts`: meal choices, starter, and shared sides. Keep existing meal values
  stable after RSVPs have been collected.
- `page-copy.ts`: page headings, messages, photo paths, and accessible descriptions,
  grouped by the component that displays them. Layout and animations stay in components.
- `rsvp.ts`, `travel.ts`, and `seating.ts`: RSVP confirmation copy, travel dates/search links, and guest-side colors.
- `metadata.ts`: page and social-preview metadata derived from wedding details.
- `faq.ts`, `hotels.ts`, `locations.ts`, `recommendations.ts`, `registry.ts`, and
  `wedding-party.ts`: structured page data. Update map coordinates and travel
  directions alongside your venue changes.
- `story.ts`, `photos.ts`, `gallery-sync.mjs`: story milestones, photo registry,
  gallery filename/date overrides. Place images under `public/images/`.
- `honeymoon.ts`: fund experiences. Do not rename experience IDs after contributions.
- `checklist.ts`: planning tasks and timing.

Generated photo inventories live in `src/config/generated/`. Run
`npm run sync-gallery` or `npm run sync-fluff` after replacing the corresponding
photos; edit their source configuration rather than the generated inventories.

Compatibility exports in the old `src/lib/` locations avoid breaking existing
imports. RSVP availability remains database-controlled, and deployment secrets
remain environment variables.
