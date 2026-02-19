"use client";

import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

export type CarteleraFoto = {
  id: string;
  url_imagen: string;
  fecha_subida?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  nombre_archivo?: string | null;
};

export type CarteleraOut = {
  fotos: CarteleraFoto[];
  total: number;
  cache_expires_in?: number;
};

type State = {
  data: CarteleraOut | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: CarteleraOut };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 5 * 60_000;

function normalize(raw: any): CarteleraOut {
  const fotosRaw = Array.isArray(raw?.fotos) ? raw.fotos : [];
  const fotos: CarteleraFoto[] = fotosRaw
    .map((f: any) => {
      const url_imagen = String(f?.url_imagen ?? "").trim();
      const id = String(f?.id ?? "").trim();
      if (!url_imagen || !id) return null;
      return {
        id,
        url_imagen,
        fecha_subida: f?.fecha_subida ?? null,
        titulo: f?.titulo ?? null,
        descripcion: f?.descripcion ?? null,
        nombre_archivo: f?.nombre_archivo ?? null,
      };
    })
    .filter(Boolean) as CarteleraFoto[];

  return {
    fotos,
    total: Number(raw?.total) || fotos.length,
    cache_expires_in: typeof raw?.cache_expires_in === "number" ? raw.cache_expires_in : undefined,
  };
}

export function useCarteleraQuery() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => "ganadores:cartelera", []);

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

    try {
      const raw = await apiGet<any>("/api/ganadores/cartelera");
      const data = normalize(raw);
      cache.set(cacheKey, { ts: Date.now(), data });
      setState({ data, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      const msg = String(e?.message ?? "Error cargando cartelera");
      if (msg.includes("401")) {
        clearToken();
        if (typeof window !== "undefined") window.location.assign("/login");
        return;
      }
      setState({ data: null, loading: false, error: msg, isOffline: false });
    }
  }, [cacheKey]);

  useEffect(() => {
    setState((s) => ({ ...s, isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false }));
    fetchNow();
  }, [fetchNow]);

  return { ...state, retry: fetchNow, invalidate: () => cache.delete(cacheKey) };
}
