"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import FluffHero from "@/components/layout/FluffHero";

import { SECTIONS } from "@/config/recommendations";

const iconBg: Record<"sage" | "gold", string> = {
  sage: "bg-sage/10 text-sage",
  gold: "bg-gold/10 text-gold",
};

function mapHref(query: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

export default function ThingsToDoContent() {
  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_things_to_do_ThingsToDoContent.our_local_tips}
        title={PAGE_COPY.app_things_to_do_ThingsToDoContent.things_to_do_in_austin}
        subtitle={PAGE_COPY.app_things_to_do_ThingsToDoContent.a_handful_of_our_favorite_spots_if_you_have_time_to_wan}
      />

      {/* Sections */}
      <section className="bg-ivory pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-5xl space-y-12 px-6 sm:space-y-16">
          {SECTIONS.map((section, sIdx) => {
            const Icon = section.icon;
            return (
              <FadeIn key={section.title} delay={sIdx * 0.05}>
                <div>
                  {/* Section header */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg[section.iconColor]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">
                      {section.title}
                    </h2>
                  </div>

                  {/* Cards */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {section.places.map((place) => (
                      <motion.a
                        key={place.name}
                        href={mapHref(place.query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.25 }}
                        className="group flex items-center justify-between rounded-lg border border-linen bg-white px-4 py-4 shadow-soft transition-shadow hover:shadow-medium sm:px-5"
                      >
                        <span className="font-serif text-base text-charcoal sm:text-lg">
                          {place.name}
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-warm-gray transition-colors group-hover:text-sage" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>
    </>
  );
}
