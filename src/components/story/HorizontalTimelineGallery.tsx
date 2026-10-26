"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TIMELINE, type MilestoneItem } from "./milestones";
import gallery from "@/config/generated/gallery.json";

const MILESTONES = TIMELINE.filter(
  (item): item is MilestoneItem => item.type === "milestone"
);

const MILESTONES_BY_ID = new Map(MILESTONES.map((m) => [m.id, m]));

type GalleryEntry = {
  src: string;
  alt: string;
  date: string;
  source: string;
  milestoneId: string | null;
  width: number;
  height: number;
};

const PHOTOS = gallery as GalleryEntry[];

// ============================================
// Date math
// ============================================

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseMilestoneDate(d: string): Date {
  const tokens = d.replace(/,/g, "").split(/\s+/);
  const monthIdx = MONTH_NAMES.indexOf((tokens[0] || "").toLowerCase());
  const year = parseInt(tokens[tokens.length - 1] || "2025", 10);
  const day = tokens.length === 3 ? parseInt(tokens[1] || "15", 10) : 15;
  return new Date(year, monthIdx === -1 ? 0 : monthIdx, isNaN(day) ? 15 : day);
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function abbrevMonthFromTs(ts: number): string {
  return SHORT_MONTHS[new Date(ts).getMonth()];
}

function shortYearFromTs(ts: number): string {
  return `'${String(new Date(ts).getFullYear()).slice(-2)}`;
}

const MILESTONE_TICKS = MILESTONES.map((m) => ({
  ...m,
  ts: parseMilestoneDate(m.date).getTime(),
}));

const MIN_TS = MILESTONE_TICKS[0].ts;
const MAX_TS = MILESTONE_TICKS[MILESTONE_TICKS.length - 1].ts;
const SPAN = Math.max(1, MAX_TS - MIN_TS);

function pct(ts: number) {
  return ((ts - MIN_TS) / SPAN) * 100;
}

const MONTH_TICKS: number[] = (() => {
  const out: number[] = [];
  const start = new Date(MIN_TS);
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor.getTime() <= MAX_TS) {
    out.push(cursor.getTime());
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return out;
})();

const NAV_HEIGHT = 64;
const PLAYHEAD_COLOR = "#A3BDD1";

// Per-photo timestamp parsed once.
const PHOTO_TS = PHOTOS.map((p) => new Date(p.date).getTime());

export default function HorizontalTimelineGallery() {
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [playheadPct, setPlayheadPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Pivot is just below the sticky bar — the photo whose center is
      // closest to this line is the one the user is "looking at."
      const pivot = NAV_HEIGHT + 140;
      let bestIdx = 0;
      let bestDist = Infinity;
      photoRefs.current.forEach((node, i) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const d = Math.abs(center - pivot);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      setActivePhotoIdx(bestIdx);

      // Playhead: smoothly interpolate between this photo's timestamp
      // and the next one based on how far we've scrolled past this
      // photo's center. Gives a continuous slide instead of stepping
      // from photo to photo.
      const node = photoRefs.current[bestIdx];
      if (node && PHOTO_TS.length > 1) {
        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offsetFromPivot = pivot - center;
        const halfHeight = rect.height / 2;
        const lead = Math.max(-1, Math.min(1, offsetFromPivot / halfHeight));

        const curTs = PHOTO_TS[bestIdx];
        const neighborIdx =
          lead >= 0
            ? Math.min(bestIdx + 1, PHOTO_TS.length - 1)
            : Math.max(bestIdx - 1, 0);
        const neighborTs = PHOTO_TS[neighborIdx];
        const ts = curTs + (neighborTs - curTs) * Math.abs(lead) * 0.5;
        setPlayheadPct(Math.max(0, Math.min(100, pct(ts))));
      } else {
        setPlayheadPct(pct(PHOTO_TS[bestIdx] ?? MIN_TS));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activePhoto = PHOTOS[activePhotoIdx];
  const activeMilestone = activePhoto?.milestoneId
    ? MILESTONES_BY_ID.get(activePhoto.milestoneId) ?? null
    : null;
  const activeMilestoneIdx = activeMilestone
    ? MILESTONES.findIndex((m) => m.id === activeMilestone.id)
    : -1;

  // The date column always tracks where we are in time — derive it from
  // the active photo so it keeps moving smoothly even between milestones.
  const activeTs = activePhoto
    ? new Date(activePhoto.date).getTime()
    : MIN_TS;
  const activeMon = abbrevMonthFromTs(activeTs);
  const activeYr = shortYearFromTs(activeTs);
  const dateKey = `${activeMon}-${activeYr}`;

  return (
    <section className="relative bg-cream">
      {/* Single sticky bar — the browser handles the pin transition. */}
      <div className="sticky top-16 z-30 border-b border-linen bg-cream">
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pb-5 sm:pt-7">
          {/* Header row — date column always visible, title fades only on
              milestone photos. */}
          <div className="relative flex min-h-[44px] items-center gap-3 sm:min-h-[48px]">
            {/* Left — stacked Mon / 'YY, derived from the active photo's
                date so it slides through time even between milestones. */}
            <div className="flex w-14 shrink-0 flex-col items-start font-serif leading-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={dateKey}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="text-lg sm:text-xl"
                  style={{ color: "#2C2C2C", fontWeight: 500 }}
                >
                  {activeMon}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={activeYr}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="mt-0.5 font-serif text-base italic text-warm-gray sm:text-lg"
                  style={{ fontWeight: 500 }}
                >
                  {activeYr}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Center — title + blurb crossfade only when on a milestone. */}
            <div className="relative min-w-0 flex-1 text-center">
              <AnimatePresence initial={false}>
                {activeMilestone && (
                  <motion.div
                    key={activeMilestone.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <h3
                      className="font-serif text-sm leading-tight sm:text-base"
                      style={{ color: "#2C2C2C", fontWeight: 600 }}
                    >
                      {activeMilestone.title}
                    </h3>
                    <p className="mt-0.5 font-serif text-[11px] italic leading-tight text-warm-gray sm:text-xs">
                      {activeMilestone.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right spacer for true center */}
            <div className="w-14 shrink-0" />
          </div>

          {/* Ruler */}
          <div className="relative mt-3 h-7">
            <div
              aria-hidden
              className="absolute bottom-0 left-0 right-0 h-px bg-linen"
            />

            {MONTH_TICKS.map((ts) => (
              <div
                key={`mo-${ts}`}
                aria-hidden
                className="absolute bottom-0 w-px bg-warm-gray/30"
                style={{ left: `${pct(ts)}%`, height: 6 }}
              />
            ))}

            {MILESTONE_TICKS.map((m, i) => {
              const isPast =
                activeMilestoneIdx >= 0 && i <= activeMilestoneIdx;
              const isActive = i === activeMilestoneIdx;
              return (
                <div
                  key={m.id}
                  title={`${m.date} — ${m.title}`}
                  aria-hidden
                  className="absolute bottom-0 -translate-x-1/2 transition-opacity duration-300 ease-out"
                  style={{
                    left: `${pct(m.ts)}%`,
                    width: isActive ? 3 : 2,
                    height: isActive ? 18 : 14,
                    background: "#D4B85C",
                    opacity: isPast ? 1 : 0.4,
                    borderRadius: 1,
                  }}
                />
              );
            })}

            <div
              aria-hidden
              className="absolute bottom-0 -translate-x-1/2 transition-[left] duration-300 ease-out"
              style={{
                left: `${playheadPct}%`,
                width: 3,
                height: 26,
                background: PLAYHEAD_COLOR,
                boxShadow: "0 0 14px rgba(163, 189, 209, 0.75)",
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Photo gallery — vertical scroll */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="space-y-5 sm:space-y-7">
          {PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              ref={(el) => {
                photoRefs.current[i] = el;
              }}
              className="overflow-hidden rounded-md bg-ivory shadow-medium"
            >
              <Image
                src={`/images/photos/${photo.src}`}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="h-auto w-full"
                sizes="(max-width: 768px) 100vw, 640px"
                priority={i < 2}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
