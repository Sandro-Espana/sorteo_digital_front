"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type { SorteoListItem } from "@/lib/sorteos";

type State = {
  items: SorteoListItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: SorteoListItem[] };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function moneyNumber(v: any): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeSorteo(raw: any, idx: number): SorteoListItem {
  const id_sorteo =
    typeof raw?.id_sorteo === "number"
      ? raw.id_sorteo
      : typeof raw?.id === "number"
        ? raw.id
        : idx + 1;

  return {
    id_sorteo,
    nombre: typeof raw?.nombre === "string" ? raw.nombre : `Sorteo ${id_sorteo}`,
    estado: typeof raw?.estado === "string" ? raw.estado : "",
    fecha_hora_sorteo:
      typeof raw?.fecha_hora_sorteo === "string"
        ? raw.fecha_hora_sorteo
        : typeof raw?.fecha_sorteo === "string"
          ? raw.fecha_sorteo
          : null,
    total_boletas: typeof raw?.total_boletas === "number" ? raw.total_boletas : Number(raw?.total_boletas ?? raw?.boletas_total ?? 0) || null,
    oportunidades_por_boleta:
      typeof raw?.oportunidades_por_boleta === "number"
        ? raw.oportunidades_por_boleta
        : Number(raw?.oportunidades_por_boleta ?? 0) || null,
    precio_boleta:
      typeof raw?.precio_boleta === "number"
        ? raw.precio_boleta
        : moneyNumber(raw?.precio_boleta) || null,
    loteria_id: typeof raw?.loteria_id === "number" ? raw.loteria_id : null,
  };
}

export function useSorteosQuery() {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null, isOffline: false });
  const cacheKey = useMemo(() => "sorteos", []);

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

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await apiGet<unknown>("/api/sorteos");
        const arr = Array.isArray(data) ? (data as any[]) : Array.isArray((data as any)?.sorteos) ? (data as any).sorteos : [];
        const normalized = arr.map((it, idx) => normalizeSorteo(it, idx));
        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ items: normalized, loading: false, error: null, isOffline: false });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando sorteos");
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

    setState({ items: [], loading: false, error: lastError ?? "Error cargando sorteos", isOffline: false });
  }, [cacheKey]);

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
    invalidate: () => cache.delete(cacheKey),
  };
}
