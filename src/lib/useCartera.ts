"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { CarteraItem, CarteraQuery } from "@/lib/cartera";
import { carteraQueryToSearchParams } from "@/lib/cartera";

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("jwt")
  );
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
        const url = `${API_BASE_URL}/api/v1/cartera${qs ? `?${qs}` : ""}`;

        const token = getToken();
        const res = await fetch(url, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          let detail = "";
          try {
            const body: any = await res.json();
            detail = body?.detail ?? "";
          } catch {
            detail = "";
          }
          throw new Error(detail || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as unknown;
        setItems(Array.isArray(data) ? (data as CarteraItem[]) : []);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando cartera");
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
