"use client";
import { useEffect, useState, useRef } from "react";
import type { GuestResult, Invitation } from "@/lib/rsvp/types";

export function useInvitationLookup(onFound: (invitation: Invitation) => void) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const isCode = /^WED-/i.test(query.trim());
  useEffect(() => {
    const controller = new AbortController();
    const id = ++requestId.current;
    setResults([]);
    setError("");
    setSearching(false);
    if (query.trim().length < 2 || isCode) return () => controller.abort();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/households/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const body = await res.json();
        if (!res.ok)
          throw new Error(body.error ?? "Unable to search invitations.");
        if (id === requestId.current && !controller.signal.aborted)
          setResults(body);
      } catch (e) {
        if (!controller.signal.aborted && id === requestId.current)
          setError(
            e instanceof Error ? e.message : "Unable to search invitations.",
          );
      } finally {
        if (!controller.signal.aborted && id === requestId.current)
          setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, isCode]);
  async function open(guestId?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/invitations/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          guestId ? { guest_id: guestId } : { code: query.trim() },
        ),
      });
      const body = await res.json();
      if (!res.ok)
        throw new Error(body.error ?? "Unable to open your invitation.");
      onFound(body);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to open your invitation.",
      );
    } finally {
      setLoading(false);
    }
  }
  return { query, setQuery, results, searching, loading, error, isCode, open };
}
