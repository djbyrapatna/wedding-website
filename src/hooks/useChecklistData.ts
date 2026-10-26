"use client";
import { useCallback, useEffect, useState, useRef } from "react";
import { useAdmin, adminFetch } from "@/components/admin/AdminAuthGate";
export type ItemState = { checked: boolean; notes: string };
export type StateMap = Record<string, ItemState>;
export function useChecklistData() {
  const { canEdit } = useAdmin();
  const [state, setState] = useState<StateMap>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    adminFetch("/api/admin/checklist")
      .then((r) => r.json())
      .then((body) => {
        if (active) setState(body.items);
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
  const itemState = useCallback(
    (id: string): ItemState => state[id] ?? { checked: false, notes: "" },
    [state],
  );
  const persist = useCallback(
    (id: string, next: ItemState) => {
      if (!canEdit) return;
      setState((previous) => ({ ...previous, [id]: next }));
      // Preserve edit order so a slower earlier save cannot overwrite newer notes.
      queue.current = queue.current
        .then(async () => {
          await adminFetch("/api/admin/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: id, ...next }),
          });
        })
        .catch((e) => setLoadError(e.message));
    },
    [canEdit],
  );
  return { state, loading, loadError, itemState, persist };
}
