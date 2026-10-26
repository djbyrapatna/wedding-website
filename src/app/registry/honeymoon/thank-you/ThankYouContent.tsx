"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { WEDDING } from "@/config/wedding";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ThankYouContent() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-ivory px-6 py-24">
      <div className="max-w-lg text-center">
        <motion.div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <Check className="h-10 w-10 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1
          className="mt-8 font-serif text-4xl text-charcoal sm:text-5xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >{PAGE_COPY.app_registry_honeymoon_thank_you_ThankYouContent.thank_you}</motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-md font-sans text-base leading-relaxed text-charcoal-light"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >{PAGE_COPY.app_registry_honeymoon_thank_you_ThankYouContent.we_re_endlessly_grateful_for_your_kindness_and_so_deepl}</motion.p>

        <motion.p
          className="mt-6 font-serif text-lg italic text-warm-gray"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >{PAGE_COPY.app_registry_honeymoon_thank_you_ThankYouContent.with_love}{WEDDING.coupleName}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          <Link
            href="/registry/honeymoon"
            className="mt-10 inline-block rounded-full bg-sage px-8 py-3 font-sans text-xs font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-sage-dark"
          >{PAGE_COPY.app_registry_honeymoon_thank_you_ThankYouContent.back_to_the_fund}</Link>
        </motion.div>
      </div>
    </section>
  );
}
