"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { Mail, Sparkles } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { WEDDING } from "@/lib/constants";
import FluffHero from "@/components/layout/FluffHero";

export default function RsvpComingSoon() {
  return (
    <>
      <FluffHero eyebrow={PAGE_COPY.app_rsvp_RsvpComingSoon.save_the_date} title={PAGE_COPY.app_rsvp_RsvpComingSoon.rsvp_coming_soon} />

      <section className="bg-ivory px-6 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl">
          <FadeIn delay={0.15}>
            <div className="rounded-lg border border-linen bg-white p-8 text-center shadow-soft sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>

              <h2 className="mt-6 font-serif text-2xl text-charcoal sm:text-3xl">{PAGE_COPY.app_rsvp_RsvpComingSoon.we_re_putting_on_the_finishing_touches}</h2>

              <p className="mt-4 font-serif text-base italic leading-relaxed text-charcoal-light sm:text-lg">{PAGE_COPY.app_rsvp_RsvpComingSoon.formal_invitations_will_arrive_in_the_mail_and_our_onli}</p>

              <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5">
                <Mail className="h-4 w-4 text-sage" />
                <span className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-charcoal">{PAGE_COPY.app_rsvp_RsvpComingSoon.watch_your_mailbox}</span>
              </div>

              <div className="mt-10 border-t border-linen pt-6">
                <p className="font-sans text-xs font-medium uppercase tracking-[0.25em] text-warm-gray">
                  {WEDDING.dayOfWeek}
                </p>
                <p className="mt-2 font-serif text-2xl text-charcoal">
                  {WEDDING.dateDisplay}
                </p>
                <p className="mt-1 font-serif text-sm italic text-warm-gray">
                  {WEDDING.location}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
