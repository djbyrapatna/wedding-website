"use client";
import { Search, Loader2 } from "lucide-react";
import { useInvitationLookup } from "@/hooks/useInvitationLookup";
import type { Invitation } from "@/lib/rsvp/types";

export default function StepSearch({
  onHouseholdFound,
}: {
  onHouseholdFound: (invitation: Invitation) => void;
}) {
  const { query, setQuery, results, searching, loading, error, isCode, open } =
    useInvitationLookup(onHouseholdFound);
  return (
    <div className="text-center">
      <h2 className="font-serif text-3xl text-charcoal sm:text-4xl">
        Find Your Invitation
      </h2>
      <p className="mt-3 font-sans text-sm text-charcoal-light">
        Enter a guest name or the invitation code from your invitation.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isCode && !loading) void open();
        }}
      >
        <label htmlFor="invitation-search" className="sr-only">
          Guest name or invitation code
        </label>
        <div className="relative mt-8">
          <Search className="absolute left-4 top-4 h-5 w-5 text-warm-gray" />
          <input
            id="invitation-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Guest name or WED-…"
            autoComplete="off"
            maxLength={200}
            disabled={loading}
            className="w-full rounded-lg border border-linen bg-white py-4 pl-12 pr-12 font-sans text-sm outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            autoFocus
          />
          {searching && (
            <Loader2
              aria-label="Searching"
              className="absolute right-4 top-4 h-5 w-5 animate-spin text-sage"
            />
          )}
        </div>
        {isCode && (
          <button type="submit" disabled={loading} className="btn-primary mt-4">
            {loading ? "Opening…" : "Open invitation"}
          </button>
        )}
      </form>
      {results.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border border-linen bg-white text-left shadow-soft">
          {results.map((g) => (
            <button
              key={g.guest_id}
              disabled={loading}
              onClick={() => void open(g.guest_id)}
              className="flex w-full items-center justify-between px-5 py-4 font-sans text-sm hover:bg-ivory disabled:opacity-50"
            >
              <span>{g.display_name}</span>
              <span>{loading ? "Opening…" : "Select"}</span>
            </button>
          ))}
        </div>
      )}
      {query.trim().length >= 2 &&
        !isCode &&
        !searching &&
        !results.length &&
        !error && (
          <p className="mt-4 text-sm text-warm-gray">
            No invitation found. Try another name on your invitation or check
            the spelling.
          </p>
        )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
