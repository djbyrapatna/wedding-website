"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import MagneticButton from "@/components/animations/MagneticButton";

export default function RsvpCta() {
  return (
    <section className="section-padding bg-sage">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-cream/80">{PAGE_COPY.components_home_RsvpCta.we_hope_you_can_make_it}</p>
          <h2 className="mt-3 font-serif text-3xl text-cream sm:text-4xl md:text-5xl">{PAGE_COPY.components_home_RsvpCta.will_you_join_us}</h2>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-8 font-serif text-lg italic leading-relaxed text-cream/80">{PAGE_COPY.components_home_RsvpCta.your_presence_would_mean_the_world_to_us_please_let_us_}</p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <MagneticButton className="mt-10 inline-block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/rsvp"
                className="btn-light"
              >{PAGE_COPY.components_home_RsvpCta.rsvp_now}</Link>
            </motion.div>
          </MagneticButton>
        </FadeIn>
      </div>
    </section>
  );
}
