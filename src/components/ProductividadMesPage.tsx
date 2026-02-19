"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProductividadMesQuery } from "@/lib/useProductividadMesQuery";

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

export function ProductividadMesPage({ anio, mes }: { anio: number; mes: number }) {
  const [filters, setFilters] = useState({ estado: "", vendedor: "" });
  const { mensual, loading, error, isOffline, retry } = useProductividadMesQuery(anio, mes, filters);

  const totals = useMemo(() => {
    const sorteos = mensual?.sorteos ?? [];
    const total_vendido = sorteos.reduce((a, s) => a + (Number.isFinite(s.total_vendido) ? s.total_vendido : 0), 0);
    const total_abonado = sorteos.reduce((a, s) => a + (Number.isFinite(s.total_abonado) ? s.total_abonado : 0), 0);
    const saldo_total = sorteos.reduce((a, s) => a + (Number.isFinite(s.saldo_total) ? s.saldo_total : 0), 0);
    const ocup = sorteos.length ? sorteos.reduce((a, s) => a + (Number.isFinite(s.ocupacion_porcentaje) ? s.ocupacion_porcentaje : 0), 0) / sorteos.length : 0;
    return { total_vendido, total_abonado, saldo_total, ocupacion_promedio: ocup };
  }, [mensual]);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-sm font-bold text-slate-900">Productividad</div>
          <div className="text-xs text-slate-600">{anio} / {String(mes).padStart(2, "0")}</div>
        </div>
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
          <div className="text-sm font-bold text-slate-900">{pct(totals.ocupacion_promedio)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <input
          value={filters.estado}
          onChange={(e) => setFilters((s) => ({ ...s, estado: e.target.value }))}
          placeholder="Estado"
          className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />
        <input
          value={filters.vendedor}
          onChange={(e) => setFilters((s) => ({ ...s, vendedor: e.target.value }))}
          placeholder="Vendedor"
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
      ) : !mensual?.sorteos?.length ? (
        <div className="w-full text-center text-sm text-slate-700 py-8">No hay sorteos para mostrar</div>
      ) : (
        <div className="w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="w-full table-fixed text-xs sm:text-sm border-collapse">
              <thead className="text-slate-700 sticky top-0 bg-white z-10">
                <tr className="border-b border-slate-200">
                  <th className="px-2 py-2 text-left font-semibold">Sorteo</th>
                  <th className="px-2 py-2 text-left font-semibold w-[84px]">Fecha</th>
                  <th className="px-2 py-2 text-left font-semibold w-[84px]">Estado</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Vendido</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Abonado</th>
                  <th className="px-2 py-2 text-right font-semibold w-[92px]">Saldo</th>
                  <th className="px-2 py-2 text-right font-semibold w-[84px]">% Ocu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mensual.sorteos.map((s) => (
                  <tr key={s.id_sorteo} className="hover:bg-slate-50">
                    <td className="px-2 py-2">
                      <Link href={`/productividad/sorteo/${s.id_sorteo}`} className="font-semibold text-slate-900 truncate block">
                        {s.sorteo}
                      </Link>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">{formatDate(s.fecha)}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{s.estado || "-"}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{money(s.total_vendido)}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{money(s.total_abonado)}</td>
                    <td className="px-2 py-2 text-right font-bold whitespace-nowrap">{money(s.saldo_total)}</td>
                    <td className="px-2 py-2 text-right font-semibold whitespace-nowrap">{pct(s.ocupacion_porcentaje)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mensual?.por_vendedor?.length ? (
        <div className="mt-4 w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">Productividad por vendedor</div>
          <div className="max-h-[50vh] overflow-auto">
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
                {mensual.por_vendedor.map((v, idx) => (
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
      ) : null}
    </div>
  );
}
