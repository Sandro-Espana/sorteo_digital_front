"use client";

import type { GastoItem } from "@/lib/gastos";

function money(v: number) {
  const n = Number.isFinite(v) ? v : 0;
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function formatDate(v: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v.slice(0, 10);
  return d.toLocaleDateString("es-CO", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

const userBadges = [
  "bg-blue-100 text-blue-900 border-blue-200",
  "bg-emerald-100 text-emerald-900 border-emerald-200",
  "bg-amber-100 text-amber-900 border-amber-200",
  "bg-purple-100 text-purple-900 border-purple-200",
  "bg-rose-100 text-rose-900 border-rose-200",
  "bg-cyan-100 text-cyan-900 border-cyan-200",
];

function userBadgeClass(usuarioId: number | null) {
  if (usuarioId === null) return "bg-slate-100 text-slate-900 border-slate-200";
  const idx = Math.abs(usuarioId) % userBadges.length;
  return userBadges[idx];
}

function userLabel(it: GastoItem) {
  const name = typeof it.usuario_nombre === "string" ? it.usuario_nombre.trim() : "";
  if (name) return name;
  if (it.usuario_id != null) return String(it.usuario_id);
  return "-";
}

export function GastosTable({
  items,
  loading,
  error,
}: {
  items: GastoItem[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="w-full rounded-lg border border-slate-200 bg-white">
        <div className="p-4">
          <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-56 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-44 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return <div className="w-full text-center text-sm text-slate-700 py-8">No hay gastos para mostrar</div>;
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full table-fixed text-xs sm:text-sm border-collapse">
          <thead className="text-slate-700 sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-200">
              <th className="px-2 py-2 text-left font-semibold w-[84px]">Fecha</th>
              <th className="px-2 py-2 text-left font-semibold">Concepto</th>
              <th className="px-2 py-2 text-right font-semibold w-[96px]">Valor</th>
              <th className="px-2 py-2 text-right font-semibold w-[88px]">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((it) => (
              <tr key={it.id_gasto} className="hover:bg-slate-50">
                <td className="px-2 py-2 font-semibold text-slate-900 whitespace-nowrap">{formatDate(it.created_at)}</td>
                <td className="px-2 py-2">
                  <div className="text-slate-900 font-semibold truncate">{it.concepto || "-"}</div>
                  {it.observacion ? (
                    <div className="text-[11px] text-slate-600 truncate">{it.observacion}</div>
                  ) : null}
                </td>
                <td className="px-2 py-2 text-right font-bold text-slate-900 whitespace-nowrap">{money(it.valor)}</td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center h-6 px-2 rounded-full border text-[11px] font-bold ${userBadgeClass(it.usuario_id)}`}>
                    {userLabel(it)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
