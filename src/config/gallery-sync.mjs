export const FILENAME_TO_MILESTONE = {
  "first date.jpg": "first-date",
  "shreveport .jpg": "first-shreveport",
  "boyfriend girlfriend.jpg": "official",
  "andrew grad.jpg": "andrew-graduation",
  "tough mudder.jpg": "tough-mudder",
  "taylor swift.JPG": "eras",
  "first AFC game.jpg": "austin-fc",
  "lyndsey moved to atx.jpg": "lyndsey-austin",
  "TAMU vs ND cstat.jpg": "nd-am-2024",
  "nyc.jpg": "nyc",
  "xmas in kc.jpg": "christmas-kc",
  "ring_render.jpg": "ring-shopping",
  "notre dame vs tamu2.jpg": "nd-am-2025",
  "proposal.jpg": "engaged",
  "our wedding day.jpg": "wedding",
};

// Manual date overrides for photos that have no EXIF metadata (e.g.
// screenshots, exports). Filename → "YYYY-MM-DD". Wins over EXIF, so
// don't add a file here unless you really mean to override.
export const MANUAL_DATES = {
  "IMG_1897.jpg": "2022-05-15",
  "IMG_2909.jpg": "2022-10-15",
  "IMG_0073.jpg": "2025-06-15",
};

// Canonical milestone dates used to override a labeled photo's date when
// its EXIF is missing or unreliable. Keep in sync with milestones.ts.
export const MILESTONE_DATES = {
  met: "2021-07-05",
  "first-date": "2021-08-15",
  "shreveport-move": "2021-08-20",
  "first-shreveport": "2021-10-15",
  official: "2022-01-07",
  "andrew-graduation": "2022-05-21",
  "lyndsey-graduation": "2022-05-22",
  "tough-mudder": "2022-10-15",
  hometown: "2022-11-15",
  eras: "2023-03-31",
  "austin-fc": "2023-07-15",
  "lyndsey-austin": "2024-04-15",
  "nd-am-2024": "2024-08-31",
  nyc: "2024-11-15",
  "christmas-kc": "2024-12-22",
  "ring-shopping": "2025-09-05",
  "nd-am-2025": "2025-09-13",
  engaged: "2025-12-14",
  wedding: "2026-08-15",
};

