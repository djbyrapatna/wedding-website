"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, WEDDING } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Pages whose top section has a dark/photo hero — nav text must go white
// here when at the top of the page; everywhere else stays charcoal.
// /admin is the lone exception: it's a bare login page with no hero.
const LIGHT_HERO_ROUTES = new Set(["/admin"]);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  // When the mobile menu is open, the cream overlay covers the hero — so
  // the logo and toggle need dark text even on pages that would otherwise
  // be on a dark hero.
  const onDarkHero =
    !LIGHT_HERO_ROUTES.has(pathname) && !scrolled && !mobileOpen;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-cream shadow-soft"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo / Couple Names */}
          <Link
            href="/"
            className={cn(
              // 300ms color transition keeps the logo synced with the
              // mobile menu overlay's fade-in/out — otherwise it snaps
              // between white and charcoal while the overlay is still
              // mid-animation, which reads as a "flash".
              "font-serif text-xl tracking-wide transition-colors duration-300 hover:text-gold",
              onDarkHero ? "text-white" : "text-charcoal"
            )}
          >
            {WEDDING.brideFirstName}
            <span className="mx-2 text-gold">&</span>
            {WEDDING.groomFirstName}
          </Link>

          {/* Desktop Nav — gated to xl so iPads (which fall under lg) get
              the mobile menu instead of trying to fit 8 links in one row. */}
          <ul className="hidden items-center gap-8 xl:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative font-sans text-xs font-medium uppercase tracking-[0.15em] transition-colors",
                    pathname === link.href
                      ? "text-gold"
                      : onDarkHero
                        ? "text-white/80 hover:text-gold"
                        : "text-charcoal-light hover:text-gold"
                  )}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-charcoal" />
            ) : (
              <Menu className={cn("h-6 w-6", onDarkHero ? "text-white" : "text-charcoal")} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-cream"
          >
            <nav className="flex flex-col items-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "font-serif text-2xl tracking-wide transition-colors",
                      pathname === link.href
                        ? "text-gold"
                        : "text-charcoal hover:text-gold"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Decorative element */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="divider-gold mt-10"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 font-serif text-sm italic text-warm-gray"
            >
              {WEDDING.dateDisplay}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
