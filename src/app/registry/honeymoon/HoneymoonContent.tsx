"use client";

import { PAGE_COPY } from "@/config/page-copy";


import { WEDDING } from "@/config/wedding";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X, Check, Loader2 } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import FluffHero from "@/components/layout/FluffHero";
import {
  HONEYMOON_EXPERIENCES,
  QUICK_AMOUNTS,
  formatUSD,
  type HoneymoonExperience,
} from "@/lib/honeymoon";
import type { RaisedTotals } from "@/lib/contributions";

export default function HoneymoonContent({ raised }: { raised: RaisedTotals }) {
  const [active, setActive] = useState<HoneymoonExperience | null>(null);

  // Start from the server-rendered totals (instant, no flicker), then keep
  // them live: re-fetch on mount and whenever the guest returns to the tab, so
  // a fresh gift shows up without anyone needing to hard-refresh.
  const [liveRaised, setLiveRaised] = useState<RaisedTotals>(raised);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/honeymoon/totals", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.raised) setLiveRaised(data.raised);
      } catch {
        // Network blip — keep showing the last good numbers.
      }
    }

    refresh();

    // Poll while the page is open so the bars feel live, and refresh the moment
    // a guest switches back to the tab (e.g. returning from Stripe checkout).
    const interval = setInterval(refresh, 15000);

    function onVisible() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <>
      <FluffHero
        eyebrow={PAGE_COPY.app_registry_honeymoon_HoneymoonContent.your_presence_is_the_gift}
        title={PAGE_COPY.app_registry_honeymoon_HoneymoonContent.honeymoon_fund}
        subtitle={PAGE_COPY.app_registry_honeymoon_HoneymoonContent.if_you_d_like_to_give_a_little_something_help_send_us_o}
      />

      <section className="bg-ivory pb-20 pt-16 sm:pb-28 sm:pt-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="grid gap-5 sm:gap-6">
            {HONEYMOON_EXPERIENCES.map((exp, i) => (
              <FadeIn key={exp.id} delay={i * 0.08}>
                <ExperienceCard
                  exp={exp}
                  raisedDollars={liveRaised[exp.id] ?? 0}
                  onContribute={() => setActive(exp)}
                />
              </FadeIn>
            ))}
          </div>

          <p className="mt-12 text-center font-serif text-base italic text-warm-gray">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.thank_you_for_being_part_of_our_story}{WEDDING.coupleName}
          </p>
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <ContributeDialog exp={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ExperienceCard({
  exp,
  raisedDollars,
  onContribute,
}: {
  exp: HoneymoonExperience;
  raisedDollars: number;
  onContribute: () => void;
}) {
  // Open-ended fund (no goal): no bar and no dollar metric — just a button.
  const openEnded = exp.goalDollars == null;
  const pct = openEnded
    ? 100
    : Math.min(100, Math.round((raisedDollars / exp.goalDollars!) * 100));
  const funded = !openEnded && raisedDollars >= exp.goalDollars!;

  const contributeButton = (
    <button
      onClick={onContribute}
      className="inline-flex items-center gap-1.5 rounded-full bg-sage px-4 py-2 font-sans text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-sage-dark"
    >
      <Heart className="h-3.5 w-3.5" />{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.contribute}</button>
  );

  return (
    <div className="rounded-xl border border-linen bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage/10 text-2xl">
          {exp.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
            {exp.location}
          </p>
          <h3 className="mt-1 font-serif text-xl text-charcoal">{exp.title}</h3>
          <p className="mt-1.5 font-sans text-sm leading-relaxed text-charcoal-light">
            {exp.blurb}
          </p>
        </div>
      </div>

      {openEnded ? (
        // The general fund has no goal and never shows a dollar metric — just
        // a warm invitation to give whatever feels right.
        <div className="mt-5 flex justify-end">
          {contributeButton}
        </div>
      ) : (
        <div className="mt-5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-linen">
            <motion.div
              className={`h-full rounded-full ${funded ? "bg-gold" : "bg-sage"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-sans text-sm">
            <span className="font-medium text-charcoal">
              {funded ? (
                <span className="inline-flex items-center gap-1.5 text-gold-dark">
                  <Check className="h-4 w-4" />{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.fully_funded_thank_you}</span>
              ) : (
                <>
                  {formatUSD(raisedDollars)}{" "}
                  <span className="text-warm-gray">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.of}{formatUSD(exp.goalDollars!)}
                  </span>
                </>
              )}
            </span>
            {contributeButton}
          </div>
        </div>
      )}
    </div>
  );
}

function ContributeDialog({
  exp,
  onClose,
}: {
  exp: HoneymoonExperience;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number>(QUICK_AMOUNTS[1]);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "preview" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  // The chosen amount is either a preset chip or the custom field, whichever
  // was touched last (custom wins when it has a value).
  const customNum = parseFloat(custom);
  const chosenDollars = custom.trim() && !Number.isNaN(customNum) ? customNum : amount;
  const valid = chosenDollars >= 5;
  // True only when a custom amount has been typed but is under the $5 minimum,
  // so we can highlight the hint without nagging before they've entered anything.
  const belowMin = custom.trim() !== "" && !Number.isNaN(customNum) && customNum < 5;

  async function handleSubmit() {
    if (!valid) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/honeymoon/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId: exp.id,
          amountCents: Math.round(chosenDollars * 100),
        }),
      });
      const data = await res.json();

      if (data.notConfigured) {
        setStatus("preview");
        return;
      }
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      // Hand off to Stripe's hosted checkout.
      window.location.href = data.url;
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-charcoal/50 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-medium sm:p-8"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-warm-gray">
              {exp.location}
            </p>
            <h3 className="mt-1 font-serif text-2xl text-charcoal">{exp.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-warm-gray transition-colors hover:bg-linen hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "preview" ? (
          <div className="mt-6 rounded-lg bg-ivory p-5 text-center">
            <p className="font-serif text-lg text-charcoal">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.preview_mode}</p>
            <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal-light">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.payments_aren_t_switched_on_yet_this_page_is_a_private_}{" "}
              <span className="font-medium text-charcoal">
                {formatUSD(chosenDollars)}
              </span>
              .
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-sage px-6 py-2.5 font-sans text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-sage-dark"
            >{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.got_it}</button>
          </div>
        ) : (
          <>
            <p className="mt-4 font-sans text-sm text-charcoal-light">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.choose_an_amount_to_contribute}</p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map((amt) => {
                const selected = !custom.trim() && amount === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setCustom("");
                    }}
                    className={`rounded-lg border py-2.5 font-sans text-sm font-medium transition-colors ${
                      selected
                        ? "border-sage bg-sage text-white"
                        : "border-linen bg-white text-charcoal hover:border-sage"
                    }`}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-sans text-charcoal-light">
                  $
                </span>
                <input
                  type="number"
                  min={5}
                  inputMode="decimal"
                  placeholder="Other amount"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className={`w-full rounded-lg border py-2.5 pl-8 pr-4 font-sans text-sm text-charcoal outline-none transition-colors ${
                    belowMin ? "border-red-400 focus:border-red-500" : "border-linen focus:border-sage"
                  }`}
                />
              </label>
              <p
                className={`mt-2 font-sans text-xs ${
                  belowMin ? "text-red-600" : "text-warm-gray"
                }`}
              >{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.there_s_a_5_minimum}</p>
            </div>

            {status === "error" && (
              <p className="mt-3 font-sans text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!valid || status === "loading"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sage px-6 py-3 font-sans text-sm font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.contribute_1}{valid ? formatUSD(chosenDollars) : ""}</>
              )}
            </button>
            <p className="mt-3 text-center font-sans text-xs text-warm-gray">{PAGE_COPY.app_registry_honeymoon_HoneymoonContent.secure_checkout_powered_by_stripe}</p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
