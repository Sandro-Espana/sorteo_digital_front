"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GaleriaFotoItem } from "@/lib/galeria";
import { API_BASE_URL } from "@/lib/api";

type State = {
  items: GaleriaFotoItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = { ts: number; data: GaleriaFotoItem[] };
const cache = new Map<string, CacheEntry>();
const STALE_MS = 15_000;

function normalize(raw: any, idx: number): GaleriaFotoItem {
  return {
    id_foto: typeof raw?.id === "number" ? raw.id : typeof raw?.id_foto === "number" ? raw.id_foto : idx + 1,
    url_foto: typeof raw?.url === "string" ? raw.url : typeof raw?.url_foto === "string" ? raw.url_foto : "",
    description: typeof raw?.description === "string" ? raw.description : null,
    nombre_archivo: typeof raw?.fileName === "string" ? raw.fileName : null,
    mime_type: typeof raw?.mimeType === "string" ? raw.mimeType : null,
    created_at: typeof raw?.createdAt === "string" ? raw.createdAt : null,
    tamano_kb: typeof raw?.sizeKb === "number" ? raw.sizeKb : null,
  };
}

export function useAlbumFromPublicGalleryQuery(idAlbum: number | null) {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null, isOffline: false });

  const cacheKey = useMemo(() => (idAlbum ? `public_album_${idAlbum}` : "public_album_null"), [idAlbum]);

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

    try {
      const res = await fetch(`${API_BASE_URL}/public/gallery`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.photos) ? (data as any).photos : [];

      const filtered = (arr as any[])
        .filter((p) => Number(p?.albumId) === idAlbum)
        .map((it, idx) => normalize(it, idx))
        .filter((f) => Boolean(f.url_foto));

      cache.set(cacheKey, { ts: Date.now(), data: filtered });
      setState({ items: filtered, loading: false, error: null, isOffline: false });
    } catch (e: any) {
      setState({ items: [], loading: false, error: String(e?.message ?? "Error"), isOffline: false });
    }
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
