"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import FadeIn from "@/components/animations/FadeIn";
import FLUFF from "@/config/generated/fluff.json";

const FLUFF_FILES = FLUFF as string[];

const TEXT_SHADOW =
  "0 2px 18px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.9)";

interface FluffHeroProps {
  /** Top eyebrow line — small uppercase tracker. */
  eyebrow: string;
  /** Page title. */
  title: string;
  /** Optional italic subtitle below the divider. */
  subtitle?: ReactNode;
}

/**
 * Reusable hero used by every page that doesn't have its own bespoke
 * hero (i.e. everything except the home page and Our Story). Picks a
 * random image from public/images/photos/fluff/ on every page load so
 * the same page shows different artwork on each refresh.
 *
 * The section ships with a charcoal background so the hero looks
 * "complete" on first paint — the random image then fades in once it
 * loads, instead of users seeing a blank gap then a sudden pop.
 *
 * Forces white text via inline styles + heavy text-shadow so it reads
 * cleanly on any photo behind it.
 */
export default function FluffHero({ eyebrow, title, subtitle }: FluffHeroProps) {
  const [file, setFile] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Pick after mount so the SSR HTML is identical for every visitor
  // (avoids a hydration mismatch from differing Math.random() values).
  useEffect(() => {
    if (FLUFF_FILES.length === 0) return;
    setFile(FLUFF_FILES[Math.floor(Math.random() * FLUFF_FILES.length)]);
  }, []);

  return (
    <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-charcoal pt-24 sm:min-h-[60vh] sm:pt-28">
      {/* Background image — fades in once it's actually decoded so the
          dark section is fully styled from the very first paint. */}
      {file && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={`/images/photos/fluff/${file}`}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            onLoad={() => setLoaded(true)}
          />
        </div>
      )}

      {/* Lighter scrim — keeps text readable without dimming photos too much. */}
      <div aria-hidden className="absolute inset-0 bg-charcoal/40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/25"
      />

      <div className="relative z-10 px-6 py-10 text-center sm:py-14">
        <FadeIn>
          <p
            className="font-sans text-[10px] uppercase tracking-[0.3em] sm:text-xs sm:tracking-[0.35em]"
            style={{ color: "#FFFFFF", textShadow: TEXT_SHADOW, fontWeight: 600 }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl"
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              textShadow: TEXT_SHADOW,
              WebkitTextStroke: "0.5px #FFFFFF",
            }}
          >
            {title}
          </h1>
          <div className="mx-auto mt-5 h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          {subtitle && (
            <p
              className="mx-auto mt-5 max-w-xl font-serif text-base italic sm:text-lg"
              style={{ color: "#FFFFFF", textShadow: TEXT_SHADOW, fontWeight: 500 }}
            >
              {subtitle}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
