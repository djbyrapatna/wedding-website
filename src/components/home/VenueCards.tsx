"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { WEDDING } from "@/lib/constants";
import FadeIn from "@/components/animations/FadeIn";

interface VenueCardProps {
  type: "ceremony" | "reception";
  name: string;
  address: string;
  time: string;
  mapUrl: string;
  image: string;
  delay?: number;
}

function VenueCard({ type, name, address, time, mapUrl, image, delay = 0 }: VenueCardProps) {
  return (
    <FadeIn delay={delay} className="flex flex-1">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-linen bg-white shadow-soft transition-shadow hover:shadow-medium"
      >
        {/* Venue Image */}
        <div className="relative h-40 overflow-hidden sm:h-48">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8 md:p-10">
          {/* Top Accent */}
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">{PAGE_COPY.components_home_VenueCards.the}{type}
          </p>

          <h3 className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl">
            {name}
          </h3>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span className="font-sans text-sm text-charcoal-light">{time}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <span className="font-sans text-sm leading-relaxed text-charcoal-light">
                {address}
              </span>
            </div>
          </div>

          {type === "ceremony" && (
            <div className="mt-6 rounded-md border border-gold/40 bg-gold/5 px-4 py-3">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-charcoal">{PAGE_COPY.components_home_VenueCards.dress_code_applies}</p>
              <p className="mt-1.5 font-sans text-xs leading-relaxed text-charcoal-light">{PAGE_COPY.components_home_VenueCards.the_church_has_specific_attire_guidelines_please_review}{" "}
                <Link
                  href="/faq"
                  className="font-semibold text-sage underline decoration-gold/60 underline-offset-2 transition-colors hover:text-gold hover:decoration-gold"
                >{PAGE_COPY.components_home_VenueCards.faq_page}</Link>{" "}{PAGE_COPY.components_home_VenueCards.before_the_ceremony}</p>
            </div>
          )}

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-2 pt-6 font-sans text-xs font-medium uppercase tracking-[0.15em] text-sage transition-colors hover:text-gold"
          >
            <Navigation className="h-3.5 w-3.5" />{PAGE_COPY.components_home_VenueCards.get_directions}</a>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export default function VenueCards() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.components_home_VenueCards.join_us}</p>
            <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.components_home_VenueCards.the_celebration}</h2>
            <div className="divider-gold" />
          </div>
        </FadeIn>

        <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-12 sm:gap-6 md:flex-row md:gap-8">
          <VenueCard
            type="ceremony"
            name={WEDDING.ceremony.name}
            address={WEDDING.ceremony.address}
            time={WEDDING.ceremony.time}
            mapUrl={WEDDING.ceremony.mapUrl}
            image="/images/sjn_church.jpeg"
            delay={0.15}
          />
          <VenueCard
            type="reception"
            name={WEDDING.reception.name}
            address={WEDDING.reception.address}
            time={WEDDING.reception.time}
            mapUrl={WEDDING.reception.mapUrl}
            image="/images/hotel_ella_front.jpg"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
