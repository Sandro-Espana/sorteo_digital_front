"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

export type DashboardVendedorRow = {
  vendedor_id: number | null;
  nombre: string;
  total_pagado: number;
  total_abonado: number;
};

export type DashboardVentasVendedoresOut = {
  sorteo_id: number;
  vendedores: DashboardVendedorRow[];
};

type State = {
  data: DashboardVentasVendedoresOut | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: DashboardVentasVendedoresOut };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 10_000;

function normalizeRow(raw: any, idx: number): DashboardVendedorRow {
  const vendedor_id = raw?.vendedor_id == null ? null : Number(raw.vendedor_id);
  const nombre = typeof raw?.nombre === "string" ? raw.nombre : typeof raw?.vendedor === "string" ? raw.vendedor : `Vendedor ${vendedor_id ?? idx + 1}`;
  const total_pagado = Number(raw?.total_pagado) || 0;
  const total_abonado = Number(raw?.total_abonado) || 0;
  return { vendedor_id: Number.isFinite(vendedor_id as any) ? (vendedor_id as number) : null, nombre, total_pagado, total_abonado };
}

function normalize(raw: any, idSorteo: number): DashboardVentasVendedoresOut {
  const sorteo_id = Number(raw?.sorteo_id) || idSorteo;
  const arr = Array.isArray(raw?.vendedores) ? raw.vendedores : [];
  const vendedores = arr.map((r: any, idx: number) => normalizeRow(r, idx));
  return { sorteo_id, vendedores };
}

export function useDashboardVentasVendedoresQuery(idSorteo: number) {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => `dash:vendedores:${idSorteo}`, [idSorteo]);

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

    const path = `/api/dashboard/sorteo/${encodeURIComponent(String(idSorteo))}/ventas-vendedores`;

    try {
      const raw = await apiGet<any>(path);
      const data = normalize(raw, idSorteo);
      cache.set(cacheKey, { ts: Date.now(), data });
      setState({ data, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando ventas por vendedor");
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
