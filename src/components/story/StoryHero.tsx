"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { WEDDING } from "@/config/wedding";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StoryHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.65, 0.82]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Heavy drop shadow so the white text stays crisp regardless of how
  // light or dark the photo behind it happens to be.
  const textShadow =
    "0 2px 18px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.9)";

  return (
    <section
      ref={ref}
      className="relative flex h-[55vh] items-center justify-center overflow-hidden sm:h-[70vh] md:h-[80vh]"
    >
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <Image
          src={PAGE_COPY.components_story_StoryHero.images_photos_engagement_proposal_4_jpg}
          alt={`${WEDDING.coupleName} — the proposal`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Charcoal scrim — fades in as you scroll */}
      <motion.div
        className="absolute inset-0 bg-charcoal"
        style={{ opacity: overlayOpacity }}
      />

      {/* Vertical gradient — extra darkness behind the text band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/40"
      />

      <motion.div
        className="relative z-10 px-6 text-center"
        style={{ opacity: contentOpacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ color: "#FFFFFF", textShadow, fontWeight: 700 }}
          className="font-sans text-[10px] uppercase tracking-[0.3em] sm:text-xs sm:tracking-[0.35em]"
        >{PAGE_COPY.components_story_StoryHero.how_it_all_began}</motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-5 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            textShadow,
            WebkitTextStroke: "0.5px #FFFFFF",
          }}
        >{PAGE_COPY.components_story_StoryHero.our_story}</motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={{ color: "#FFFFFF", textShadow, fontWeight: 600 }}
          className="mt-4 max-w-md font-serif text-base italic sm:mt-6 sm:text-lg"
        >{PAGE_COPY.components_story_StoryHero.every_love_story_is_beautiful_but_ours_is_our_favorite}</motion.p>
      </motion.div>
    </section>
  );
}
