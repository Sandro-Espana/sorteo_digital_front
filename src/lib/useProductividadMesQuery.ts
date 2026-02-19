"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductividadMensualResponse, ProductividadSorteoRow, ProductividadVendedorRow } from "@/lib/productividad";

export type ProductividadMesFilters = {
  estado: string;
  vendedor: string;
};

type State = {
  mensual: { mes: number; anio: number; sorteos: ProductividadSorteoRow[]; por_vendedor?: ProductividadVendedorRow[] } | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: any };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function moneyNumber(v: any): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeSorteoRow(raw: any, idx: number): ProductividadSorteoRow {
  const id_sorteo = typeof raw?.id_sorteo === "number" ? raw.id_sorteo : typeof raw?.id === "number" ? raw.id : idx + 1;
  const sorteo = typeof raw?.sorteo === "string" ? raw.sorteo : typeof raw?.nombre === "string" ? raw.nombre : `Sorteo ${id_sorteo}`;
  const fecha = typeof raw?.fecha === "string" ? raw.fecha : typeof raw?.created_at === "string" ? raw.created_at : null;
  const estado = typeof raw?.estado === "string" ? raw.estado : "";

  return {
    id_sorteo,
    sorteo,
    fecha,
    estado,
    total_vendido: moneyNumber(raw?.total_vendido),
    total_abonado: moneyNumber(raw?.total_abonado),
    saldo_total: moneyNumber(raw?.saldo_total),
    ocupacion_porcentaje: moneyNumber(raw?.ocupacion_porcentaje),
  };
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

function applyFilters(
  data: { mes: number; anio: number; sorteos: ProductividadSorteoRow[]; por_vendedor?: ProductividadVendedorRow[] },
  filters: ProductividadMesFilters
) {
  const estado = sanitizeText(filters.estado).toLowerCase();
  const vendedor = sanitizeText(filters.vendedor).toLowerCase();

  let sorteos = data.sorteos;
  if (estado) sorteos = sorteos.filter((s) => (s.estado ?? "").toLowerCase().includes(estado));

  let por_vendedor = data.por_vendedor;
  if (por_vendedor && vendedor) {
    por_vendedor = por_vendedor.filter((v) => (v.vendedor ?? "").toLowerCase().includes(vendedor));
  }

  return { ...data, sorteos, por_vendedor };
}

export function useProductividadMesQuery(anio: number, mes: number, filters: ProductividadMesFilters) {
  const [state, setState] = useState<State>({ mensual: null, loading: true, error: null, isOffline: false });

  const [debounced, setDebounced] = useState(filters);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebounced(filters), 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const cacheKey = useMemo(() => `prod:mes:${anio}:${mes}`, [anio, mes]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      const d = cached.data;
      setState({ mensual: applyFilters(d, debounced), loading: false, error: null, isOffline: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = `/api/productividad/sorteos?anio=${encodeURIComponent(String(anio))}&mes=${encodeURIComponent(String(mes))}`;

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const raw = await apiGet<ProductividadMensualResponse | any>(path);
        const sorteosArr = Array.isArray(raw?.sorteos) ? raw.sorteos : Array.isArray(raw) ? raw : [];
        const sorteos = sorteosArr.map((r: any, idx: number) => normalizeSorteoRow(r, idx));
        const porVendArr = Array.isArray(raw?.por_vendedor) ? raw.por_vendedor : undefined;
        const por_vendedor = porVendArr ? porVendArr.map((r: any, idx: number) => normalizeVendedorRow(r, idx)) : undefined;

        const normalized = { mes: Number(raw?.mes ?? mes) || mes, anio: Number(raw?.anio ?? anio) || anio, sorteos, por_vendedor };
        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ mensual: applyFilters(normalized, debounced), loading: false, error: null, isOffline: false });
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

    setState({ mensual: null, loading: false, error: lastError ?? "Error cargando productividad", isOffline: false });
  }, [anio, cacheKey, debounced, mes]);

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
