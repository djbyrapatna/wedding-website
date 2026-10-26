"use client";
import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Move, Pencil, Trash2, Utensils, X, Search } from "lucide-react";
import { useAdmin } from "./AdminAuthGate";
import type { GuestView, FilterMode } from "@/lib/admin/seating";
import type { PersistedTable } from "@/hooks/useSeatingData";
import { sideColor } from "@/config/seating";
export function RosterRail({
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
          <SegBtn
            active={filter === "accepted"}
            onClick={() => setFilter("accepted")}
          >
            Accepted
          </SegBtn>
          <SegBtn
            active={filter === "maybe"}
            onClick={() => setFilter("maybe")}
          >
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
      disabled={!canEdit}
      onClick={onSelect}
      className={`touch-none ${isDragging ? "opacity-30" : ""} ${
        selected ? "ring-2 ring-sage ring-offset-1" : ""
      } rounded-full`}
    >
      <ChipBody view={view} />
    </button>
  );
}

export function ChipBody({
  view,
  dragging,
}: {
  view: GuestView;
  dragging?: boolean;
}) {
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

export function TableNode({
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
            disabled={!canEdit}
            hidden={!canEdit}
            onPointerDown={onMoveStart}
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
              disabled={!canEdit}
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
            disabled={!canEdit}
            hidden={!canEdit}
            onClick={onDelete}
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
                {v.dietary && (
                  <Utensils className="h-2.5 w-2.5 shrink-0 text-sage" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnassign(v.id);
                  }}
                  className="shrink-0 rounded text-warm-gray hover:text-red-500"
                  disabled={!canEdit}
                  hidden={!canEdit}
                  title="Remove from table"
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

export function HeadTableNode({
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
            disabled={!canEdit}
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
                disabled={!canEdit}
                hidden={!canEdit}
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

export function Fixture({
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

export function MiniStat({
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
