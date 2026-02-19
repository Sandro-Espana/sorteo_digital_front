"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DashboardOcupacionOut = {
  sorteo_id: number;
  total_puestos: number;
  vendidos_pagados: number;
  reservados_abono: number;
  disponibles: number;
};

type State = {
  data: DashboardOcupacionOut | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: DashboardOcupacionOut };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 10_000;

function normalize(raw: any, idSorteo: number): DashboardOcupacionOut {
  const total_puestos = Number(raw?.total_puestos) || 0;
  const vendidos_pagados = Number(raw?.vendidos_pagados) || 0;
  const reservados_abono = Number(raw?.reservados_abono) || 0;
  const disponibles = Number(raw?.disponibles) || 0;
  const sorteo_id = Number(raw?.sorteo_id) || idSorteo;
  return { sorteo_id, total_puestos, vendidos_pagados, reservados_abono, disponibles };
}

export function useDashboardOcupacionQuery(idSorteo: number) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => `dash:ocupacion:${idSorteo}`, [idSorteo]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setState({ data: cached.data, loading: false, error: null, isOffline: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = `/api/dashboard/sorteo/${encodeURIComponent(String(idSorteo))}/ocupacion`;

    try {
      const raw = await apiGet<any>(path);
      const data = normalize(raw, idSorteo);
      cache.set(cacheKey, { ts: Date.now(), data });
      setState({ data, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando ocupación");
      if (msg.includes("401")) {
        clearToken();
        if (typeof window !== "undefined") window.location.assign("/login");
        return;
      }
      setState({ data: null, loading: false, error: msg, isOffline: false });
    }
  }, [cacheKey, idSorteo]);

  useEffect(() => {
    setState((s) => ({ ...s, isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false }));
    fetchNow();
  }, [fetchNow]);

  return { ...state, retry: fetchNow, invalidate: () => cache.delete(cacheKey) };
}
