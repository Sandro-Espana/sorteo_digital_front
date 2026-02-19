"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import type { CarteraItem } from "@/lib/cartera";
import { clearToken } from "@/lib/auth";

export type CarteraFilters = {
  nombre: string;
  telefono: string;
};

type State = {
  items: CarteraItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = {
  ts: number;
  data: CarteraItem[];
};

const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function hashToStableNegativeInt(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  if (h === 0) h = 1;
  return -Math.abs(h);
}

function normalizeCarteraItem(raw: any, idx: number): CarteraItem {
  const nombre = typeof raw?.nombre === "string" ? raw.nombre : "";
  const telefono = typeof raw?.telefono === "string" ? raw.telefono : null;

  const total =
    typeof raw?.total === "number"
      ? raw.total
      : typeof raw?.total_venta === "number"
        ? raw.total_venta
        : 0;

  const abonado =
    typeof raw?.abonado === "number"
      ? raw.abonado
      : typeof raw?.total_abonado === "number"
        ? raw.total_abonado
        : 0;

  const saldo = typeof raw?.saldo === "number" ? raw.saldo : 0;

  const id =
    typeof raw?.id === "number" && Number.isFinite(raw.id)
      ? raw.id
      : typeof raw?.id_venta === "number" && Number.isFinite(raw.id_venta)
        ? raw.id_venta
        : hashToStableNegativeInt(`${nombre}|${telefono ?? ""}|${total}|${abonado}|${saldo}|${idx}`);

  return {
    id,
    nombre,
    telefono,
    total,
    abonado,
    saldo,
    vendedor_id: typeof raw?.vendedor_id === "number" ? raw.vendedor_id : null,
    vendedor_color: typeof raw?.vendedor_color === "string" ? raw.vendedor_color : null,
    puesto: typeof raw?.puesto === "number" ? raw.puesto : null,
    puestos: Array.isArray(raw?.puestos) ? raw.puestos : undefined,
  };
}

function sanitizeNombre(v: string) {
  return v.replace(/\s+/g, " ").trim().slice(0, 80);
}

function sanitizeTelefono(v: string) {
  return v.replace(/[^0-9]/g, "").slice(0, 20);
}

function buildKey(filters: CarteraFilters) {
  const n = sanitizeNombre(filters.nombre);
  const t = sanitizeTelefono(filters.telefono);
  return `sorteo=vigente&nombre=${encodeURIComponent(n)}&telefono=${encodeURIComponent(t)}&debe=true`;
}

function buildPath(filters: CarteraFilters) {
  const params = new URLSearchParams();
  params.set("sorteo", "vigente");
  params.set("debe", "true");

  const nombre = sanitizeNombre(filters.nombre);
  const telefono = sanitizeTelefono(filters.telefono);

  if (nombre) params.set("nombre", nombre);
  if (telefono) params.set("telefono", telefono);

  return `/api/cartera?${params.toString()}`;
}

export function useCarteraQuery(filters: CarteraFilters) {
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    error: null,
    isOffline: false,
  });

  const [debounced, setDebounced] = useState(filters);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebounced(filters);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [filters]);

  const cacheKey = useMemo(() => buildKey(debounced), [debounced]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setState({ items: cached.data, loading: false, error: null, isOffline: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = buildPath(debounced);

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await apiGet<unknown>(path);
        const arr = Array.isArray(data) ? (data as any[]) : [];
        const normalized = arr.map((it, idx) => normalizeCarteraItem(it, idx));
        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ items: normalized, loading: false, error: null, isOffline: false });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando cartera");
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

    setState({ items: [], loading: false, error: lastError ?? "Error cargando cartera", isOffline: false });
  }, [cacheKey, debounced]);

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

  return {
    ...state,
    retry: fetchNow,
  };
}
