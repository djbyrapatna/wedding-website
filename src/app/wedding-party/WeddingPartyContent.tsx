"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";
import FluffHero from "@/components/layout/FluffHero";

import { type Person, BRIDESMAIDS, GROOMSMEN, RING_BEARERS, FLOWER_GIRLS, PHOTO_BASE } from "@/config/wedding-party";

function PersonCard({
  person,
  delay,
  small,
}: {
  person: Person;
  delay: number;
  small?: boolean;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="flex flex-col items-center overflow-hidden rounded-lg border border-linen bg-white shadow-soft">
        <div
          className={`relative w-full overflow-hidden bg-ivory ${
            small ? "h-44 sm:h-52" : "h-56 sm:h-64"
          }`}
        >
          <Image
            src={`${PHOTO_BASE}/${person.photo}`}
            alt={person.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <div className={`text-center ${small ? "px-2 py-4" : "px-4 py-5"}`}>
          <h3
            className={`font-serif leading-tight text-charcoal ${
              small ? "text-sm sm:text-base" : "text-lg"
            }`}
          >
            {person.name}
          </h3>
          <p
            className={`mt-1 font-sans font-medium uppercase tracking-[0.15em] text-sage ${
              small ? "text-[11px]" : "text-xs"
            }`}
          >
            {person.role}
          </p>
          {person.relation && (
            <p
              className={`mt-1 font-serif italic text-warm-gray ${
                small ? "text-xs" : "text-sm"
              }`}
            >
              {person.relation}
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

export default function WeddingPartyContent() {
  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_wedding_party_WeddingPartyContent.the_people_by_our_side}
        title={PAGE_COPY.app_wedding_party_WeddingPartyContent.meet_the_wedding_party}
        subtitle={PAGE_COPY.app_wedding_party_WeddingPartyContent.the_incredible_friends_and_family_who_will_be_standing_}
      />

      {/* Bridesmaids */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.app_wedding_party_WeddingPartyContent.bridesmaids}</h2>
              <div className="divider-gold" />
            </div>
          </FadeIn>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            {BRIDESMAIDS.map((person, i) => (
              <div
                key={person.name}
                className="w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.834rem)] lg:w-[calc(25%-0.9375rem)] lg:max-w-[16rem]"
              >
                <PersonCard person={person} delay={i * 0.06} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Groomsmen */}
      <section className="section-padding bg-ivory">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.app_wedding_party_WeddingPartyContent.groomsmen}</h2>
              <div className="divider-gold" />
            </div>
          </FadeIn>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            {GROOMSMEN.map((person, i) => (
              <div
                key={person.name}
                className="w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.834rem)] lg:w-[calc(25%-0.9375rem)] lg:max-w-[16rem]"
              >
                <PersonCard person={person} delay={i * 0.06} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ring Bearers & Flower Girls */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.app_wedding_party_WeddingPartyContent.ring_bearers_flower_girls}</h2>
              <div className="divider-gold" />
            </div>
          </FadeIn>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[...RING_BEARERS, ...FLOWER_GIRLS].map((person, i) => (
              <PersonCard
                key={person.name}
                person={person}
                delay={i * 0.08}
                small
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
