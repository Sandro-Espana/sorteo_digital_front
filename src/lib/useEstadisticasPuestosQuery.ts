"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

export type EstadisticasPuestosOut = {
  total: number;
  disponibles: number;
  reservados: number;
  vendidos: number;
  bloqueados: number;
  anulados: number;
  suma_verificada: number;
};

type State = {
  data: EstadisticasPuestosOut | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: EstadisticasPuestosOut };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 10_000;

function normalize(raw: any): EstadisticasPuestosOut {
  return {
    total: Number(raw?.total) || 0,
    disponibles: Number(raw?.disponibles) || 0,
    reservados: Number(raw?.reservados) || 0,
    vendidos: Number(raw?.vendidos) || 0,
    bloqueados: Number(raw?.bloqueados) || 0,
    anulados: Number(raw?.anulados) || 0,
    suma_verificada: Number(raw?.suma_verificada) || 0,
  };
}

export function useEstadisticasPuestosQuery(idSorteo: number) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => `sorteo:estadisticas-puestos:${idSorteo}`, [idSorteo]);

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

    const path = `/api/sorteos/${encodeURIComponent(String(idSorteo))}/estadisticas-puestos`;

    try {
      const raw = await apiGet<any>(path);
      const data = normalize(raw);
      cache.set(cacheKey, { ts: Date.now(), data });
      setState({ data, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando estadísticas de puestos");
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
