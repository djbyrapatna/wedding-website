"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WEDDING } from "@/lib/constants";
import FadeIn from "@/components/animations/FadeIn";

interface TimeUnit {
  value: number;
  label: string;
}

function getTimeRemaining(): TimeUnit[] {
  const now = new Date().getTime();
  const target = WEDDING.date.getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];
}

function CountdownDigit({ value, label }: TimeUnit) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden sm:h-24 sm:w-24 md:h-28 md:w-28">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-serif text-4xl font-light text-charcoal sm:text-6xl md:text-7xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-warm-gray">
        {label}
      </span>
    </div>
  );
}

export default function Countdown() {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>(() =>
    getTimeRemaining()
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeUnits(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch — render zeroes until client mounts
  const displayUnits = mounted
    ? timeUnits
    : [
        { value: 0, label: "Days" },
        { value: 0, label: "Hours" },
        { value: 0, label: "Minutes" },
        { value: 0, label: "Seconds" },
      ];

  return (
    <section className="section-padding bg-white" aria-label="Wedding countdown timer">
      <div className="mx-auto max-w-4xl px-6 text-center" aria-live="polite" aria-atomic="true">
        <FadeIn>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.components_home_Countdown.counting_down_to}</p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.components_home_Countdown.our_wedding_day}</h2>
          <div className="divider-gold" />
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex items-start justify-center gap-1 sm:gap-4 md:gap-8">
            {displayUnits.map((unit, i) => (
              <div key={unit.label} className="flex items-start gap-1 sm:gap-4 md:gap-8">
                <CountdownDigit value={unit.value} label={unit.label} />
                {i < displayUnits.length - 1 && (
                  <span className="mt-4 font-serif text-2xl text-gold/40 sm:mt-5 sm:text-3xl md:mt-6 md:text-5xl">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="mt-10 font-serif text-lg italic text-warm-gray">
            {WEDDING.dayOfWeek}, {WEDDING.dateDisplay}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
