"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { SCHEDULE } from "@/lib/constants";
import FadeIn from "@/components/animations/FadeIn";

export default function Schedule() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn>
          <div className="text-center">
            <p className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-warm-gray">{PAGE_COPY.components_home_Schedule.the_itinerary}</p>
            <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">{PAGE_COPY.components_home_Schedule.wedding_day_at_a_glance}</h2>
            <div className="divider-gold" />
          </div>
        </FadeIn>

        <div className="mt-8 space-y-10 sm:mt-12 sm:space-y-16">
          {SCHEDULE.map((day, dayIdx) => (
            <FadeIn key={day.day} delay={dayIdx * 0.15}>
              <div className="flex flex-col items-center">
                {/* Day Header — centered */}
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 sm:h-12 sm:w-12">
                    <Calendar className="h-5 w-5 text-sage" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-2xl text-charcoal">
                      {day.day}
                    </h3>
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-warm-gray">
                      {day.date}
                    </p>
                  </div>
                </div>

                {/* Events — centered timeline */}
                <div className="mt-6 flex flex-col items-center gap-0">
                  {day.events.map((event, eventIdx) => (
                    <motion.div
                      key={event.title}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: dayIdx * 0.1 + eventIdx * 0.08,
                        duration: 0.4,
                      }}
                      className="relative flex flex-col items-center pb-8 text-center last:pb-0"
                    >
                      {/* Connecting line — sits behind dot + text */}
                      {eventIdx < day.events.length - 1 && (
                        <div className="absolute top-5 left-1/2 z-0 h-full w-px -translate-x-1/2 bg-linen" />
                      )}

                      {/* Timeline dot */}
                      <div className="relative z-10 mb-3 h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-gold/10" />

                      <div className="relative z-10">
                        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                          {event.time}
                        </p>
                        <h4 className="mt-1 font-serif text-lg text-charcoal sm:text-xl">
                          {event.title}
                        </h4>
                        <div className="mt-1 flex items-center justify-center gap-1.5">
                          <MapPin className="h-3 w-3 text-warm-gray" />
                          <span className="font-sans text-xs text-warm-gray">
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
