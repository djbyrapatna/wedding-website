"use client";

import { useAdmin, adminFetch } from "./AdminAuthGate";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Loader2,
  StickyNote,
  CalendarCheck,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  CHECKLIST,
  CHECKLIST_TOTAL,
  ALL_TAGS,
  parseTag,
  type ChecklistItem,
  type ChecklistSection,
} from "@/lib/checklist-data";

type ItemState = { checked: boolean; notes: string };
type StateMap = Record<string, ItemState>;

const LOCAL_KEY = "wedding-checklist-state";

function loadLocal(): StateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as StateMap) : {};
  } catch {
    return {};
  }
}

function saveLocal(state: StateMap) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export default function ChecklistTab() {
  const { canEdit } = useAdmin();
  const [state, setState] = useState<StateMap>({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Filtering
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [showTags, setShowTags] = useState(false);

  // Load saved state once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await adminFetch("/api/admin/checklist");
        const json = await res.json();
        if (!active) return;

        if (json.demo) {
          setDemo(true);
          setState(loadLocal());
        } else {
          setState(json.items ?? {});
        }
      } catch (e) {
        if (active) setLoadError(e instanceof Error ? e.message : "Unable to load checklist.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const itemState = useCallback(
    (id: string): ItemState => state[id] ?? { checked: false, notes: "" },
    [state]
  );

  // Persist a single item: optimistic local update, then sync.
  const persist = useCallback(
    (id: string, next: ItemState) => {
      if (!canEdit) return;
      setState((prev) => {
        const updated = { ...prev, [id]: next };
        if (demo) saveLocal(updated);
        return updated;
      });

      if (!demo) {
        adminFetch("/api/admin/checklist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id: id,
            checked: next.checked,
            notes: next.notes,
          }),
        }).catch((e) => setLoadError(e instanceof Error ? e.message : "Unable to save checklist."));
      }
    },
    [demo, canEdit]
  );

  const toggle = useCallback(
    (id: string) => {
      const current = itemState(id);
      persist(id, { ...current, checked: !current.checked });
    },
    [itemState, persist]
  );

  const setNote = useCallback(
    (id: string, notes: string) => {
      const current = itemState(id);
      persist(id, { ...current, notes });
    },
    [itemState, persist]
  );

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags(new Set());
    setQuery("");
  }, []);

  const completedCount = useMemo(
    () => Object.values(state).filter((s) => s.checked).length,
    [state]
  );
  const pct =
    CHECKLIST_TOTAL > 0
      ? Math.round((completedCount / CHECKLIST_TOTAL) * 100)
      : 0;

  // Apply tag + text filters. An item matches if it has at least one active
  // tag (or no tags are active) AND its text/tags contain the search query.
  const filtering = activeTags.size > 0 || query.trim().length > 0;
  const q = query.trim().toLowerCase();

  const matches = useCallback(
    (item: ChecklistItem) => {
      const tagOk =
        activeTags.size === 0 || item.tags.some((t) => activeTags.has(t));
      const textOk =
        !q ||
        item.text.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return tagOk && textOk;
    },
    [activeTags, q]
  );

  const filteredSections = useMemo(
    () =>
      CHECKLIST.map((section) => ({
        section,
        items: filtering ? section.items.filter(matches) : section.items,
      })).filter((s) => s.items.length > 0),
    [filtering, matches]
  );

  const matchCount = useMemo(
    () => filteredSections.reduce((n, s) => n + s.items.length, 0),
    [filteredSections]
  );

  if (loadError) return <p role="alert">{loadError}</p>;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-sage" />
      </div>
    );
  }

  return (
    <div>
      {/* Overall progress */}
      <div className="rounded-2xl border border-linen bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarCheck className="h-5 w-5 shrink-0 text-sage" />
            <h2 className="truncate font-serif text-xl text-charcoal sm:text-2xl">
              Wedding To-Do List
            </h2>
          </div>
          <p className="shrink-0 font-serif text-xl text-charcoal sm:text-2xl">
            {completedCount}
            <span className="text-warm-gray">/{CHECKLIST_TOTAL}</span>
          </p>
        </div>

        <p className="mt-1 font-sans text-xs text-warm-gray sm:text-sm">
          From your Mockingbird Lane planning checklist.
          {demo && " Saved on this device until the database is connected."}
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-linen">
          <motion.div
            className="h-full rounded-full bg-sage"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1.5 font-sans text-[11px] font-medium text-warm-gray">
          {pct}% complete
        </p>
      </div>

      {/* Filter bar */}
      <div className="mt-4 rounded-2xl border border-linen bg-white p-3 shadow-sm sm:mt-6 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-lg border border-linen bg-ivory/50 py-2.5 pl-9 pr-9 font-sans text-sm text-charcoal outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowTags((s) => !s)}
            aria-expanded={showTags}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
              activeTags.size > 0
                ? "border-sage bg-sage text-white"
                : "border-linen bg-white text-charcoal-light hover:border-sage hover:text-sage"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Tags</span>
            {activeTags.size > 0 && (
              <span className="rounded-full bg-white/25 px-1.5 text-xs font-semibold">
                {activeTags.size}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showTags && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 pt-3">
                {ALL_TAGS.map((tag) => {
                  const on = activeTags.has(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1.5 font-sans text-xs font-medium transition-colors ${
                        on
                          ? "bg-sage text-white"
                          : "border border-linen bg-white text-charcoal-light hover:border-sage hover:text-sage"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filtering && (
          <div className="mt-3 flex items-center justify-between border-t border-linen pt-3">
            <span className="font-sans text-xs text-warm-gray">
              Showing {matchCount} of {CHECKLIST_TOTAL}
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 font-sans text-xs font-medium text-sage hover:text-sage-dark"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-4">
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-linen bg-white p-10 text-center font-sans text-sm text-warm-gray shadow-sm">
            No tasks match your filters.
          </div>
        ) : (
          filteredSections.map(({ section, items }) => (
            <SectionCard
              key={section.id}
              section={section}
              items={items}
              itemState={itemState}
              onToggle={toggle}
              onNote={setNote}
              activeTags={activeTags}
              onTagClick={toggleTag}
              // While filtering, always expand so matches are visible.
              collapsed={filtering ? false : !!collapsed[section.id]}
              onToggleCollapse={() =>
                setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))
              }
              lockOpen={filtering}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  items,
  itemState,
  onToggle,
  onNote,
  activeTags,
  onTagClick,
  collapsed,
  onToggleCollapse,
  lockOpen,
}: {
  section: ChecklistSection;
  items: ChecklistItem[];
  itemState: (id: string) => ItemState;
  onToggle: (id: string) => void;
  onNote: (id: string, notes: string) => void;
  activeTags: Set<string>;
  onTagClick: (tag: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  lockOpen: boolean;
}) {
  const done = items.filter((i) => itemState(i.id).checked).length;
  const total = items.length;
  const complete = done === total;

  return (
    <div className="overflow-hidden rounded-2xl border border-linen bg-white shadow-sm">
      <button
        onClick={onToggleCollapse}
        disabled={lockOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ivory/60 disabled:cursor-default disabled:hover:bg-transparent sm:gap-4 sm:px-5 sm:py-4"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-serif text-base text-charcoal sm:text-lg">
              {section.timing}
            </h3>
            {section.note && (
              <span className="rounded-full bg-gold/10 px-2.5 py-0.5 font-sans text-[10px] font-medium text-gold-dark sm:text-xs">
                {section.note}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className={`font-sans text-sm font-semibold ${
              complete ? "text-sage" : "text-warm-gray"
            }`}
          >
            {done}/{total}
          </span>
          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-linen sm:block sm:w-24">
            <div
              className="h-full rounded-full bg-sage transition-all duration-500"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
          {!lockOpen && (
            <ChevronDown
              className={`h-5 w-5 text-warm-gray transition-transform duration-300 ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-linen border-t border-linen">
              {items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  text={item.text}
                  tags={item.tags}
                  state={itemState(item.id)}
                  onToggle={() => onToggle(item.id)}
                  onNote={(notes) => onNote(item.id, notes)}
                  activeTags={activeTags}
                  onTagClick={onTagClick}
                />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChecklistRow({
  text,
  tags,
  state,
  onToggle,
  onNote,
  activeTags,
  onTagClick,
}: {
  text: string;
  tags: string[];
  state: ItemState;
  onToggle: () => void;
  onNote: (notes: string) => void;
  activeTags: Set<string>;
  onTagClick: (tag: string) => void;
}) {
  const { canEdit } = useAdmin();
  const { tag, text: label } = parseTag(text);
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState(state.notes);

  // Keep the local draft in sync if state arrives/changes from outside.
  useEffect(() => {
    setDraft(state.notes);
  }, [state.notes]);

  const hasNote = state.notes.trim().length > 0;

  return (
    <li className="px-4 py-2.5 transition-colors hover:bg-ivory/40 sm:px-5">
      <div className="flex items-start gap-2.5">
        <button
          disabled={!canEdit} onClick={onToggle}
          role="checkbox"
          aria-checked={state.checked}
          aria-label={state.checked ? "Mark as not done" : "Mark as done"}
          className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors ${
            state.checked
              ? "border-sage bg-sage text-white"
              : "border-warm-gray/40 bg-white"
          }`}
        >
          {state.checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`font-sans text-[13px] leading-snug transition-colors sm:text-sm ${
              state.checked ? "text-warm-gray line-through" : "text-charcoal"
            }`}
          >
            {tag && (
              <span
                className={`mr-1.5 align-[1px] text-[10px] font-bold uppercase tracking-wide ${
                  tag === "Bride" ? "text-sage" : "text-gold-dark"
                }`}
              >
                {tag}
              </span>
            )}
            {label}
          </p>

          {/* Category tags — click to filter */}
          {tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.map((t) => {
                const on = activeTags.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => onTagClick(t)}
                    className={`rounded px-1.5 py-0.5 font-sans text-[10px] font-medium leading-none transition-colors ${
                      on
                        ? "bg-sage text-white"
                        : "bg-ivory text-warm-gray hover:bg-sage/10 hover:text-sage"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}

          {/* Existing note preview (when collapsed) */}
          {hasNote && !noteOpen && (
            <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-ivory px-2.5 py-1.5 font-sans text-xs italic text-charcoal-light">
              {state.notes}
            </p>
          )}

          {/* Note editor */}
          {noteOpen && (
            <textarea readOnly={!canEdit}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                if (draft !== state.notes) onNote(draft);
                setNoteOpen(false);
              }}
              autoFocus
              rows={2}
              placeholder="Add a note (vendor, price, who's handling it…)"
              className="mt-1.5 w-full resize-y rounded-md border border-linen bg-white px-2.5 py-1.5 font-sans text-xs text-charcoal outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
            />
          )}
        </div>

        <button
          onClick={() => setNoteOpen((o) => !o)}
          aria-label={hasNote ? "Edit note" : "Add note"}
          title={hasNote ? "Edit note" : "Add note"}
          className={`-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${
            hasNote || noteOpen
              ? "bg-gold/15 text-gold-dark"
              : "text-warm-gray/50 hover:bg-ivory hover:text-sage"
          }`}
        >
          <StickyNote className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}
