"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch, useAdmin } from "@/components/admin/AdminAuthGate";
import type { SeatingTable } from "@/lib/database.types";
export type PersistedTable = Pick<
  SeatingTable,
  "id" | "name" | "pos_x" | "pos_y" | "capacity" | "sort_order"
>;
export function useSeatingData() {
  const { canEdit } = useAdmin();
  const [tables, setTables] = useState<PersistedTable[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const queue = useRef(Promise.resolve());
  const failed = useRef(false);
  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/seating")
      .then((r) => r.json())
      .then((body) => {
        if (!active) return;
        setTables(body.tables);
        setAssignments(
          Object.fromEntries(
            body.assignments.map(
              (a: { guest_id: string; table_id: string }) => [
                a.guest_id,
                a.table_id,
              ],
            ),
          ),
        );
      })
      .catch((e) => {
        if (active) setLoadError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const post = useCallback(
    (body: Record<string, unknown>) => {
      if (!canEdit) return;
      // Serial writes keep new tables ahead of the assignments referencing them.
      queue.current = queue.current
        .then(async () => {
          if (failed.current) return;
          await adminFetch("/api/admin/seating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        })
        .catch((e) => {
          failed.current = true;
          setLoadError(e.message);
        });
    },
    [canEdit],
  );
  return {
    tables,
    setTables,
    assignments,
    setAssignments,
    loading,
    loadError,
    post,
  };
}
