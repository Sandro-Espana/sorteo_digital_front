"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import type { CarteraItem, CarteraQuery } from "@/lib/cartera";
import { carteraQueryToSearchParams } from "@/lib/cartera";

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
  const nombre =
    typeof raw?.cliente_nombre === "string"
      ? raw.cliente_nombre
      : typeof raw?.nombre === "string"
        ? raw.nombre
        : "";

  const telefono =
    typeof raw?.cliente_telefono === "string"
      ? raw.cliente_telefono
      : typeof raw?.telefono === "string"
        ? raw.telefono
        : null;

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

  const idVenta =
    typeof raw?.id_venta === "number" && Number.isFinite(raw.id_venta)
      ? raw.id_venta
      : hashToStableNegativeInt(`${nombre}|${telefono ?? ""}|${total}|${abonado}|${saldo}|${idx}`);

  return {
    id_venta: idVenta,
    puesto: typeof raw?.puesto === "number" ? raw.puesto : null,
    puestos: Array.isArray(raw?.puestos) ? raw.puestos : undefined,
    cliente_nombre: nombre,
    cliente_telefono: telefono,
    total,
    abonado,
    saldo,
    vendedor_id: typeof raw?.vendedor_id === "number" ? raw.vendedor_id : null,
    vendedor_color: typeof raw?.vendedor_color === "string" ? raw.vendedor_color : null,
  };
}

export function useCartera() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [soloDeuda, setSoloDeuda] = useState(false);

  const [items, setItems] = useState<CarteraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const query: CarteraQuery = useMemo(() => {
    return {
      nombre: nombre.trim() ? nombre.trim() : undefined,
      telefono: telefono.trim() ? telefono.trim() : undefined,
      debe: soloDeuda ? true : undefined,
    };
  }, [nombre, telefono, soloDeuda]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = carteraQueryToSearchParams(query);
        const qs = params.toString();
        const path = `/api/cartera${qs ? `?${qs}` : ""}`;
        const data = await apiGet<unknown>(path);

        if (!Array.isArray(data)) {
          setItems([]);
          return;
        }

        const normalized = (data as any[]).map((it, idx) => normalizeCarteraItem(it, idx));
        setItems(normalized);
      } catch (e: any) {
        const raw = String(e?.message ?? "");
        const msg = raw.includes("401")
          ? "No autorizado (401). Inicia sesión para ver la cartera."
          : raw || "Error cargando cartera";
        setError(msg);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return {
    filters: { nombre, telefono, soloDeuda },
    setNombre,
    setTelefono,
    setSoloDeuda,
    items,
    loading,
    error,
  };
}
