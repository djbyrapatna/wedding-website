"use client";

import { PAGE_COPY } from "@/config/page-copy";


import FadeIn from "@/components/animations/FadeIn";
import Accordion from "@/components/ui/Accordion";
import FluffHero from "@/components/layout/FluffHero";

import { FAQ_ITEMS } from "@/config/faq";

export default function FaqContent() {
  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_faq_FaqContent.got_questions}
        title={PAGE_COPY.app_faq_FaqContent.frequently_asked_questions}
        subtitle={PAGE_COPY.app_faq_FaqContent.everything_you_need_to_know_about_our_big_day}
      />

      {/* Accordion */}
      <section className="bg-ivory pb-20 pt-16 sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn delay={0.15}>
            <Accordion items={FAQ_ITEMS} />
          </FadeIn>
        </div>
      </section>

      {/* More details coming */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <FadeIn>
            <h2 className="font-serif text-3xl text-charcoal">{PAGE_COPY.app_faq_FaqContent.more_details_coming_soon}</h2>
            <div className="divider-gold" />
            <p className="mt-4 font-sans text-sm leading-relaxed text-charcoal-light">{PAGE_COPY.app_faq_FaqContent.we_ll_keep_adding_to_this_page_as_we_get_closer_to_the_}</p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
