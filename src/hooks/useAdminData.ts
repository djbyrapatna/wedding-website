"use client";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/components/admin/AdminAuthGate";
import type { AdminData } from "@/lib/admin/types";
export function useAdminData() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/rsvps");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}
