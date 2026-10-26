> Historical design brief. Current implementation uses households/guests/RSVPs,
> individual owner/viewer accounts, and name/code invitation sessions. Read
> README.md and docs/ before changing setup, schemas, or authentication; the
> original proposed schema below has been superseded.

# Andrew & Lyndsey Wedding Website

## PROJECT OVERVIEW
Build a stunning, one-of-a-kind wedding website for Andrew & Lyndsey's August 2026 wedding in Austin, TX. This is NOT a generic wedding site — it should feel like a premium, bespoke digital experience with magazine-quality design, cinematic micro-animations, and buttery-smooth interactions. Think: editorial design meets luxury brand website. Every detail matters.

## TECH STACK (mandatory)
- **Framework:** Next.js 14+ with App Router and TypeScript
- **Styling:** Tailwind CSS 4 + custom CSS for advanced animations
- **Animations:** Framer Motion for scroll-triggered reveals, page transitions, parallax, hover states, and micro-interactions
- **Database:** Supabase (Postgres) for RSVP submissions and guest management
- **Deployment:** Vercel
- **Fonts:** Use elegant serif + clean sans-serif pairing (e.g., Playfair Display + Inter, or Cormorant Garamond + Montserrat)
- **Icons:** Lucide React
- **QR Code:** qrcode.react library
- **Image optimization:** Next.js Image component with blur placeholders

## DESIGN PHILOSOPHY
- Elegant, editorial, modern — NOT generic wedding template vibes
- Rich but restrained color palette (suggest: deep sage/olive, warm cream/ivory, soft gold accents, charcoal text)
- Generous whitespace, cinematic full-bleed hero images
- Typography-forward design — headlines should be art
- Subtle parallax scrolling, fade-in reveals on scroll, smooth page transitions
- Cursor-responsive elements where tasteful (subtle hover glows, magnetic buttons)
- Mobile-first responsive design — most guests will visit on their phones
- Loading transitions between pages (elegant crossfades, not spinners)
- Consider a custom cursor on desktop for extra polish
- Smooth scroll behavior throughout
- Image hover effects (subtle zoom, soft overlay transitions)

## SITE STRUCTURE & PAGES

### 1. HOME PAGE (`/`)
- Full-screen hero with engagement/couple photo, names in elegant typography
- Animated countdown timer to wedding date (stylish, not cheesy — think flip-clock or minimal numeric with label animation)
- Scroll down to reveal:
  - Wedding date, time, and day of week
  - **Ceremony details:** Church name, address, time (placeholder for now)
  - **Reception details:** Venue name, address, time (placeholder — likely Hotel Ella or similar Austin venue)
  - Embedded map or elegant address cards with "Get Directions" links
  - A beautiful couple photo section
  - Brief "Welcome" message
  - "The Weekend at a Glance" schedule overview (Friday welcome event, Saturday ceremony + reception, Sunday brunch — all placeholder)
- Smooth scroll-triggered animations for each section

### 2. OUR STORY (`/our-story`)
- Interactive scrollable timeline of Andrew & Lyndsey's relationship
- Design as a vertical timeline with alternating left/right content blocks
- Each milestone has: date, title, short description, and a photo placeholder
- Scroll-triggered animations — each milestone fades/slides in as you reach it
- Parallax photo sections between major milestones
- Placeholder milestones to fill in:
  - Where they each grew up
  - How they met
  - First date
  - Key relationship moments
  - The proposal
  - Engagement
- End with a "And now, the next chapter..." leading to wedding details
- Make this page feel like a mini documentary — cinematic and emotional

### 3. FAQ (`/faq`)
- Elegant accordion-style expandable questions with smooth open/close animations
- Placeholder questions:
  - What is the dress code?
  - Will the ceremony and reception be at the same location?
  - What time should I arrive?
  - Is there parking available?
  - Can I bring a plus one? (Refer to their invitation)
  - What's the weather like in Austin in August? (Hot! Suggest light fabrics)
  - Are kids welcome?
  - Can I take photos during the ceremony?
  - What if I have dietary restrictions?
  - Is there an after-party?
  - When is the RSVP deadline?

### 4. ACCOMMODATIONS (`/accommodations`)
- Card-based layout for recommended hotels/accommodations
- Each card: hotel name, photo placeholder, distance from venue, price range, booking link placeholder
- Sections:
  - **Recommended Hotels** (room blocks if applicable)
  - **Getting to Austin** — airport info (AUS - Austin-Bergstrom), flight tips
  - **Getting Around** — Uber/Lyft recommendation, rental car options, parking notes
  - **Things to Do in Austin** — brief local recommendations for guests making a trip of it (placeholder suggestions: South Congress, Lady Bird Lake, BBQ spots, live music)
- Map showing hotel locations relative to venue (or placeholder for this)

### 5. REGISTRY (`/registry`)
- Clean, minimal page
- Hero message: "Your presence is our greatest gift" or similar warm message
- Large, elegant buttons/cards linking out to external registry sites (placeholder URLs):
  - Amazon Registry
  - The Knot / Zola / other platform
  - Option for cash fund / honeymoon fund (link to Venmo/PayPal or registry platform that supports this)
