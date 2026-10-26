"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Plane,
  Car,
  ExternalLink,
  Clock,
  BedDouble,
  ChevronDown,
} from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import AustinInteractiveMap from "@/components/accommodations/AustinInteractiveMap";
import FluffHero from "@/components/layout/FluffHero";

import { HOTELS } from "@/config/hotels";

// Offsets in-page anchor jumps so the fixed nav doesn't cover the heading.
const SCROLL_MT = "scroll-mt-24 sm:scroll-mt-28";

export default function AccommodationsContent() {
  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_accommodations_AccommodationsContent.your_travel_guide}
        title={PAGE_COPY.app_accommodations_AccommodationsContent.getting_there_staying}
        subtitle={PAGE_COPY.app_accommodations_AccommodationsContent.everything_you_need_to_plan_your_trip_to_austin_flights}
      />

      {/* Section 1: Key Locations — moved to top because "where is everything"
          is the most-asked question. Includes jump chips to the rest of the
          page so guests know there's more below. */}
      <section className="bg-ivory pb-12 pt-12 sm:pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.app_accommodations_AccommodationsContent.key_locations}</h2>
              <div className="divider-gold" />
            </div>
          </FadeIn>

          {/* Map Legend */}
          <FadeIn delay={0.1}>
            <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">1</span>
                <span className="font-sans text-xs text-charcoal sm:text-sm">{PAGE_COPY.app_accommodations_AccommodationsContent.austin_bergstrom_airport_aus}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">2</span>
                <span className="font-sans text-xs text-charcoal sm:text-sm">{PAGE_COPY.app_accommodations_AccommodationsContent.ceremony_st_john_neumann}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-white">3</span>
                <span className="font-sans text-xs text-charcoal sm:text-sm">{PAGE_COPY.app_accommodations_AccommodationsContent.reception_hotel_ella}</span>
              </div>
            </div>
          </FadeIn>

          {/* Interactive Austin map */}
          <FadeIn delay={0.2}>
            <div className="mt-6">
              <AustinInteractiveMap />
            </div>
            <p className="mt-3 text-center font-sans text-xs text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.tap_a_pin_for_directions_all_three_locations_are_within}</p>
          </FadeIn>

          {/* Quick direction cards */}
          <FadeIn delay={0.3}>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <a
                href="https://maps.google.com/?q=Austin-Bergstrom+International+Airport"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-linen bg-white p-4 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-bold text-white">1</span>
                <div>
                  <p className="font-sans text-sm font-medium text-charcoal group-hover:text-sage transition-colors">{PAGE_COPY.app_accommodations_AccommodationsContent.austin_airport_aus}</p>
                  <p className="font-sans text-xs text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.get_directions}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-warm-gray group-hover:text-sage transition-colors" />
              </a>

              <a
                href="https://maps.google.com/?q=St+John+Neumann+Catholic+Church+Austin+TX"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-linen bg-white p-4 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">2</span>
                <div>
                  <p className="font-sans text-sm font-medium text-charcoal group-hover:text-gold transition-colors">{PAGE_COPY.app_accommodations_AccommodationsContent.ceremony_st_john_neumann_1}</p>
                  <p className="font-sans text-xs text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.get_directions_2}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-warm-gray group-hover:text-gold transition-colors" />
              </a>

              <a
                href="https://maps.google.com/?q=Hotel+Ella+Austin+TX"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-linen bg-white p-4 shadow-soft transition-all hover:shadow-medium hover:-translate-y-1"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-bold text-white">3</span>
                <div>
                  <p className="font-sans text-sm font-medium text-charcoal group-hover:text-sage transition-colors">{PAGE_COPY.app_accommodations_AccommodationsContent.reception_hotel_ella_3}</p>
                  <p className="font-sans text-xs text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.get_directions_4}</p>
                </div>
                <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-warm-gray group-hover:text-sage transition-colors" />
              </a>
            </div>
          </FadeIn>

          {/* In-page jump chips — let guests know there's more below, and
              click straight to it instead of hunting. */}
          <FadeIn delay={0.4}>
            <div className="mt-12 border-t border-linen pt-10">
              <p className="text-center font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.more_on_this_page}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#flights"
                  className="group inline-flex items-center gap-2 rounded-full border border-linen bg-white px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-charcoal shadow-soft transition-all hover:-translate-y-0.5 hover:border-sage hover:text-sage hover:shadow-medium"
                >
                  <Plane className="h-3.5 w-3.5 text-sage" />{PAGE_COPY.app_accommodations_AccommodationsContent.flights}</a>
                <a
                  href="#airport"
                  className="group inline-flex items-center gap-2 rounded-full border border-linen bg-white px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-charcoal shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold hover:shadow-medium"
                >
                  <Car className="h-3.5 w-3.5 text-gold" />{PAGE_COPY.app_accommodations_AccommodationsContent.getting_around}</a>
                <a
                  href="#hotels"
                  className="group inline-flex items-center gap-2 rounded-full border border-linen bg-white px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-charcoal shadow-soft transition-all hover:-translate-y-0.5 hover:border-sage hover:text-sage hover:shadow-medium"
                >
                  <BedDouble className="h-3.5 w-3.5 text-sage" />{PAGE_COPY.app_accommodations_AccommodationsContent.where_to_stay}</a>
              </div>
              <motion.p
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mt-5 flex items-center justify-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.2em] text-warm-gray"
              >
                <ChevronDown className="h-3 w-3" />{PAGE_COPY.app_accommodations_AccommodationsContent.scroll_for_details}</motion.p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 2: Flights */}
      <section id="flights" className={`bg-ivory pb-8 pt-8 sm:pb-12 sm:pt-12 ${SCROLL_MT}`}>
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="rounded-lg border border-linen bg-white p-8 shadow-soft sm:p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10">
                  <Plane className="h-5 w-5 text-sage" />
                </div>
                <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">{PAGE_COPY.app_accommodations_AccommodationsContent.flights_5}</h2>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-charcoal-light sm:text-base">{PAGE_COPY.app_accommodations_AccommodationsContent.fly_into}<strong>{PAGE_COPY.app_accommodations_AccommodationsContent.austin_bergstrom_international_airport_aus}</strong>{PAGE_COPY.app_accommodations_AccommodationsContent.located_about_15_minutes_from_downtown_austin_and_appro}</p>
              <a
                href="https://www.google.com/travel/flights?q=flights%20to%20AUS%20on%202026-08-14%20through%202026-08-16"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-sage-dark"
              >
                <Plane className="h-3.5 w-3.5" />{PAGE_COPY.app_accommodations_AccommodationsContent.browse_flights}</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 3: Getting from the Airport */}
      <section id="airport" className={`bg-ivory pb-12 pt-4 sm:pb-16 ${SCROLL_MT}`}>
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="rounded-lg border border-linen bg-white p-8 shadow-soft sm:p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/10">
                  <Car className="h-5 w-5 text-sage" />
                </div>
                <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">{PAGE_COPY.app_accommodations_AccommodationsContent.getting_from_the_airport}</h2>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Uber/Lyft */}
                <div className="rounded-lg border border-linen bg-ivory/50 p-6">
                  <h3 className="font-serif text-lg text-charcoal">{PAGE_COPY.app_accommodations_AccommodationsContent.uber_lyft}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-light">{PAGE_COPY.app_accommodations_AccommodationsContent.the_easiest_way_to_get_around_austin_expect}<strong>$20–30</strong>{PAGE_COPY.app_accommodations_AccommodationsContent.to_downtown_about_a}<strong>{PAGE_COPY.app_accommodations_AccommodationsContent["15_20_minute"]}</strong>{PAGE_COPY.app_accommodations_AccommodationsContent.ride}</p>
                  <div className="mt-3 rounded-md bg-sage/5 p-3">
                    <p className="font-sans text-xs leading-relaxed text-charcoal-light">
                      <strong className="text-sage">{PAGE_COPY.app_accommodations_AccommodationsContent.tip}</strong>{PAGE_COPY.app_accommodations_AccommodationsContent.the_rideshare_pickup_at_aus_is_on_the_second_floor_of_t}</p>
                  </div>
                </div>

                {/* Rental Cars */}
                <div className="rounded-lg border border-linen bg-ivory/50 p-6">
                  <h3 className="font-serif text-lg text-charcoal">{PAGE_COPY.app_accommodations_AccommodationsContent.rental_cars}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-light">{PAGE_COPY.app_accommodations_AccommodationsContent.available_on_the_arrival_level_across_from_the_terminal}</p>
                  <p className="mt-3 font-sans text-sm text-charcoal-light">
                    <strong>{PAGE_COPY.app_accommodations_AccommodationsContent.major_companies}</strong>{PAGE_COPY.app_accommodations_AccommodationsContent.hertz_enterprise_national_avis_budget}</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sage" />
                    <span className="font-sans text-xs text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.great_if_you_want_to_explore_austin_on_your_own}</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 4: Where to Stay */}
      <section id="hotels" className={`section-padding bg-cream ${SCROLL_MT}`}>
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="text-center">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.app_accommodations_AccommodationsContent.recommended_hotels}</p>
              <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.app_accommodations_AccommodationsContent.where_to_stay_6}</h2>
              <div className="divider-gold" />
              <p className="mt-4 font-serif text-lg italic text-charcoal-light">{PAGE_COPY.app_accommodations_AccommodationsContent.we_recommend_staying_downtown_all_of_these_hotels_are_a}</p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {HOTELS.map((hotel, i) => (
              <FadeIn key={hotel.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-linen bg-white shadow-soft transition-shadow hover:shadow-medium"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden sm:h-48">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-serif text-xl text-charcoal">
                        {hotel.name}
                      </h3>
                      <span className="shrink-0 font-sans text-xs font-medium text-gold">
                        {hotel.priceRange}
                      </span>
                    </div>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-light">
                      {hotel.description}
                    </p>

                    {/* Distance badges */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-1 font-sans text-[10px] text-charcoal-light">
                        <MapPin className="h-2.5 w-2.5 text-sage" />
                        {hotel.driveToElla}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-1 font-sans text-[10px] text-charcoal-light">
                        <MapPin className="h-2.5 w-2.5 text-gold" />
                        {hotel.driveToChurch}
                      </span>
                    </div>

                    <a
                      href={hotel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-5 inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.15em] text-sage transition-colors hover:text-gold"
                    >{PAGE_COPY.app_accommodations_AccommodationsContent.view_hotel}<ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <div className="mt-10 text-center">
              <a
                href="https://www.google.com/travel/hotels?q=hotels%20in%20Austin%20TX%20on%202026-08-14%20through%202026-08-16"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center gap-2"
              >{PAGE_COPY.app_accommodations_AccommodationsContent.explore_more_hotels}<ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
