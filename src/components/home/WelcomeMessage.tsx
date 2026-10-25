"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { WEDDING } from "@/config/wedding";

import FadeIn from "@/components/animations/FadeIn";

export default function WelcomeMessage() {
  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.components_home_WelcomeMessage.welcome}</p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.components_home_WelcomeMessage.we_re_getting_married}</h2>
          <div className="divider-gold" />
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-8 font-serif text-lg leading-relaxed text-charcoal-light sm:text-xl">{PAGE_COPY.components_home_WelcomeMessage.we_are_so_thrilled_for_the_next_step_in_our_lives_and_a}</p>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="mt-10 font-serif text-xl italic text-sage">{PAGE_COPY.components_home_WelcomeMessage.with_all_our_love}</p>
          <p className="mt-2 font-serif text-2xl text-charcoal">
            {WEDDING.coupleName}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
