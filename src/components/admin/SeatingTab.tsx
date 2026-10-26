"use client";

import { useAdmin, adminFetch } from "./AdminAuthGate";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Loader2,
  Plus,
  Trash2,
  Move,
  Users,
  Armchair,
  Sparkles,
  Download,
  Utensils,
  Search,
  X,
  Pencil,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { Guest, Household, Rsvp, SeatingTable } from "@/lib/database.types";
import { ADULT_ENTREES, KIDS_MEALS, ALTERNATIVE_MEAL } from "@/lib/constants";

// ------------------------------------------------------------------
// Constants & helpers
// ------------------------------------------------------------------

const MEAL_LABELS: Record<string, string> = Object.fromEntries(
  [...ADULT_ENTREES, ...KIDS_MEALS, ALTERNATIVE_MEAL].map((m) => [m.value, m.label])
);

const LOCAL_KEY = "wedding-seating-state";

// One dot color per side of the family, so a table's mix is readable at a glance.
const SIDE_COLOR: Record<string, string> = {
  Sager: "#7F9DB5", // dusty blue
  Hicks: "#D4B85C", // calm yellow
  Mutual: "#C8D8E4", // soft blue
};
function sideColor(side: string | null): string {
  return (side && SIDE_COLOR[side]) || "#B9B2A8"; // warm gray fallback
}

type Status = "accepted" | "declined" | "pending";
type FilterMode = "accepted" | "maybe"; // "maybe" = accepted + not-yet-responded

type GuestView = {
  id: string;
  name: string;
  side: string | null;
  status: Status;
  meal: string | null; // label
  dietary: boolean;
  householdId: number;
  householdLabel: string;
  typeTag: string; // child/toddler/infant/plus-one
};

type PersistedTable = Pick<
  SeatingTable,
  "id" | "name" | "pos_x" | "pos_y" | "capacity" | "sort_order"
>;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function loadLocal(): { tables: PersistedTable[]; assignments: Record<string, string> } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Main tab
// ------------------------------------------------------------------

