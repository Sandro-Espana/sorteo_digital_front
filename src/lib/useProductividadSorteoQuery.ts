"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductividadSorteoResponse, ProductividadVendedorRow } from "@/lib/productividad";

export type ProductividadSorteoFilters = {
  vendedor: string;
};

type Detalle = {
  id_sorteo: number;
  sorteo: string;
  fecha: string | null;
  estado: string;
  total_vendido: number;
  total_abonado: number;
  saldo_total: number;
  ocupacion_porcentaje: number;
  por_vendedor: ProductividadVendedorRow[];
};

type State = {
  detalle: Detalle | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: Detalle };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function moneyNumber(v: any): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeVendedorRow(raw: any, idx: number): ProductividadVendedorRow {
  const vendedor_id = typeof raw?.vendedor_id === "number" ? raw.vendedor_id : typeof raw?.id_vendedor === "number" ? raw.id_vendedor : null;
  const vendedor = typeof raw?.vendedor === "string" ? raw.vendedor : typeof raw?.nombre === "string" ? raw.nombre : `Vendedor ${vendedor_id ?? idx + 1}`;
  return {
    vendedor_id,
    vendedor,
    ventas_realizadas: moneyNumber(raw?.ventas_realizadas),
    total_vendido: moneyNumber(raw?.total_vendido),
    total_cobrado: moneyNumber(raw?.total_cobrado),
    saldo_total: moneyNumber(raw?.saldo_total),
    efectividad_porcentaje: moneyNumber(raw?.efectividad_porcentaje),
  };
}

function sanitizeText(v: string) {
  return v.replace(/\s+/g, " ").trim().slice(0, 60);
}

function applyFilters(detalle: Detalle, filters: ProductividadSorteoFilters): Detalle {
  const vendedor = sanitizeText(filters.vendedor).toLowerCase();
  if (!vendedor) return detalle;
  return {
    ...detalle,
    por_vendedor: detalle.por_vendedor.filter((v) => (v.vendedor ?? "").toLowerCase().includes(vendedor)),
  };
}

export function useProductividadSorteoQuery(idSorteo: number, filters: ProductividadSorteoFilters) {
  const [state, setState] = useState<State>({ detalle: null, loading: true, error: null, isOffline: false });

  const [debounced, setDebounced] = useState(filters);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebounced(filters), 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const cacheKey = useMemo(() => `prod:sorteo:${idSorteo}`, [idSorteo]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setState({ detalle: applyFilters(cached.data, debounced), loading: false, error: null, isOffline: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = `/api/productividad/sorteo/${encodeURIComponent(String(idSorteo))}`;

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const raw = await apiGet<ProductividadSorteoResponse | any>(path);
        const id_sorteo = typeof raw?.id_sorteo === "number" ? raw.id_sorteo : idSorteo;
        const sorteo = typeof raw?.sorteo === "string" ? raw.sorteo : typeof raw?.nombre === "string" ? raw.nombre : `Sorteo ${id_sorteo}`;
        const fecha = typeof raw?.fecha === "string" ? raw.fecha : typeof raw?.created_at === "string" ? raw.created_at : null;
        const estado = typeof raw?.estado === "string" ? raw.estado : "";

        const porVendArr = Array.isArray(raw?.por_vendedor) ? raw.por_vendedor : [];
        const por_vendedor = porVendArr.map((r: any, idx: number) => normalizeVendedorRow(r, idx));

        const normalized: Detalle = {
          id_sorteo,
          sorteo,
          fecha,
          estado,
          total_vendido: moneyNumber(raw?.total_vendido),
          total_abonado: moneyNumber(raw?.total_abonado),
          saldo_total: moneyNumber(raw?.saldo_total),
          ocupacion_porcentaje: moneyNumber(raw?.ocupacion_porcentaje),
          por_vendedor,
        };

        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ detalle: applyFilters(normalized, debounced), loading: false, error: null, isOffline: false });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando productividad");
        lastError = msg;

        if (msg.includes("401")) {
          clearToken();
          if (typeof window !== "undefined") window.location.assign("/login");
          return;
        }

        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
      }
    }

    setState({ detalle: null, loading: false, error: lastError ?? "Error cargando productividad", isOffline: false });
  }, [cacheKey, debounced, idSorteo]);

  useEffect(() => {
    setState((s) => ({ ...s, isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false }));
    fetchNow();
  }, [fetchNow]);

  useEffect(() => {
    function onOnline() {
      setState((s) => ({ ...s, isOffline: false }));
      fetchNow();
    }
    function onOffline() {
      setState((s) => ({ ...s, isOffline: true }));
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [fetchNow]);

  return { ...state, retry: fetchNow, invalidate: () => cache.delete(cacheKey) };
}
