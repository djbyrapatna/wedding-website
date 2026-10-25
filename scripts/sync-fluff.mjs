#!/usr/bin/env node
// ============================================
// Fluff Hero Sync
// ============================================
// Lists every image in public/images/photos/fluff/ and writes a JSON
// manifest at src/config/generated/fluff.json. The FluffHero component
// imports that manifest and picks a random image per page load.
// ============================================

import { readdir, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const FLUFF_DIR = "public/images/photos/fluff";
const OUTPUT_FILE = "src/config/generated/fluff.json";
const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function main() {
  let entries;
  try {
    entries = await readdir(FLUFF_DIR);
  } catch (err) {
    console.error(`Could not read ${FLUFF_DIR}: ${err.message}`);
    process.exit(1);
  }

  const files = entries
    .filter((f) => !f.startsWith("."))
    .filter((f) => VALID_EXT.has(extname(f).toLowerCase()))
    .sort();

  await writeFile(OUTPUT_FILE, JSON.stringify(files, null, 2) + "\n");
  console.log(`Wrote ${files.length} fluff image${files.length === 1 ? "" : "s"} to ${OUTPUT_FILE}.`);
  for (const f of files) console.log(`  - ${f}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
