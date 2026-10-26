"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { WEDDING } from "@/lib/constants";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <Image
          src={PAGE_COPY.components_home_Hero.images_std_beach_bkgd_jpg}
          alt={WEDDING.coupleName}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/30" />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-4xl px-4 text-center sm:px-6"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] sm:text-sm sm:tracking-[0.35em]"
          style={{ color: "#FFFFFF", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}
        >{PAGE_COPY.components_home_Hero.the_wedding_of}</motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 font-serif text-[2.75rem] leading-none tracking-wide sm:mt-8 sm:text-7xl md:text-8xl lg:text-9xl"
          style={{ color: "#D4B85C", fontWeight: 400, textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)" }}
        >
          {WEDDING.brideFirstName}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="my-1.5 flex items-center justify-center gap-3 sm:my-3 sm:gap-4"
        >
          <div className="h-px w-8 sm:w-16" style={{ backgroundColor: "#FFFFFF" }} />
          <span
            className="font-serif text-2xl italic sm:text-4xl"
            style={{ color: "#FFFFFF", textShadow: "0 2px 15px rgba(0,0,0,0.8)" }}
          >{PAGE_COPY.components_home_Hero.text}</span>
          <div className="h-px w-8 sm:w-16" style={{ backgroundColor: "#FFFFFF" }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-serif text-[2.75rem] leading-none tracking-wide sm:text-7xl md:text-8xl lg:text-9xl"
          style={{ color: "#D4B85C", fontWeight: 400, textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6)" }}
        >
          {WEDDING.groomFirstName}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mx-auto mt-6 h-px w-16 sm:mt-8 sm:w-24"
          style={{ background: "linear-gradient(90deg, transparent, #FFFFFF, transparent)" }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-4 font-serif text-3xl italic sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl"
          style={{ color: "#FFFFFF", textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)" }}
        >
          {WEDDING.dayOfWeek}, {WEDDING.dateDisplay}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.7 }}
          className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.25em] sm:mt-3 sm:text-base sm:tracking-[0.3em]"
          style={{ color: "#FFFFFF", textShadow: "0 1px 10px rgba(0,0,0,0.9)" }}
        >
          {WEDDING.location}
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:bottom-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5 sm:gap-2"
        >
          <span
            className="font-sans text-[9px] uppercase tracking-[0.3em] sm:text-[10px]"
            style={{ color: "#FFFFFF", textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
          >{PAGE_COPY.components_home_Hero.scroll}</span>
          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: "#FFFFFF", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.8))" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
