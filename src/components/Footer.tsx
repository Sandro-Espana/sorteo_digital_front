"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, SORTEO_ID } from "@/lib/api";

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

export function Footer() {
  const [lotteryNameText, setLotteryNameText] = useState<string>("");
  const [drawDateText, setDrawDateText] = useState<string>("");
  const [ticketPriceText, setTicketPriceText] = useState<string>("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await apiGet<SorteoInfo>(`/api/v1/sorteos/${SORTEO_ID}`);
        if (!alive) return;

        setLotteryNameText(data?.loteria_nombre ?? "");

        const rawDate = data?.fecha_sorteo ? formatDateOnly(data.fecha_sorteo) : "";
        setDrawDateText(rawDate);

        const precio = typeof data?.precio_boleta === "number" ? data.precio_boleta : null;
        setTicketPriceText(precio != null ? `$ ${precio.toLocaleString("es-CO")}` : "");
      } catch {
        if (!alive) return;
        setLotteryNameText("");
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const formattedDrawDate = useMemo(() => {
    const raw = drawDateText;
    if (!raw) return raw;

    const isoMatch = /^\d{4}-\d{2}-\d{2}/.test(raw);
    const date = isoMatch ? new Date(`${raw}T00:00:00`) : new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;

    const parts = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).formatToParts(date);

    const weekday = (parts.find((p) => p.type === "weekday")?.value ?? "").trim();
    const day = (parts.find((p) => p.type === "day")?.value ?? "").trim();
    const month = (parts.find((p) => p.type === "month")?.value ?? "").trim();

    const capWeekday = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : weekday;
    if (!capWeekday || !day || !month) return raw;

    return `${capWeekday} · ${day} de ${month}`;
  }, [drawDateText]);

  return (
    <footer className="relative bg-[#001f5c] pt-1 pb-1">
      
      <div className="max-w-md mx-auto px-3">
        
        {/* INFO PRINCIPAL (más compacta) */}
        <div className="flex items-center justify-center gap-x-3 text-[11px] tracking-wide text-white">
          
          <div className="flex flex-col items-center leading-tight">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase text-[#FFD700] font-bold tracking-[0.1em]">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
                <path d="M7 13h10" />
              </svg>
              Loteria:
            </span>
            <span className="font-medium text-white">
              {lotteryNameText ? lotteryNameText : "Sin lotería"}
            </span>
          </div>

          <div className="w-[1px] h-5 bg-white/10" />

          <div className="flex flex-col items-center leading-tight">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase text-[#FFD700] font-bold tracking-[0.1em]">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
              Fecha
            </span>
            <span className="font-medium text-white">
              {formattedDrawDate}
            </span>
          </div>

          <div className="w-[1px] h-5 bg-white/10" />

          <div className="flex flex-col items-center leading-tight">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase text-[#FFD700] font-bold tracking-[0.1em]">
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Precio
            </span>
            <span className="font-medium text-white">
              {ticketPriceText}
            </span>
          </div>
        </div>

        {/* Separador reducido */}
        <div className="my-1.5 h-[1px] bg-white/10 w-full" />

        {/* Legal más compacto */}
        <div className="space-y-1 text-center">
          <p className="mb-1 text-[11px] text-white/85 font-semibold">
            Copyright © <span className="text-white font-bold">Inversiones Gasca</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
