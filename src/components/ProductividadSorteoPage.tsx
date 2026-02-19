"use client";

import { useMemo, useState } from "react";
import { useProductividadSorteoQuery } from "@/lib/useProductividadSorteoQuery";

function money(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function pct(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return `${n.toFixed(1)}%`;
}

function formatDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 10);
  return d.toLocaleDateString("es-CO", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

export function ProductividadSorteoPage({ idSorteo }: { idSorteo: number }) {
  const [filters, setFilters] = useState({ vendedor: "" });
  const { detalle, loading, error, isOffline, retry } = useProductividadSorteoQuery(idSorteo, filters);

  const totals = useMemo(() => {
    if (!detalle) return { total_vendido: 0, total_abonado: 0, saldo_total: 0 };
    return { total_vendido: detalle.total_vendido, total_abonado: detalle.total_abonado, saldo_total: detalle.saldo_total };
  }, [detalle]);

  return (
    <div className="w-full">
      <div className="mb-2">
        <div className="text-sm font-bold text-slate-900">{detalle?.sorteo ?? "Productividad"}</div>
        <div className="text-xs text-slate-600">{formatDate(detalle?.fecha ?? null)} {detalle?.estado ? `· ${detalle.estado}` : ""}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[11px] text-slate-600">Total vendido</div>
          <div className="text-sm font-bold text-slate-900">{money(totals.total_vendido)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[11px] text-slate-600">Total abonado</div>
          <div className="text-sm font-bold text-slate-900">{money(totals.total_abonado)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[11px] text-slate-600">Saldo</div>
          <div className="text-sm font-bold text-slate-900">{money(totals.saldo_total)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[11px] text-slate-600">% ocupación</div>
          <div className="text-sm font-bold text-slate-900">{pct(detalle?.ocupacion_porcentaje ?? 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <input
          value={filters.vendedor}
          onChange={(e) => setFilters({ vendedor: e.target.value })}
          placeholder="Filtrar vendedor"
          className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {isOffline && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Sin conexión. Revisa tu internet.
        </div>
      )}

      {error && !loading && (
        <div className="mb-2">
          <button
            type="button"
            onClick={retry}
            className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="w-full rounded-lg border border-slate-200 bg-white">
          <div className="p-4">
            <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-56 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-44 bg-slate-200 rounded" />
          </div>
        </div>
      ) : !detalle?.por_vendedor?.length ? (
        <div className="w-full text-center text-sm text-slate-700 py-8">No hay datos por vendedor</div>
      ) : (
        <div className="w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full table-fixed text-xs sm:text-sm border-collapse">
              <thead className="text-slate-700 sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="px-2 py-2 text-left font-semibold">Vendedor</th>
                  <th className="px-2 py-2 text-right font-semibold w-[70px]">Ventas</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Vendido</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Cobrado</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Saldo</th>
                  <th className="px-2 py-2 text-right font-semibold w-[84px]">% Efec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {detalle.por_vendedor.map((v, idx) => (
                  <tr key={v.vendedor_id ?? idx} className="hover:bg-slate-50">
                    <td className="px-2 py-2 font-semibold text-slate-900 truncate">{v.vendedor}</td>
                    <td className="px-2 py-2 text-right whitespace-nowrap">{v.ventas_realizadas}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{money(v.total_vendido)}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{money(v.total_cobrado)}</td>
                    <td className="px-2 py-2 text-right font-bold whitespace-nowrap">{money(v.saldo_total)}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{pct(v.efectividad_porcentaje)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
