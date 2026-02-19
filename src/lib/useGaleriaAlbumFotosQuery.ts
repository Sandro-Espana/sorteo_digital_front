"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { GaleriaFotoItem } from "@/lib/galeria";

type State = {
  items: GaleriaFotoItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: GaleriaFotoItem[] };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 15_000;

function normalizeFoto(raw: any, idx: number): GaleriaFotoItem {
  const url = typeof raw?.url === "string" ? raw.url : typeof raw?.url_foto === "string" ? raw.url_foto : "";
  return {
    id_foto: typeof raw?.id_foto === "number" ? raw.id_foto : typeof raw?.id === "number" ? raw.id : idx + 1,
    url_foto: url,
    description: typeof raw?.description === "string" ? raw.description : null,
    nombre_archivo: typeof raw?.nombre_archivo === "string" ? raw.nombre_archivo : null,
    mime_type: typeof raw?.mime_type === "string" ? raw.mime_type : null,
    created_at: typeof raw?.created_at === "string" ? raw.created_at : null,
    tamano_kb:
      typeof raw?.tamano_kb === "number"
        ? raw.tamano_kb
        : typeof raw?.["tamaño_kb"] === "number"
          ? raw["tamaño_kb"]
          : null,
  };
}

export function useGaleriaAlbumFotosQuery(idAlbum: number | null) {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => (idAlbum ? `galeria_album_${idAlbum}_fotos` : "galeria_album_null"), [idAlbum]);

  const fetchNow = useCallback(async () => {
    if (!idAlbum) {
      setState({ items: [], loading: false, error: "Álbum inválido", isOffline: false });
      return;
    }

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

        const filtered = (arr as any[])
          .filter((p) => Number(p?.albumId) === idAlbum)
          .map((it, idx) => normalizeFoto(it, idx))
          .filter((f) => Boolean(f.url_foto));

        const normalized = filtered;
        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({ items: normalized, loading: false, error: null, isOffline: false });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando fotos");
        lastError = msg;

        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
      }
    }

    setState({ items: [], loading: false, error: lastError ?? "Error cargando fotos", isOffline: false });
  }, [cacheKey, idAlbum]);

  useEffect(() => {
    setState((s) => ({ ...s, isOffline: typeof navigator !== "undefined" ? !navigator.onLine : false }));
    fetchNow();
  }, [fetchNow]);

  return {
    ...state,
    retry: fetchNow,
    invalidate: () => cache.delete(cacheKey),
  };
}
