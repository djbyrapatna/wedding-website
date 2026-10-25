// ============================================
// PHOTO REGISTRY
// ============================================
// Drop image files in `public/images/photos/<category>/`.
// Add an entry here referencing the filename and the alt text.
// The Timeline component (and future photo components) read from
// this registry, so adding a photo = drop file + add one line.
// ============================================

export type PhotoAspect = "portrait" | "square" | "landscape";

export type Photo = {
  /** filename relative to /public/images/photos/, e.g. "engagement/01.jpg" */
  src: string;
  /** what the image shows; required for accessibility */
  alt: string;
  /** how to crop the image into its container; defaults to "portrait" */
  aspect?: PhotoAspect;
};

// Engagement + proposal photos — use these in the timeline,
// future engagement gallery, etc.
export const ENGAGEMENT_PHOTOS: Photo[] = [
  { src: "engagement/proposal-1.jpg", alt: "The proposal" },
  { src: "engagement/proposal-3.jpg", alt: "The proposal" },
  { src: "engagement/proposal-4.jpg", alt: "The proposal" },
  { src: "engagement/proposal-6.jpg", alt: "The proposal" },
  { src: "engagement/proposal-9.jpg", alt: "The proposal" },
  { src: "engagement/proposal-18.jpg", alt: "The proposal" },
  { src: "engagement/proposal-22.jpg", alt: "The proposal" },
  { src: "engagement/proposal-27.jpg", alt: "The proposal" },
  { src: "engagement/proposal-30.jpg", alt: "The proposal" },
  { src: "engagement/IMG_1601.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1602.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1604.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1611.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1614.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1621.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1625.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1626.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1631.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1635.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1637.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1641.jpg", alt: "Engagement" },
  { src: "engagement/IMG_1824.jpg", alt: "Engagement" },
];

// General gallery — candids, dates, vacations, etc.
export const GALLERY_PHOTOS: Photo[] = [];
