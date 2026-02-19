"use client";

import { apiGet, SORTEO_ID } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type SorteoInfo = {
  id_sorteo: number;
  precio_boleta?: number | null;
  fecha_sorteo?: string | null;
  loteria_nombre?: string | null;
};

function formatDateOnly(input: string): string {
  const trimmed = input.trim();

  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m?.[1]) return m[1];

  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }

  return trimmed;
}

function moneyPlain(v: number | null | undefined) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `$ ${n.toLocaleString("es-CO")}`;
}

export function PuestosFooter() {
  const [lotteryNameText, setLotteryNameText] = useState<string>("");
  const [drawDateText, setDrawDateText] = useState<string>("");
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [, setCurrentSorteoId] = useState<number>(SORTEO_ID);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        let idSorteo = SORTEO_ID;
        try {
          const sorteos = await apiGet<unknown>("/api/sorteos");
          const arr = Array.isArray(sorteos)
            ? (sorteos as any[])
            : Array.isArray((sorteos as any)?.sorteos)
              ? (sorteos as any).sorteos
              : [];
          const activos = arr
            .filter((s: any) => String(s?.estado ?? "").toUpperCase() === "ACTIVO")
            .map((s: any) => Number(s?.id_sorteo ?? s?.id))
            .filter((n: any) => Number.isFinite(n) && n > 0)
            .sort((a: number, b: number) => b - a);
          if (activos.length) idSorteo = activos[0];
        } catch {}

        const data = await apiGet<SorteoInfo>(`/api/sorteos/${encodeURIComponent(String(idSorteo))}`);
        if (!alive) return;

        setCurrentSorteoId(idSorteo);

        setLotteryNameText(data?.loteria_nombre ?? "");
        setDrawDateText(data?.fecha_sorteo ? formatDateOnly(data.fecha_sorteo) : "");
        setTicketPrice(typeof data?.precio_boleta === "number" ? data.precio_boleta : null);
      } catch {
        if (!alive) return;
        setLotteryNameText("");
        setDrawDateText("");
        setTicketPrice(null);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const year = useMemo(() => {
    const d = new Date();
    return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
  }, []);

  return (
    <footer className="w-full">
      <div className="w-full bg-gradient-to-b from-[#001235] via-[#0A2C63] to-[#001a4a] px-3 pt-2 pb-2">
        <div className="flex items-center justify-center gap-4 text-[10px] text-white/90">
          <div className="flex flex-col items-center leading-tight">
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#FFD700]">Loteria:</div>
            <div className="font-semibold text-white">{lotteryNameText ? lotteryNameText : "Sin lotería"}</div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex flex-col items-center leading-tight">
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#FFD700]">Fecha</div>
            <div className="font-semibold text-white">{drawDateText || "-"}</div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex flex-col items-center leading-tight">
            <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#FFD700]">Precio</div>
            <div className="font-semibold text-white">{moneyPlain(ticketPrice)}</div>
          </div>
        </div>

        <div className="mt-2 h-px w-full bg-white/10" />

        <div className="mt-1 text-center text-[11px] text-white/85 font-semibold">
          Copyright © {year} | <span className="text-white font-bold">AZ 3 60</span>
        </div>
      </div>
    </footer>
  );
}
