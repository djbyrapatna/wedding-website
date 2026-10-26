"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import MagneticButton from "@/components/animations/MagneticButton";
import { WEDDING } from "@/lib/constants";

export default function NextChapter() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-gold">{PAGE_COPY.components_story_NextChapter.and_now}</p>
          <h2 className="mt-4 font-serif text-4xl text-charcoal sm:text-5xl">{PAGE_COPY.components_story_NextChapter.the_next_chapter}</h2>
          <div className="divider-gold" />
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 font-serif text-lg italic leading-relaxed text-charcoal-light sm:text-xl">{PAGE_COPY.components_story_NextChapter.from_that_very_first_moment_to_this_one_every_step_has_}{WEDDING.dateDisplay}{PAGE_COPY.components_story_NextChapter.we_ll_take_the_most_important_step_of_all_surrounded_by}</p>
        </FadeIn>

        <FadeIn delay={0.35}>
          <p className="mt-6 font-serif text-lg text-charcoal-light">{PAGE_COPY.components_story_NextChapter.we_can_t_wait_to_celebrate_with_you}</p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <MagneticButton>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/rsvp" className="btn-primary">{PAGE_COPY.components_story_NextChapter.rsvp_now}</Link>
              </motion.div>
            </MagneticButton>
            <motion.div whileHover={{ x: 4 }}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-sans text-xs font-medium uppercase tracking-[0.15em] text-sage transition-colors hover:text-gold"
              >{PAGE_COPY.components_story_NextChapter.view_wedding_details}<ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
