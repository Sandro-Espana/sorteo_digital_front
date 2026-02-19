"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { GaleriaAnioItem } from "@/lib/galeria";

type State = {
  items: GaleriaAnioItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: GaleriaAnioItem[] };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function yearFromCreatedAt(createdAt: any): number | null {
  if (typeof createdAt !== "string") return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear();
}

export function useGaleriaAniosQuery() {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null, isOffline: false });
  const cacheKey = useMemo(() => "galeria_anios", []);

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
        const res = await fetch(`${API_BASE_URL}/public/gallery`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.photos) ? (data as any).photos : [];

        const map = new Map<number, number>();
        for (const p of arr as any[]) {
          const y = yearFromCreatedAt(p?.createdAt ?? p?.created_at);
          if (!y) continue;
          map.set(y, (map.get(y) ?? 0) + 1);
        }

        const normalized = Array.from(map.entries())
          .map(([anio, total_fotos]) => ({ anio, total_fotos }))
          .sort((a, b) => b.anio - a.anio);

        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ items: normalized, loading: false, error: null, isOffline: false });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando años");
        lastError = msg;

        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
      }
    }

    setState({ items: [], loading: false, error: lastError ?? "Error cargando años", isOffline: false });
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
