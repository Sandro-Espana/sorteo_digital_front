"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import type { GastoItem } from "@/lib/gastos";

type State = {
  items: GastoItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
};

type CacheEntry = {
  ts: number;
  data: GastoItem[];
};

const cache = new Map<string, CacheEntry>();
const STALE_MS = 30_000;

export type GastosRango = "dia" | "semana" | "mes";

export type GastosQuery = {
  rango: GastosRango;
  concepto: string;
};

function hashToStableNegativeInt(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  if (h === 0) h = 1;
  return -Math.abs(h);
}

function normalizeGastoItem(raw: any, idx: number): GastoItem {
  const concepto = typeof raw?.concepto === "string" ? raw.concepto : "";
  const valor = typeof raw?.valor === "number" ? raw.valor : Number(raw?.valor ?? 0) || 0;

  const created_at =
    typeof raw?.created_at === "string"
      ? raw.created_at
      : typeof raw?.fecha === "string"
        ? raw.fecha
        : null;

  const usuario_id =
    typeof raw?.usuario_id === "number"
      ? raw.usuario_id
      : typeof raw?.id_usuario === "number"
        ? raw.id_usuario
        : null;

  const usuario_nombre =
    typeof raw?.usuario_nombre === "string"
      ? raw.usuario_nombre
      : typeof raw?.nombre_usuario === "string"
        ? raw.nombre_usuario
        : typeof raw?.usuario === "string"
          ? raw.usuario
          : null;

  const id_gasto =
    typeof raw?.id_gasto === "number" && Number.isFinite(raw.id_gasto)
      ? raw.id_gasto
      : typeof raw?.id === "number" && Number.isFinite(raw.id)
        ? raw.id
        : hashToStableNegativeInt(`${created_at ?? ""}|${concepto}|${valor}|${usuario_id ?? ""}|${idx}`);

  return {
    id_gasto,
    concepto,
    valor,
    observacion: typeof raw?.observacion === "string" ? raw.observacion : raw?.observacion ?? null,
    usuario_id,
    usuario_nombre,
    created_at,
  };
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildPath(rango: GastosRango) {
  const now = new Date();
  const today = startOfDay(now);

  let start: Date;
  let end: Date;

  if (rango === "dia") {
    start = today;
    end = today;
  } else if (rango === "semana") {
    // Semana calendario (lunes -> hoy). Si hoy es domingo, lunes -> domingo.
    // JS: getDay() => 0 domingo, 1 lunes, ..., 6 sábado
    const dow = today.getDay();
    const diffFromMonday = (dow + 6) % 7; // lunes=0, martes=1, ..., domingo=6
    start = new Date(today);
    start.setDate(start.getDate() - diffFromMonday);
    end = today;
  } else {
    // Mes actual (del 1 al día de hoy)
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = today;
  }

  const params = new URLSearchParams();
  params.set("fecha_inicio", toYmd(start));
  params.set("fecha_fin", toYmd(end));
  return `/api/gastos?${params.toString()}`;
}

function sanitizeConcepto(v: string) {
  return v.replace(/\s+/g, " ").trim().slice(0, 80);
}

function applyClientSideConceptFilter(items: GastoItem[], concepto: string) {
  const q = sanitizeConcepto(concepto).toLowerCase();
  if (!q) return items;
  return items.filter((it) => {
    const c = (it.concepto ?? "").toLowerCase();
    const o = (it.observacion ?? "").toString().toLowerCase();
    return c.includes(q) || o.includes(q);
  });
}

export function useGastosQuery(query: GastosQuery) {
  const [state, setState] = useState<State>({
    items: [],
    loading: true,
    error: null,
    isOffline: false,
  });

  const [debouncedConcepto, setDebouncedConcepto] = useState(query.concepto);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedConcepto(query.concepto);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query.concepto]);

  const cacheKey = useMemo(() => `gastos:${query.rango}`, [query.rango]);

  const fetchNow = useCallback(async () => {
    const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
    if (isOffline) {
      setState((s) => ({ ...s, loading: false, error: null, isOffline: true }));
      return;
    }

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setState({
        items: applyClientSideConceptFilter(cached.data, debouncedConcepto),
        loading: false,
        error: null,
        isOffline: false,
      });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, isOffline: false }));

    const path = buildPath(query.rango);

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const data = await apiGet<unknown>(path);
        const arr = Array.isArray(data) ? (data as any[]) : [];
        const normalized = arr.map((it, idx) => normalizeGastoItem(it, idx));
        cache.set(cacheKey, { ts: Date.now(), data: normalized });
        setState({
          items: applyClientSideConceptFilter(normalized, debouncedConcepto),
          loading: false,
          error: null,
          isOffline: false,
        });
        return;
      } catch (e: any) {
        const msg = String(e?.message ?? "Error cargando gastos");
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

    setState({ items: [], loading: false, error: lastError ?? "Error cargando gastos", isOffline: false });
  }, [cacheKey, debouncedConcepto, query.rango]);

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
    invalidate: () => {
      cache.delete(cacheKey);
    },
  };
}
