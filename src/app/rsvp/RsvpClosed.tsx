import { PAGE_COPY } from "@/config/page-copy";
import { Heart, Mail } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { WEDDING } from "@/lib/constants";
import FluffHero from "@/components/layout/FluffHero";

// Shown in place of the RSVP form once the admin closes RSVPs (the deadline has
// passed). The open/closed flag lives in site_settings and is read server-side
// in rsvp/page.tsx.
export default function RsvpClosed() {
  return (
    <>
      <FluffHero eyebrow={PAGE_COPY.app_rsvp_RsvpClosed.with_love_and_gratitude} title={PAGE_COPY.app_rsvp_RsvpClosed.rsvps_are_closed} />

      <section className="bg-ivory px-6 pb-24 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl">
          <FadeIn delay={0.15}>
            <div className="rounded-lg border border-linen bg-white p-8 text-center shadow-soft sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage/10">
                <Heart className="h-6 w-6 text-sage" />
              </div>

              <h2 className="mt-6 font-serif text-2xl text-charcoal sm:text-3xl">{PAGE_COPY.app_rsvp_RsvpClosed.thank_you_for_responding}</h2>

              <p className="mt-4 font-serif text-base italic leading-relaxed text-charcoal-light sm:text-lg">{PAGE_COPY.app_rsvp_RsvpClosed.our_rsvp_list_is_now_closed_as_we_finalize_the_details_}</p>

              <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5">
                <Mail className="h-4 w-4 text-sage" />
                <a
                  href="/contact"
                  className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-charcoal underline-offset-4 hover:underline"
                >{PAGE_COPY.app_rsvp_RsvpClosed.contact_us}</a>
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