- NOTE: All registries are external links — no e-commerce on this site
- Brief note about registry etiquette or a sweet message from the couple

### 6. RSVP (`/rsvp`)
- **This page requires Supabase database integration**
- Beautiful multi-step form with animated transitions between steps:
  - **Step 1:** Guest searches for their name (autocomplete from guest list in Supabase)
  - **Step 2:** Confirms their invitation details (who's in their party based on DB)
  - **Step 3:** Accepts or declines for each person in their party
  - **Step 4:** Meal selection (if applicable — placeholder options)
  - **Step 5:** Dietary restrictions / special notes (free text)
  - **Step 6:** Confirmation screen with animated checkmark and sweet thank-you message
- Form validation with elegant inline error states
- Success state saves to Supabase and could trigger email confirmation (future enhancement)
- **Admin consideration:** Build a simple `/admin` route (password-protected) where Andrew can view all RSVPs in a table, export to CSV, see response rates

### 7. CONTACT (`/contact`)
- Simple, elegant contact section (can be a page or footer section)
- "Questions? Reach out to us"
- Email link and/or simple contact form
- Optionally list wedding party contacts for day-of questions

### GLOBAL ELEMENTS
- **Navigation:** Sleek fixed header that changes on scroll (transparent → solid background). Hamburger menu on mobile with full-screen animated overlay. Desktop: minimal horizontal nav.
- **Footer:** Couple's names, wedding date, hashtag placeholder (#AndrewAndLyndsey or similar), and small links
- **Page transitions:** Smooth crossfade or slide transitions between all pages using Framer Motion + Next.js App Router
- **QR Code:** Generate a QR code component that links to the site URL — make it downloadable/printable for save-the-dates and invitations. Create a `/qr` utility page or include in admin.
- **Music:** Optional subtle background music toggle (OFF by default, user opt-in) — stretch goal
- **Accessibility:** Proper semantic HTML, alt tags on images, keyboard navigable, good contrast ratios

## DATABASE SCHEMA (Supabase)

### `guests` table
- id (uuid, primary key)
- first_name (text)
- last_name (text)  
- email (text, nullable)
- party_id (uuid, foreign key to parties)
- rsvp_status (enum: pending, accepted, declined)
- meal_choice (text, nullable)
- dietary_restrictions (text, nullable)
- notes (text, nullable)
- responded_at (timestamp, nullable)
- created_at (timestamp)

### `parties` table
- id (uuid, primary key)
- party_name (text) — e.g., "The Smith Family"
- max_guests (integer)
- address (text, nullable)
- invite_sent (boolean, default false)
- invite_sent_date (date, nullable)
- created_at (timestamp)

### `contact_messages` table
- id (uuid, primary key)
- name (text)
- email (text)
- message (text)
- created_at (timestamp)

## GUEST LIST IMPORT
- Andrew has a spreadsheet of all guests and invite tracking
- Build a script or admin tool to import CSV into the guests/parties tables
- CSV columns will likely include: name, address, party grouping, invite status

## FILE STRUCTURE
```
wedding-site/
├── CLAUDE.md
├── public/
│   ├── images/          # Couple photos, venue photos, etc.
│   └── fonts/           # Any custom fonts
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with nav, footer, transitions
│   │   ├── page.tsx          # Home
│   │   ├── our-story/
│   │   ├── faq/
│   │   ├── accommodations/
│   │   ├── registry/
│   │   ├── rsvp/
│   │   ├── contact/
│   │   ├── admin/
│   │   └── qr/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Nav, Footer, PageTransition
│   │   ├── home/            # Hero, Countdown, Schedule, etc.
│   │   ├── story/           # Timeline components
│   │   ├── rsvp/            # Multi-step form components
│   │   └── animations/      # Shared animation wrappers
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── constants.ts     # Wedding details, dates, etc.
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── scripts/
│   └── import-guests.ts     # CSV import script
└── supabase/
    └── migrations/          # DB schema migrations
```

## IMPORTANT NOTES
- Use placeholder images from Unsplash (romantic/wedding themed) until real photos are provided
- All wedding details (dates, times, addresses) are PLACEHOLDER — mark them clearly with TODO comments
- The site should be fully functional with placeholder content
- Prioritize mobile experience — most guests will use phones
- Performance matters — optimize images, lazy load below-fold content, minimize bundle size
- The RSVP system is the most critical functional piece — it must work flawlessly
- Make the QR code easily accessible for printing on physical invitations

## BUILD ORDER (suggested phases)
1. Project setup, layout, nav, footer, page transitions, global styles
2. Home page with all sections and countdown
3. Our Story timeline page
4. FAQ page
5. Accommodations page
6. Registry page
7. Supabase setup + RSVP system (DB, form, admin view)
8. Contact page
9. QR code generation
10. Polish: animations, performance, responsive testing, accessibility
11. Deploy to Vercel