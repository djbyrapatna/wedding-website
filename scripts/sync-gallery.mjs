#!/usr/bin/env node
// ============================================
// Gallery EXIF Sync
// ============================================
// Reads every image in public/images/photos/gallery/, pulls the EXIF
// DateTimeOriginal (or CreateDate fallback) out of it, and writes a
// date-sorted manifest to src/config/generated/gallery.json.
//
// Filenames matching FILENAME_TO_MILESTONE are tagged with the
// corresponding milestone id and have their date overridden with the
// milestone's canonical date (so labeled photos always sort to the
// right slot, even if EXIF is missing or unreliable).
//
// The Timeline component reads the manifest and shows the milestone
// label only when the user is currently viewing a photo tagged to
// that milestone. Untagged photos play between milestones with the
// label hidden.
//
// Run after dropping new gallery photos in:
//   npm run sync-gallery
// ============================================

import exifr from "exifr";
import { imageSize } from "image-size";
import { readdir, writeFile, stat, readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const GALLERY_DIR = "public/images/photos/gallery";
const OUTPUT_FILE = "src/config/generated/gallery.json";
// HEIC excluded — most browsers can't render it, so any .HEIC in the
// gallery would show as a broken image in the timeline.
const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Map a renamed filename to a milestone id from src/components/story/milestones.ts.
// Anything not in this map shows in the timeline as a between-milestone "fluff"
// photo with no label.
import { FILENAME_TO_MILESTONE, MANUAL_DATES, MILESTONE_DATES } from "../src/config/gallery-sync.mjs";

async function main() {
  let entries;
  try {
    entries = await readdir(GALLERY_DIR);
  } catch (err) {
    console.error(`Could not read ${GALLERY_DIR}: ${err.message}`);
    process.exit(1);
  }

  const photos = [];

  for (const file of entries) {
    if (file.startsWith(".")) continue; // .gitkeep, .DS_Store
    const ext = extname(file).toLowerCase();
    if (!VALID_EXT.has(ext)) continue;

    const fullPath = join(GALLERY_DIR, file);
    const milestoneId = FILENAME_TO_MILESTONE[file] ?? null;

    let isoDate = null;
    let source = "missing";
    try {
      const meta = await exifr.parse(fullPath, {
        pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      });
      const exifDate = meta?.DateTimeOriginal || meta?.CreateDate;
      if (exifDate instanceof Date && !isNaN(exifDate.getTime())) {
        isoDate = exifDate.toISOString();
        source = meta?.DateTimeOriginal ? "DateTimeOriginal" : "CreateDate";
      }
    } catch {
      // Fall through to fallback chain
    }

    // For labeled photos, override the date with the canonical milestone
    // date so they always sort exactly where the milestone sits — even if
    // EXIF is missing or wrong.
    if (milestoneId && MILESTONE_DATES[milestoneId]) {
      isoDate = new Date(`${MILESTONE_DATES[milestoneId]}T12:00:00Z`).toISOString();
      source = "milestone-override";
    }

    // Manual per-filename override beats both EXIF and mtime. Used for
    // photos with no usable metadata.
    if (MANUAL_DATES[file]) {
      isoDate = new Date(`${MANUAL_DATES[file]}T12:00:00Z`).toISOString();
      source = "manual-override";
    }

    if (!isoDate) {
      try {
        const s = await stat(fullPath);
        isoDate = s.mtime.toISOString();
        source = "mtime";
      } catch {
        isoDate = new Date().toISOString();
        source = "fallback";
      }
    }

    let width = 1200;
    let height = 1500;
    try {
      const buf = await readFile(fullPath);
      const dims = imageSize(buf);
      if (dims.width && dims.height) {
        width = dims.width;
        height = dims.height;
      }
    } catch {
      // fall back to default portrait dimensions
    }

    photos.push({
      src: `gallery/${file}`,
      alt: "Andrew & Lyndsey",
      date: isoDate,
      source,
      milestoneId,
      width,
      height,
    });
  }

  photos.sort((a, b) => a.date.localeCompare(b.date));

  await writeFile(OUTPUT_FILE, JSON.stringify(photos, null, 2) + "\n");

  console.log(
    `Wrote ${photos.length} gallery photo${photos.length === 1 ? "" : "s"} to ${OUTPUT_FILE}.`
  );
  for (const p of photos) {
    const tag = p.milestoneId ? ` [${p.milestoneId}]` : "";
    console.log(`  - ${p.src} (${p.date.slice(0, 10)} via ${p.source})${tag}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
