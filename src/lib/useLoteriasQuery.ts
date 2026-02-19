"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

export type LoteriaItem = {
  id: number;
  nombre: string;
};

type State = {
  items: LoteriaItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: LoteriaItem[] };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

function normalizeItem(raw: any, idx: number): LoteriaItem {
  const id = typeof raw?.id === "number" ? raw.id : Number(raw?.id) || idx + 1;
  const nombre = typeof raw?.nombre === "string" ? raw.nombre : `Lotería ${id}`;
  return { id, nombre };
}

export function useLoteriasQuery() {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => "loterias", []);

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

    const path = "/api/sorteos/loterias";

    try {
      const raw = await apiGet<any>(path);
      const arr = Array.isArray(raw) ? raw : [];
      const normalized = arr.map((r, idx) => normalizeItem(r, idx)).sort((a, b) => a.nombre.localeCompare(b.nombre));
      cache.set(cacheKey, { ts: Date.now(), data: normalized });
      setState({ items: normalized, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando loterías");
      if (msg.includes("401")) {
        clearToken();
        if (typeof window !== "undefined") window.location.assign("/login");
        return;
      }
      setState({ items: [], loading: false, error: msg, isOffline: false });
    }
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

  return { ...state, retry: fetchNow, invalidate: () => cache.delete(cacheKey) };
}