export default function SeatingTab({
  guests,
  households,
  rsvps,
}: {
  guests: Guest[];
  households: Household[];
  rsvps: Rsvp[];
}) {
  const { canEdit } = useAdmin();
  const [tables, setTables] = useState<PersistedTable[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const [filter, setFilter] = useState<FilterMode>("maybe");
  const [showDeclined, setShowDeclined] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // View controls
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rosterOpen, setRosterOpen] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  // Latest values for use inside pointer-event closures (avoids stale state).
  const demoRef = useRef(demo);
  demoRef.current = demo;

  // ---- Guest views (name, side, status, meal…) computed once ----
  const rsvpById = useMemo(
    () => new Map(rsvps.map((r) => [r.guest_id, r])),
    [rsvps]
  );
  const householdById = useMemo(
    () => new Map(households.map((h) => [h.household_id, h])),
    [households]
  );

  const householdLabel = useCallback(
    (hid: number): string => {
      const primary = guests.find(
        (g) => g.household_id === hid && g.is_primary_contact
      );
      const last = primary?.last_name?.trim();
      const stored = householdById.get(hid)?.search_name?.trim();
      if (stored && /party$/i.test(stored)) return stored;
      if (last) return `${last} Party`;
      return stored ?? "Party";
    },
    [guests, householdById]
  );

  const guestViews = useMemo(() => {
    const map = new Map<string, GuestView>();
    for (const g of guests) {
      const r = rsvpById.get(g.guest_id);
      const isPlaceholder = g.name_status === "PLACEHOLDER_UNKNOWN";

      let status: Status;
      if (isPlaceholder) {
        status = r?.plus_one_name ? "accepted" : "pending";
      } else if (!r || r.attending_wedding == null) {
        status = "pending";
      } else {
        status = r.attending_wedding ? "accepted" : "declined";
      }

      const name = isPlaceholder
        ? r?.plus_one_name || "Unnamed plus-one"
        : g.display_name;
      const typeTag = isPlaceholder
        ? "plus-one"
        : g.guest_type !== "adult"
          ? g.guest_type
          : "";

      map.set(g.guest_id, {
        id: g.guest_id,
        name,
        side: g.side,
        status,
        meal: r?.meal_preference
          ? MEAL_LABELS[r.meal_preference] ?? r.meal_preference
          : null,
        dietary: Boolean(r?.dietary_notes),
        householdId: g.household_id,
        householdLabel: householdLabel(g.household_id),
        typeTag,
      });
    }
    return map;
  }, [guests, rsvpById, householdLabel]);

  // ---- Load saved layout on mount ----
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await adminFetch("/api/admin/seating");
        const json = await res.json();
        if (!active) return;

        if (json.demo) {
          setDemo(true);
          const local = loadLocal();
          if (local) {
            setTables(local.tables ?? []);
            setAssignments(local.assignments ?? {});
          }
        } else {
          setTables(json.tables ?? []);
          const a: Record<string, string> = {};
          for (const row of json.assignments ?? []) a[row.guest_id] = row.table_id;
          setAssignments(a);
        }
      } catch (e) {
        if (active) setLoadError(e instanceof Error ? e.message : "Unable to load seating.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ---- Persistence ----
  // In demo mode we snapshot the whole layout to localStorage; with a DB we
  // send one targeted mutation. Callers update React state first (optimistic).
  const saveLocalSnapshot = useCallback(
    (nextTables: PersistedTable[], nextAssignments: Record<string, string>) => {
      try {
        window.localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ tables: nextTables, assignments: nextAssignments })
        );
      } catch {
        /* ignore quota / private-mode */
      }
    },
    []
  );

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      if (!canEdit) return;
      if (demoRef.current) return;
      try {
        await adminFetch("/api/admin/seating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Unable to save seating.");
      }
    },
    [canEdit]
  );

  const saveTable = useCallback(
    (t: PersistedTable) => {
      if (!canEdit) return;
      if (demoRef.current) {
        setTables((prev) => {
          const next = prev.some((x) => x.id === t.id)
            ? prev.map((x) => (x.id === t.id ? t : x))
            : [...prev, t];
          saveLocalSnapshot(next, assignments);
          return next;
        });
      } else {
        post({ action: "upsertTable", table: t });
      }
    },
    [assignments, post, saveLocalSnapshot, canEdit]
  );

  const assign = useCallback(
    (guestId: string, tableId: string) => {
      if (!canEdit) return;
      setAssignments((prev) => {
        const next = { ...prev, [guestId]: tableId };
        if (demoRef.current) saveLocalSnapshot(tables, next);
        return next;
      });
      post({ action: "assign", guest_id: guestId, table_id: tableId });
    },
    [tables, post, saveLocalSnapshot, canEdit]
  );

  const unassign = useCallback(
    (guestId: string) => {
      if (!canEdit) return;
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[guestId];
        if (demoRef.current) saveLocalSnapshot(tables, next);
        return next;
      });
      post({ action: "unassign", guest_id: guestId });
    },
    [tables, post, saveLocalSnapshot, canEdit]
  );

  const addTable = useCallback(() => {
      if (!canEdit) return;
    const n = tables.filter((t) => t.sort_order !== -1).length;
    const t: PersistedTable = {
      id: crypto.randomUUID(),
      name: `Table ${n + 1}`,
      // Lay new tables out in the central band in a loose grid.
      pos_x: 0.22 + (n % 4) * 0.19,
      pos_y: 0.38 + Math.floor(n / 4) * 0.22,
      capacity: 8,
      sort_order: n,
    };
    setTables((prev) => {
      const next = [...prev, t];
      if (demoRef.current) saveLocalSnapshot(next, assignments);
      return next;
    });
    if (!demoRef.current) post({ action: "upsertTable", table: t });
  }, [tables, assignments, post, saveLocalSnapshot, canEdit]);

  const renameTable = useCallback(
    (id: string, name: string) => {
      if (!canEdit) return;
      const t = tables.find((x) => x.id === id);
      if (!t) return;
      const updated = { ...t, name };
      setTables((prev) => {
        const next = prev.map((x) => (x.id === id ? updated : x));
        if (demoRef.current) saveLocalSnapshot(next, assignments);
        return next;
      });
      if (!demoRef.current) post({ action: "upsertTable", table: updated });
    },
    [tables, assignments, post, saveLocalSnapshot, canEdit]
  );

  const deleteTable = useCallback(
    (id: string) => {
      if (!canEdit) return;
      setTables((prevTables) => {
        const nextTables = prevTables.filter((x) => x.id !== id);
        setAssignments((prevA) => {
          const nextA: Record<string, string> = {};
          for (const [g, tid] of Object.entries(prevA)) {
            if (tid !== id) nextA[g] = tid;
          }
          if (demoRef.current) saveLocalSnapshot(nextTables, nextA);
          return nextA;
        });
        return nextTables;
      });
      if (!demoRef.current) post({ action: "deleteTable", id });
    },
    [post, saveLocalSnapshot, canEdit]
  );

  // ---- Table repositioning via a pointer-drag on the move handle ----
  const startMove = useCallback(
    (e: React.PointerEvent, tableId: string) => {
      if (!canEdit) return;
      e.preventDefault();
      e.stopPropagation();
      const canvas = canvasRef.current;
      if (!canvas) return;
      let lastX = 0.5;
      let lastY = 0.5;
      const onMove = (ev: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        lastX = clamp((ev.clientX - rect.left) / rect.width, 0.06, 0.94);
        lastY = clamp((ev.clientY - rect.top) / rect.height, 0.1, 0.9);
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId ? { ...t, pos_x: lastX, pos_y: lastY } : t
          )
        );
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setTables((prev) => {
          const t = prev.find((x) => x.id === tableId);
          if (t) saveTable({ ...t, pos_x: lastX, pos_y: lastY });
          return prev;
        });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [saveTable, canEdit]
  );

  // ---- Derived: who sits where, who's still in the pool ----
  const seatedByTable = useMemo(() => {
    const m = new Map<string, GuestView[]>();
    for (const t of tables) m.set(t.id, []);
    for (const [guestId, tableId] of Object.entries(assignments)) {
      const v = guestViews.get(guestId);
      if (!v) continue;
      if (!m.has(tableId)) m.set(tableId, []);
      m.get(tableId)!.push(v);
    }
    return m;
  }, [tables, assignments, guestViews]);

  // Roster = eligible-by-filter guests who aren't seated, grouped by household.
  const rosterGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const eligible = (v: GuestView) => {
      if (assignments[v.id]) return false; // already seated
      if (v.status === "declined") return showDeclined;
      if (v.status === "pending") return filter === "maybe";
      return true; // accepted
    };
    const list = Array.from(guestViews.values()).filter(
      (v) =>
        eligible(v) &&
        (!q ||
          v.name.toLowerCase().includes(q) ||
          v.householdLabel.toLowerCase().includes(q))
    );
    // Group by household, preserving first-seen order.
    const order: number[] = [];
    const byHh = new Map<number, GuestView[]>();
    for (const v of list) {
      if (!byHh.has(v.householdId)) {
        byHh.set(v.householdId, []);
        order.push(v.householdId);
      }
      byHh.get(v.householdId)!.push(v);
    }
    return order.map((hid) => ({
      hid,
      label: householdLabel(hid),
      members: byHh.get(hid)!,
    }));
  }, [guestViews, assignments, filter, showDeclined, query, householdLabel]);

  const unseatedCount = rosterGroups.reduce((n, g) => n + g.members.length, 0);
  const seatedCount = Object.keys(assignments).length;
  const totalSeats = tables.reduce((n, t) => n + t.capacity, 0);

  // ---- Drag and drop ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const onDragStart = (e: DragStartEvent) => {
      if (!canEdit) return;
    setActiveId(String(e.active.id));
    setSelectedGuest(null);
  };

  const onDragEnd = (e: DragEndEvent) => {
      if (!canEdit) return;
    setActiveId(null);
    const guestId = String(e.active.id);
    const over = e.over?.id ? String(e.over.id) : null;
    if (!over) return;
    if (over === "roster") {
      unassign(guestId);
    } else if (over.startsWith("table:")) {
      assign(guestId, over.slice("table:".length));
    }
  };

  // Tap-to-assign fallback (great on touch): pick a guest, then tap a table.
  const onTableTap = (tableId: string) => {
      if (!canEdit) return;
    if (selectedGuest) {
      assign(selectedGuest, tableId);
      setSelectedGuest(null);
    }
  };

  // ---- Auto-seat first pass ----
  const autoSeat = useCallback(() => {
      if (!canEdit) return;
    // Seat everyone currently in the pool (accepted + maybe, per the filter),
    // keeping households together and grouping by side. Fills existing empty
    // seats first, then adds tables as needed. Never moves already-seated guests.
    const pool = rosterGroups.map((g) => g.members);
    if (pool.length === 0) return;
    if (
      !window.confirm(
        `Auto-seat ${unseatedCount} unseated guest${
          unseatedCount === 1 ? "" : "s"
        }? Households are kept together; you can rearrange afterwards.`
      )
    )
      return;

    // Sort households by side then by size (bigger groups placed first).
    const sideRank: Record<string, number> = { Sager: 0, Hicks: 1, Mutual: 2 };
    const groups = [...pool].sort((a, b) => {
      const sa = sideRank[a[0].side ?? ""] ?? 3;
      const sb = sideRank[b[0].side ?? ""] ?? 3;
      if (sa !== sb) return sa - sb;
      return b.length - a.length;
    });

    // Only the round tables take auto-seated guests — never the head table.
    const roundTables = tables.filter((t) => t.sort_order !== -1);

    // Working capacity map from current seatings.
    const remaining = new Map<string, number>();
    for (const t of roundTables) {
      remaining.set(t.id, t.capacity - (seatedByTable.get(t.id)?.length ?? 0));
    }
    // Track the dominant side already at each table to cluster families.
    const tableSide = new Map<string, string | null>();
    for (const t of roundTables) {
      const first = seatedByTable.get(t.id)?.[0];
      tableSide.set(t.id, first?.side ?? null);
    }

    const newTables: PersistedTable[] = [];
    const newAssignments: Record<string, string> = { ...assignments };
    let createdCount = roundTables.length;

    const findTableFor = (group: GuestView[]): string => {
      const need = group.length;
      const side = group[0].side ?? null;
      // Prefer a table with room that already leans this side.
      let best: string | null = null;
      for (const [tid, room] of Array.from(remaining.entries())) {
        if (room < need) continue;
        if (tableSide.get(tid) === side) return tid;
        if (best === null) best = tid;
      }
      if (best !== null) return best;
      // No room anywhere — make a new 8-top.
      const n = createdCount++;
      const t: PersistedTable = {
        id: crypto.randomUUID(),
        name: `Table ${n + 1}`,
        pos_x: 0.22 + (n % 4) * 0.19,
        pos_y: 0.38 + Math.floor(n / 4) * 0.22,
        capacity: 8,
        sort_order: n,
      };
      newTables.push(t);
      remaining.set(t.id, t.capacity);
      tableSide.set(t.id, side);
      return t.id;
    };

    for (const group of groups) {
      // A household larger than a table gets split across tables.
      let rest = [...group];
      while (rest.length > 0) {
        const tid = findTableFor(rest);
        const room = remaining.get(tid)!;
        const take = rest.slice(0, room);
        for (const g of take) newAssignments[g.id] = tid;
        remaining.set(tid, room - take.length);
        if (tableSide.get(tid) == null) tableSide.set(tid, group[0].side ?? null);
        rest = rest.slice(take.length);
      }
    }

    // Commit new tables, then assignments, and persist.
    const allTables = [...tables, ...newTables];
    setTables(allTables);
    setAssignments(newAssignments);
    if (demoRef.current) {
      saveLocalSnapshot(allTables, newAssignments);
    } else {
      for (const t of newTables) post({ action: "upsertTable", table: t });
      for (const [gid, tid] of Object.entries(newAssignments)) {
        if (assignments[gid] !== tid)
          post({ action: "assign", guest_id: gid, table_id: tid });
      }
    }
  }, [
    canEdit,
    rosterGroups,
    unseatedCount,
    tables,
    seatedByTable,
    assignments,
    post,
    saveLocalSnapshot,
  ]);

  // ---- CSV export (guest → table) ----
  const exportCsv = () => {
    const nameById = new Map(tables.map((t) => [t.id, t.name]));
    const cols = ["table", "guest", "side", "status", "meal", "dietary"];
    const rows: string[][] = [];
    for (const t of [...tables].sort((a, b) => a.sort_order - b.sort_order)) {
      for (const v of seatedByTable.get(t.id) ?? []) {
        rows.push([
          t.name,
          v.name,
          v.side ?? "",
          v.status,
          v.meal ?? "",
          v.dietary ? "yes" : "",
        ]);
      }
    }
    for (const g of rosterGroups.flatMap((grp) => grp.members)) {
      rows.push(["(unseated)", g.name, g.side ?? "", g.status, g.meal ?? "", g.dietary ? "yes" : ""]);
    }
    void nameById;
    const csv = [
      cols.join(","),
      ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seating-chart.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // The head table is a single special row (sort_order === -1): a long table
  // pinned to the north wall, not draggable or deletable. Everything else is a
  // round guest table.
  const headTable = tables.find((t) => t.sort_order === -1) ?? null;
  const roundTables = tables.filter((t) => t.sort_order !== -1);

  // Seed a head table once if the layout doesn't have one yet (fresh project or
  // demo mode). Runs after the initial load settles.
  useEffect(() => {
    if (loading || loadError || !canEdit) return;
    if (tables.some((t) => t.sort_order === -1)) return;
    const head: PersistedTable = {
      id: crypto.randomUUID(),
      name: "Head Table",
      pos_x: 0.5,
      pos_y: 0.085,
      capacity: 12,
      sort_order: -1,
    };
    setTables((prev) => {
      if (prev.some((t) => t.sort_order === -1)) return prev;
      const next = [head, ...prev];
      if (demoRef.current) saveLocalSnapshot(next, assignments);
      else post({ action: "upsertTable", table: head });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Full-screen: lock background scroll and allow Escape to exit.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  if (loadError) return <p role="alert">{loadError}</p>;
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-sage" />
      </div>
    );
  }

  const activeView = activeId ? guestViews.get(activeId) : null;
  const zoomPct = Math.round(zoom * 100);
  const setZoomClamped = (z: number) => setZoom(Math.max(0.5, Math.min(2, z)));

  // Canvas sizing: in full screen the plan grows to fill the viewport height;
  // otherwise it fills the column width. Zoom scales either, with scroll.
  const canvasStyle: React.CSSProperties = fullscreen
    ? { height: `${82 * zoom}vh`, aspectRatio: "16 / 11" }
    : { width: `${100 * zoom}%`, minWidth: 640 * zoom, aspectRatio: "16 / 11" };

  const floorPlan = (
    <div
      className={
        fullscreen
          ? "min-w-0 flex-1 overflow-auto bg-linen/30 p-3"
          : "overflow-auto rounded-lg border border-linen bg-white"
      }
    >
      <div
        ref={canvasRef}
        className="relative mx-auto rounded-lg bg-white"
        style={{
          ...canvasStyle,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,0,0,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,0,0,0.03) 40px)",
        }}
      >
        {/* Head table — a real, assignable long table pinned north */}
        {headTable && (
          <HeadTableNode
            table={headTable}
            guests={seatedByTable.get(headTable.id) ?? []}
            onRename={(name) => renameTable(headTable.id, name)}
            onTap={() => onTableTap(headTable.id)}
            onUnassign={unassign}
            hasSelection={Boolean(selectedGuest)}
          />
        )}

        {/* Fixed fixtures */}
        <Fixture
          className="left-1/2 bottom-[3%] h-[8%] w-[34%] -translate-x-1/2"
          label="DJ Booth"
          tone="charcoal"
        />
        <Fixture className="left-[3%] bottom-[4%] h-[13%] w-[15%]" label="Bar" tone="gold" />
        <Fixture className="right-[3%] top-[16%] h-[13%] w-[15%]" label="Bar" tone="gold" />
        {/* Dance floor — center, between head table and DJ */}
        <div className="pointer-events-none absolute left-1/2 top-[36%] h-[26%] w-[30%] -translate-x-1/2 rounded-md border-2 border-dashed border-sage/40 bg-sage/5">
          <span className="absolute inset-0 flex items-center justify-center font-serif text-sm italic text-sage/60">
            Dance Floor
          </span>
        </div>

        {/* Round guest tables */}
        {roundTables.map((t) => (
          <TableNode
            key={t.id}
            table={t}
            guests={seatedByTable.get(t.id) ?? []}
            onMoveStart={(e) => startMove(e, t.id)}
            onDelete={() => {
              if (window.confirm(`Delete "${t.name}"? Its guests go back to the list.`))
                deleteTable(t.id);
            }}
            onRename={(name) => renameTable(t.id, name)}
            onTap={() => onTableTap(t.id)}
            onUnassign={unassign}
            hasSelection={Boolean(selectedGuest)}
          />
        ))}

        {roundTables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button disabled={!canEdit} hidden={!canEdit} onClick={addTable} className="btn-primary flex items-center gap-2 !text-sm">
              <Plus className="h-4 w-4" />
              Add your first table
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const rosterEl = (
    <RosterRail
      groups={rosterGroups}
      filter={filter}
      setFilter={setFilter}
      showDeclined={showDeclined}
      setShowDeclined={setShowDeclined}
      query={query}
      setQuery={setQuery}
      selectedGuest={selectedGuest}
      setSelectedGuest={(g) => {
        setSelectedGuest(g);
        // On a phone in full screen, close the drawer once a guest is picked so
        // the map is visible to tap a table. (sm breakpoint = 640px)
        if (g && fullscreen && typeof window !== "undefined" && window.innerWidth < 640) {
          setRosterOpen(false);
        }
      }}
      heightClass={
        fullscreen
          ? "h-full rounded-none border-0 border-r"
          : "max-h-[44vh] lg:max-h-[74vh]"
      }
    />
  );

  // Floating "you are seating X — tap a table" banner. Stays visible even when
  // the guest list is hidden or its drawer has closed (key on mobile).
  const selectionBanner = selectedGuest ? (
    <div className="flex items-center gap-2 rounded-full border border-sage bg-white px-3 py-1.5 shadow-lg">
      <span className="font-sans text-xs text-charcoal">
        Seating <span className="font-semibold">{guestViews.get(selectedGuest)?.name}</span>
        <span className="text-warm-gray"> — tap a table</span>
      </span>
      <button
        onClick={() => setSelectedGuest(null)}
        className="rounded-full p-0.5 text-warm-gray hover:text-red-500"
        title="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  ) : null;

  // The view toolbar (zoom / roster / full screen), shared by both layouts.
  const viewControls = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setRosterOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-linen bg-white px-2 py-1.5 font-sans text-xs text-charcoal hover:border-sage"
        title={rosterOpen ? "Hide guest list" : "Show guest list"}
      >
        {rosterOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        <span className="hidden sm:inline">{rosterOpen ? "Hide list" : "Show list"}</span>
      </button>
      <div className="flex items-center rounded-md border border-linen bg-white">
        <button onClick={() => setZoomClamped(zoom - 0.15)} className="p-1.5 text-charcoal hover:text-sage" title="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="w-11 border-x border-linen py-1 text-center font-sans text-xs text-charcoal hover:text-sage"
          title="Reset zoom"
        >
          {zoomPct}%
        </button>
        <button onClick={() => setZoomClamped(zoom + 0.15)} className="p-1.5 text-charcoal hover:text-sage" title="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={() => setFullscreen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-linen bg-white px-2 py-1.5 font-sans text-xs text-charcoal hover:border-sage"
        title={fullscreen ? "Exit full screen (Esc)" : "Full screen"}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        <span className="hidden sm:inline">{fullscreen ? "Exit" : "Full screen"}</span>
      </button>
    </div>
  );

  const actionButtons = (
    <div className="flex flex-wrap items-center gap-2">
      <button disabled={!canEdit} hidden={!canEdit} onClick={addTable} className="btn-outline flex items-center gap-2 !py-2 !text-sm">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add table</span>
      </button>
      <button
        hidden={!canEdit} onClick={autoSeat}
        className="btn-primary flex items-center gap-2 !py-2 !text-sm"
        disabled={!canEdit || unseatedCount === 0}
        title="Seat everyone in the pool, keeping families together"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Auto-seat</span>
      </button>
      <button onClick={exportCsv} className="btn-outline flex items-center gap-2 !py-2 !text-sm">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </button>
    </div>
  );

  // ---------------- FULL SCREEN LAYOUT ----------------
  if (fullscreen) {
    return (
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="fixed inset-0 z-50 flex flex-col bg-ivory">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-linen bg-white px-3 py-2">
            {actionButtons}
            <div className="flex items-center gap-3">
              <span className="hidden font-sans text-xs text-warm-gray md:inline">
                {seatedCount} seated · {unseatedCount} unseated
              </span>
              {viewControls}
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1">
            {rosterOpen && (
              <>
                {/* Mobile: dim the map behind a slide-over drawer */}
                <div
                  className="absolute inset-0 z-10 bg-charcoal/20 sm:hidden"
                  onClick={() => setRosterOpen(false)}
                />
                <div className="absolute inset-y-0 left-0 z-20 h-full w-[82%] max-w-[300px] shadow-xl sm:static sm:w-[260px] sm:shadow-none">
                  {rosterEl}
                </div>
              </>
            )}
            {floorPlan}

            {selectionBanner && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
                <div className="pointer-events-auto">{selectionBanner}</div>
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeView ? (
            <div className="pointer-events-none">
              <ChipBody view={activeView} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // ---------------- NORMAL (in-page) LAYOUT ----------------
  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {actionButtons}
        <div className="flex items-center gap-2">
          {demo && (
            <span className="rounded-full bg-gold/10 px-3 py-1 font-sans text-xs font-medium text-gold">
              Saving to this device
            </span>
          )}
          {viewControls}
        </div>
      </div>

      {/* Stat strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat icon={<Users className="h-4 w-4 text-sage" />} label="Seated" value={seatedCount} />
        <MiniStat icon={<Armchair className="h-4 w-4 text-gold" />} label="Unseated" value={unseatedCount} />
        <MiniStat icon={<Utensils className="h-4 w-4 text-sage" />} label="Tables" value={roundTables.length} />
        <MiniStat icon={<Armchair className="h-4 w-4 text-charcoal-light" />} label="Seats" value={totalSeats} />
      </div>

      <div
        className={
          rosterOpen
            ? "mt-6 space-y-4 lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:space-y-0"
            : "mt-6"
        }
      >
        {rosterOpen && rosterEl}

        {/* ---------------- Floor plan ---------------- */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="font-sans text-xs text-warm-gray">
              Drag a guest onto a table, or tap a guest then a table. On a phone,{" "}
              <span className="font-medium">Full screen</span> works best.
            </p>
            {selectionBanner}
          </div>
          {floorPlan}
        </div>
      </div>

      {/* Drag preview */}
      <DragOverlay dropAnimation={null}>
        {activeView ? (
          <div className="pointer-events-none">
            <ChipBody view={activeView} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ------------------------------------------------------------------
// Roster rail
// ------------------------------------------------------------------

function RosterRail({
  groups,
  filter,
  setFilter,
  showDeclined,
  setShowDeclined,
  query,
  setQuery,
  selectedGuest,
  setSelectedGuest,
  heightClass = "max-h-[74vh]",
}: {
  groups: { hid: number; label: string; members: GuestView[] }[];
  filter: FilterMode;
  setFilter: (f: FilterMode) => void;
  showDeclined: boolean;
  setShowDeclined: (v: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  selectedGuest: string | null;
  setSelectedGuest: (g: string | null) => void;
  heightClass?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "roster" });
  return (
    <div
      ref={setNodeRef}
      className={`flex ${heightClass} w-full flex-col border bg-white transition-colors ${
        heightClass.includes("rounded-none") ? "" : "rounded-lg"
      } ${isOver ? "border-sage bg-sage/5" : "border-linen"}`}
    >
      <div className="border-b border-linen p-3">
        <div className="flex rounded-lg bg-ivory p-1 font-sans text-xs">
          <SegBtn active={filter === "accepted"} onClick={() => setFilter("accepted")}>
            Accepted
          </SegBtn>
          <SegBtn active={filter === "maybe"} onClick={() => setFilter("maybe")}>
            + Maybe
          </SegBtn>
        </div>
        <label className="mt-2 flex items-center gap-2 font-sans text-xs text-warm-gray">
          <input
            type="checkbox"
            checked={showDeclined}
            onChange={(e) => setShowDeclined(e.target.checked)}
            className="accent-sage"
          />
          Show declined
        </label>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-warm-gray" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guests…"
            className="w-full rounded-md border border-linen bg-white py-1.5 pl-8 pr-2 font-sans text-xs outline-none focus:border-sage"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {groups.length === 0 ? (
          <p className="py-8 text-center font-sans text-xs text-warm-gray">
            Everyone in this list is seated. 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.hid}>
                <p className="mb-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-warm-gray">
                  {g.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {g.members.map((v) => (
                    <GuestChip
                      key={v.id}
                      view={v}
                      selected={selectedGuest === v.id}
                      onSelect={() =>
                        setSelectedGuest(selectedGuest === v.id ? null : v.id)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedGuest && (
        <div className="border-t border-linen bg-sage/5 px-3 py-2 font-sans text-xs text-sage">
          Tap a table to seat this guest.
        </div>
      )}
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1 font-medium transition-colors ${
        active ? "bg-white text-charcoal shadow-sm" : "text-warm-gray"
      }`}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------
// Guest chip (draggable + selectable)
// ------------------------------------------------------------------

function GuestChip({
  view,
  selected,
  onSelect,
}: {
  view: GuestView;
  selected: boolean;
  onSelect: () => void;
}) {
  const { canEdit } = useAdmin();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    disabled: !canEdit,
    id: view.id,
  });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disabled={!canEdit} onClick={onSelect}
      className={`touch-none ${isDragging ? "opacity-30" : ""} ${
        selected ? "ring-2 ring-sage ring-offset-1" : ""
      } rounded-full`}
    >
      <ChipBody view={view} />
    </button>
  );
}

function ChipBody({ view, dragging }: { view: GuestView; dragging?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-linen bg-white px-2.5 py-1 font-sans text-xs text-charcoal ${
        dragging ? "shadow-lg" : "hover:border-sage"
      } ${view.status === "declined" ? "line-through opacity-60" : ""}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: sideColor(view.side) }}
      />
      <span className="whitespace-nowrap">{view.name}</span>
      {view.typeTag && (
        <span className="text-[10px] text-warm-gray">({view.typeTag})</span>
      )}
      {view.status === "pending" && (
        <span className="text-[10px] font-medium text-gold">?</span>
      )}
      {view.dietary && <Utensils className="h-3 w-3 text-sage" />}
    </span>
  );
}

// ------------------------------------------------------------------
// Round table on the floor plan (droppable)
// ------------------------------------------------------------------

function TableNode({
  table,
  guests,
  onMoveStart,
  onDelete,
  onRename,
  onTap,
  onUnassign,
  hasSelection,
}: {
  table: PersistedTable;
  guests: GuestView[];
  onMoveStart: (e: React.PointerEvent) => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onTap: () => void;
  onUnassign: (guestId: string) => void;
  hasSelection: boolean;
}) {
  const { canEdit } = useAdmin();
  const { setNodeRef, isOver } = useDroppable({ id: `table:${table.id}` });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(table.name);

  const full = guests.length >= table.capacity;
  const over = guests.length > table.capacity;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${table.pos_x * 100}%`, top: `${table.pos_y * 100}%` }}
    >
      <div
        ref={setNodeRef}
        onClick={hasSelection ? onTap : undefined}
        className={`w-[150px] rounded-2xl border-2 bg-white/95 p-2 shadow-sm backdrop-blur transition-colors ${
          isOver
            ? "border-sage ring-2 ring-sage/30"
            : over
              ? "border-red-300"
              : "border-linen"
        } ${hasSelection ? "cursor-pointer hover:border-sage" : ""}`}
      >
        {/* Header: move handle · name · seats · delete */}
        <div className="flex items-center gap-1">
          <button
            disabled={!canEdit} hidden={!canEdit} onPointerDown={onMoveStart}
            className="cursor-grab touch-none rounded p-0.5 text-warm-gray hover:bg-ivory active:cursor-grabbing"
            title="Drag to move table"
          >
            <Move className="h-3.5 w-3.5" />
          </button>
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                setEditing(false);
                if (draft.trim()) onRename(draft.trim());
                else setDraft(table.name);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="min-w-0 flex-1 rounded border border-sage bg-white px-1 py-0.5 font-sans text-xs outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(table.name);
                if (canEdit) setEditing(true);
              }}
              className="group flex min-w-0 flex-1 items-center gap-1 text-left"
            >
              <span className="truncate font-serif text-sm text-charcoal">
                {table.name}
              </span>
              <Pencil className="h-2.5 w-2.5 shrink-0 text-warm-gray opacity-0 group-hover:opacity-100" />
            </button>
          )}
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 font-sans text-[10px] font-semibold ${
              over
                ? "bg-red-100 text-red-600"
                : full
                  ? "bg-gold/15 text-gold-dark"
                  : "bg-ivory text-warm-gray"
            }`}
          >
            {guests.length}/{table.capacity}
          </span>
          <button
            disabled={!canEdit} hidden={!canEdit} onClick={onDelete}
            className="shrink-0 rounded p-0.5 text-warm-gray hover:bg-red-50 hover:text-red-500"
            title="Delete table"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        {/* Seated guests */}
        <div className="mt-1.5 min-h-[40px] space-y-1">
          {guests.length === 0 ? (
            <p className="py-2 text-center font-sans text-[11px] italic text-warm-gray">
              Drop guests here
            </p>
          ) : (
            guests.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-1 rounded-md bg-ivory px-1.5 py-0.5"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: sideColor(v.side) }}
                />
                <span className="min-w-0 flex-1 truncate font-sans text-[11px] text-charcoal">
                  {v.name}
                </span>
                {v.dietary && <Utensils className="h-2.5 w-2.5 shrink-0 text-sage" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnassign(v.id);
                  }}
                  className="shrink-0 rounded text-warm-gray hover:text-red-500"
                  disabled={!canEdit} hidden={!canEdit} title="Remove from table"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Head table — long, fixed to the north wall, assignable but not movable
// ------------------------------------------------------------------

function HeadTableNode({
  table,
  guests,
  onRename,
  onTap,
  onUnassign,
  hasSelection,
}: {
  table: PersistedTable;
  guests: GuestView[];
  onRename: (name: string) => void;
  onTap: () => void;
  onUnassign: (guestId: string) => void;
  hasSelection: boolean;
}) {
  const { canEdit } = useAdmin();
  const { setNodeRef, isOver } = useDroppable({ id: `table:${table.id}` });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(table.name);
  const over = guests.length > table.capacity;

  return (
    <div
      ref={setNodeRef}
      onClick={hasSelection ? onTap : undefined}
      className={`absolute left-[6%] right-[6%] top-[2%] rounded-xl border-2 bg-white/95 p-2 shadow-sm backdrop-blur transition-colors ${
        isOver
          ? "border-sage ring-2 ring-sage/30"
          : over
            ? "border-red-300"
            : "border-sage/50"
      } ${hasSelection ? "cursor-pointer hover:border-sage" : ""}`}
    >
      <div className="flex items-center justify-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (draft.trim()) onRename(draft.trim());
              else setDraft(table.name);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="rounded border border-sage bg-white px-1 py-0.5 text-center font-serif text-sm outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(table.name);
              if (canEdit) setEditing(true);
            }}
            className="group flex items-center gap-1"
          >
            <span className="font-serif text-sm font-medium uppercase tracking-wide text-sage-dark">
              {table.name}
            </span>
            <Pencil className="h-2.5 w-2.5 text-warm-gray opacity-0 group-hover:opacity-100" />
          </button>
        )}
        <span
          className={`rounded-full px-1.5 py-0.5 font-sans text-[10px] font-semibold ${
            over ? "bg-red-100 text-red-600" : "bg-ivory text-warm-gray"
          }`}
        >
          {guests.length}/{table.capacity}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-1">
        {guests.length === 0 ? (
          <span className="py-1 font-sans text-[11px] italic text-warm-gray">
            Drop the couple &amp; wedding party here
          </span>
        ) : (
          guests.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 rounded-full bg-ivory px-2 py-0.5 font-sans text-[11px] text-charcoal"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: sideColor(v.side) }}
              />
              {v.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnassign(v.id);
                }}
                className="text-warm-gray hover:text-red-500"
                title="Remove from head table"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Small pieces
// ------------------------------------------------------------------

function Fixture({
  className,
  label,
  tone,
}: {
  className: string;
  label: string;
  tone: "sage" | "gold" | "charcoal";
}) {
  const tones = {
    sage: "bg-sage/15 border-sage/40 text-sage-dark",
    gold: "bg-gold/15 border-gold/40 text-gold-dark",
    charcoal: "bg-charcoal/10 border-charcoal/30 text-charcoal",
  };
  return (
    <div
      className={`pointer-events-none absolute flex items-center justify-center rounded-md border ${tones[tone]} ${className}`}
    >
      <span className="font-sans text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-linen bg-white px-4 py-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-sans text-[11px] uppercase tracking-wide text-warm-gray">
          {label}
        </span>
      </div>
      <p className="mt-1 font-serif text-2xl text-charcoal">{value}</p>
    </div>
  );
}
