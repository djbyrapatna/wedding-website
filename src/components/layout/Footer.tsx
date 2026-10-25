"use client";

import { PAGE_COPY } from "@/config/page-copy";


import Link from "next/link";
import { Heart } from "lucide-react";
import { WEDDING, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-linen bg-ivory">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-16 lg:px-8">
        {/* Couple Names */}
        <div className="text-center">
          <h2 className="font-serif text-2xl tracking-wide text-charcoal sm:text-3xl">
            {WEDDING.brideFirstName}
            <span className="mx-3 text-gold">&</span>
            {WEDDING.groomFirstName}
          </h2>
          <div className="divider-gold" />
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-warm-gray">
            {WEDDING.dateDisplay}{PAGE_COPY.components_layout_Footer.text}{WEDDING.location}
          </p>
        </div>

        {/* Footer Nav */}
        <nav className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10 sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-xs uppercase tracking-[0.15em] text-warm-gray transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Hashtag & Credits */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="font-serif text-lg italic text-sage">
            {WEDDING.hashtag}
          </p>
          <p className="flex items-center gap-1.5 font-sans text-xs text-warm-gray">{PAGE_COPY.components_layout_Footer.made_with}<Heart className="h-3 w-3 fill-gold text-gold" />{PAGE_COPY.components_layout_Footer.for_our_favorite_day}</p>
        </div>
      </div>
    </footer>
  );
}
