"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import FluffHero from "@/components/layout/FluffHero";

import { REGISTRIES } from "@/config/registry";

const iconColorMap = {
  sage: "bg-sage/10 text-sage",
  gold: "bg-gold/10 text-gold",
};

export default function RegistryContent() {
  return (
    <>
      <FluffHero eyebrow={PAGE_COPY.app_registry_RegistryContent.gifts_registry} title={PAGE_COPY.app_registry_RegistryContent.registry} />

      {/* Registry Cards */}
      <section className="bg-ivory pb-20 pt-16 sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {REGISTRIES.map((registry, i) => {
              const Icon = registry.icon;
              const isComingSoon = registry.comingSoon;

              const cardClasses = `flex h-full flex-col items-center rounded-lg border border-linen bg-white p-6 text-center shadow-soft sm:p-8 ${
                isComingSoon ? "opacity-80" : "group transition-shadow hover:shadow-medium"
              }`;

              const body = (
                <>
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${iconColorMap[registry.color]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 font-serif text-xl text-charcoal">
                    {registry.name}
                  </h3>

                  {registry.description && (
                    <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal-light">
                      {registry.description}
                    </p>
                  )}

                  {isComingSoon ? (
                    <span className="mt-auto pt-6 inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-warm-gray">{PAGE_COPY.app_registry_RegistryContent.opening_soon}</span>
                  ) : (
                    <span className="mt-auto pt-6 inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.15em] text-sage transition-colors group-hover:text-gold">
                      {registry.internal ? "View the Fund" : "View Registry"}
                      {registry.internal ? (
                        <ArrowRight className="h-3 w-3" />
                      ) : (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </>
              );

              return (
                <FadeIn key={registry.name} delay={i * 0.12}>
                  {isComingSoon || !registry.url ? (
                    <div className={cardClasses}>{body}</div>
                  ) : registry.internal ? (
                    <Link
                      href={registry.url}
                      className={`${cardClasses} transition-transform hover:-translate-y-1.5`}
                    >
                      {body}
                    </Link>
                  ) : (
                    <motion.a
                      href={registry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                      className={cardClasses}
                    >
                      {body}
                    </motion.a>
                  )}
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
