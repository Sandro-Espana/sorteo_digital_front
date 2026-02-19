"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { normalizeSlotStatus } from "@/lib/adapters";
import { useCallback, useEffect, useMemo, useState } from "react";

type PuestoOut = {
  puesto_num: number;
  status: string;
};

type Resumen = {
  total: number;
  vendidos: number;
  porVender: number;
};

type State = {
  resumen: Resumen | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: Resumen };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 10_000;

function isVendidaStatus(st: string) {
  const norm = normalizeSlotStatus(st);
  return norm === "RESERVADO" || norm === "PAGADO";
}

export function usePuestosSorteoQuery(idSorteo: number, totalBoletas: number) {
  const [state, setState] = useState<State>({ resumen: null, loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => `puestos:sorteo:${idSorteo}`, [idSorteo]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setState({ resumen: cached.data, loading: false, error: null, isOffline: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = `/api/sorteos/${encodeURIComponent(String(idSorteo))}/puestos`;

    try {
      const raw = await apiGet<unknown>(path);
      if (!Array.isArray(raw)) {
        throw new Error(`Respuesta inesperada de ${path}`);
      }

      const arr = raw as PuestoOut[];
      const total = totalBoletas > 0 ? totalBoletas : arr.length || 100;
      const vendidos = arr.reduce((a, p) => a + (isVendidaStatus(String((p as any)?.status ?? "")) ? 1 : 0), 0);
      const porVender = Math.max(0, total - vendidos);

      const resumen: Resumen = { total, vendidos, porVender };
      cache.set(cacheKey, { ts: Date.now(), data: resumen });
      setState({ resumen, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando puestos");
      if (msg.includes("401")) {
        clearToken();
        if (typeof window !== "undefined") window.location.assign("/login");
        return;
      }
      setState({ resumen: null, loading: false, error: msg, isOffline: false });
    }
  }, [cacheKey, idSorteo, totalBoletas]);

  useEffect(() => {
    setState((s) => ({ ...s, isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false }));
    fetchNow();
  }, [fetchNow]);

  return { ...state, retry: fetchNow, invalidate: () => cache.delete(cacheKey) };
}
