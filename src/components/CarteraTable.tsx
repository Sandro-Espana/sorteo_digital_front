"use client";

import { useMemo } from "react";
import type { CarteraItem } from "@/lib/cartera";

function money(v: unknown) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `$ ${n.toLocaleString("es-CO")}`;
}

function styleFor(item: CarteraItem): React.CSSProperties | undefined {
  const c = item.vendedor_color;
  if (typeof c === "string" && c.trim()) return { backgroundColor: c.trim() };
  return undefined;
}

export function CarteraTable({
  items,
  loading,
  error,
}: {
  items: CarteraItem[];
  loading: boolean;
  error: string | null;
}) {
  const rows = useMemo(() => items ?? [], [items]);

  if (loading) {
    return (
      <div className="w-full text-sm text-slate-700">Cargando cartera...</div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-sm text-red-700">{error}</div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="w-full text-center text-sm text-slate-700 py-8">No hay registros en el sorteo vigente</div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full table-fixed text-xs sm:text-sm border-collapse">
        <thead className="text-slate-700">
          <tr className="border-b border-slate-200">
            <th className="px-2 py-2 text-left font-semibold w-[44px]">P</th>
            <th className="px-2 py-2 text-left font-semibold">Nombre</th>
            <th className="px-2 py-2 text-left font-semibold w-[92px]">Tel</th>
            <th className="px-2 py-2 text-right font-semibold w-[84px]">Total</th>
            <th className="px-2 py-2 text-right font-semibold w-[84px]">Abon</th>
            <th className="px-2 py-2 text-right font-semibold w-[84px]">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((it) => {
            const puesto =
              typeof it.puesto === "number"
                ? it.puesto
                : Array.isArray(it.puestos) && it.puestos.length > 0
                  ? it.puestos[0]
                  : null;

            return (
              <tr key={it.id_venta} style={styleFor(it)}>
                <td className="px-2 py-2 font-bold text-slate-900 whitespace-nowrap">
                  {puesto === null ? "" : String(puesto).padStart(2, "0")}
                </td>
                <td className="px-2 py-2">
                  <div className="text-slate-900 font-semibold truncate">{it.cliente_nombre}</div>
                </td>
                <td className="px-2 py-2 text-slate-800">
                  <div className="truncate text-[11px] sm:text-sm">{it.cliente_telefono ?? ""}</div>
                </td>
                <td className="px-2 py-2 text-right font-semibold text-slate-900 whitespace-nowrap">{money(it.total)}</td>
                <td className="px-2 py-2 text-right font-semibold text-slate-900 whitespace-nowrap">{money(it.abonado)}</td>
                <td className="px-2 py-2 text-right font-bold text-slate-900 whitespace-nowrap">{money(it.saldo)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
