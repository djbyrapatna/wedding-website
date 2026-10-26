// ============================================
// RELATIONSHIP TIMELINE — Andrew & Lyndsey
// ============================================
// Items render top-to-bottom in this order. Each item is either a
// milestone (date + title + short description) or a photo. On desktop,
// the `side` field places it left or right of the center line. On
// mobile everything stacks on a single left-line layout.
// Gallery photos (from public/images/photos/gallery/, after running
// `npm run sync-gallery`) are auto-sprinkled by EXIF date — see
// Timeline.tsx for that logic.
// ============================================

export type MilestoneItem = {
  type: "milestone";
  id: string;
  date: string;
  title: string;
  description: string;
  side: "left" | "right";
};

export type PhotoItem = {
  type: "photo";
  /** path under /images/photos/, e.g. "engagement/01.jpg" */
  src: string;
  alt: string;
  side: "left" | "right";
  aspect?: "portrait" | "square" | "landscape";
  /** small visual rotation in degrees, optional */
  tilt?: number;
};

export type TimelineItem = MilestoneItem | PhotoItem;

export const TIMELINE: TimelineItem[] = [
  {
    type: "milestone",
    id: "met",
    date: "July 5, 2021",
    title: "How we met",
    description: "A summer night in Austin.",
    side: "left",
  },
  {
    type: "milestone",
    id: "first-date",
    date: "August 15, 2021",
    title: "First date",
    description: "Five years before our wedding day.",
    side: "right",
  },
  {
    type: "milestone",
    id: "shreveport-move",
    date: "August 2021",
    title: "Lyndsey moves to Shreveport",
    description: "Long-distance begins.",
    side: "left",
  },
  {
    type: "milestone",
    id: "first-shreveport",
    date: "October 2021",
    title: "First trip to Shreveport",
    description: "Andrew makes the drive.",
    side: "right",
  },
  {
    type: "milestone",
    id: "official",
    date: "January 7, 2022",
    title: "Boyfriend & girlfriend",
    description: "Officially together.",
    side: "left",
  },
  {
    type: "milestone",
    id: "andrew-graduation",
    date: "May 2022",
    title: "Andrew's graduation",
    description: "Notre Dame, class of 2020.",
    side: "right",
  },
  {
    type: "milestone",
    id: "lyndsey-graduation",
    date: "May 2022",
    title: "Lyndsey's graduation",
    description: "Dietetic internship complete.",
    side: "left",
  },
  {
    type: "milestone",
    id: "tough-mudder",
    date: "October 2022",
    title: "Tough Mudder",
    description: "Mud, walls, ice baths.",
    side: "right",
  },
  {
    type: "milestone",
    id: "hometown",
    date: "November 2022",
    title: "Andrew's hometown",
    description: "First trip out west.",
    side: "left",
  },
  {
    type: "milestone",
    id: "eras",
    date: "March 31, 2023",
    title: "Taylor Swift · Eras Tour",
    description: "A surprise neither will forget.",
    side: "right",
  },
  {
    type: "milestone",
    id: "austin-fc",
    date: "July 2023",
    title: "First Austin FC game",
    description: "Last-second tickets at Q2.",
    side: "left",
  },
  {
    type: "milestone",
    id: "lyndsey-austin",
    date: "April 2024",
    title: "Lyndsey moves to Austin",
    description: "Same city, finally.",
    side: "right",
  },
  {
    type: "milestone",
    id: "nd-am-2024",
    date: "August 31, 2024",
    title: "Notre Dame at Texas A&M",
    description: "ND 23, A&M 13 at Kyle Field.",
    side: "left",
  },
  {
    type: "milestone",
    id: "nyc",
    date: "November 2024",
    title: "Trip to New York City",
    description: "Lyndsey's first time in NYC.",
    side: "right",
  },
  {
    type: "milestone",
    id: "christmas-kc",
    date: "December 2024",
    title: "Christmas in Kansas City",
    description: "Christmas with the Hicks family.",
    side: "left",
  },
  {
    type: "milestone",
    id: "ring-shopping",
    date: "September 2025",
    title: "Ring shopping",
    description: "Andrew designs the ring.",
    side: "right",
  },
  {
    type: "milestone",
    id: "nd-am-2025",
    date: "September 13, 2025",
    title: "Texas A&M at Notre Dame",
    description: "A&M 41, ND 40 — final play.",
    side: "left",
  },
  {
    type: "milestone",
    id: "engaged",
    date: "December 14, 2025",
    title: "Engaged",
    description: "The yes.",
    side: "right",
  },
  {
    type: "milestone",
    id: "wedding",
    date: "August 15, 2026",
    title: "Our wedding day",
    description: "Full circle, in Austin.",
    side: "left",
  },
];
