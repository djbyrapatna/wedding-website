"use client";

import { PAGE_COPY } from "@/config/page-copy";


import FadeIn from "@/components/animations/FadeIn";
import RsvpForm from "@/components/rsvp/RsvpForm";
import FluffHero from "@/components/layout/FluffHero";

export default function RsvpContent() {
  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_rsvp_RsvpContent.we_d_love_to_celebrate_with_you}
        title={PAGE_COPY.app_rsvp_RsvpContent.rsvp}
      />

      <section className="bg-ivory px-6 pb-24 pt-16 sm:pt-20">
        <FadeIn delay={0.15}>
          <RsvpForm />
        </FadeIn>
      </section>
    </>
  );
}
