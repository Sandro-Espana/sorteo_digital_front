"use client";

import { useMemo, useState } from "react";
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

function rowClassFor(item: CarteraItem): string {
  if (typeof item.vendedor_color === "string" && item.vendedor_color.trim()) return "";
  const id = item.vendedor_id;
  if (typeof id !== "number" || !Number.isFinite(id)) return "";
  const palette = ["bg-blue-100", "bg-green-100", "bg-amber-100", "bg-purple-100"] as const;
  return palette[Math.abs(Math.trunc(id)) % palette.length] ?? "";
}

function SkeletonTable() {
  return (
    <div className="w-full overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="animate-pulse">
        <div className="border-b border-slate-200 px-2 py-2">
          <div className="h-3 w-40 rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-200">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 px-2 py-2">
              <div className="h-3 rounded bg-slate-200" />
              <div className="col-span-2 h-3 rounded bg-slate-200" />
              <div className="h-3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RowDetailsModal({
  item,
  onClose,
}: {
  item: CarteraItem;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">{item.nombre}</div>
              <div className="mt-0.5 text-xs text-slate-600">Detalle de cartera</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="px-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <div className="text-xs font-semibold text-slate-600">Teléfono</div>
                <div className="mt-0.5 font-semibold text-slate-900 break-words">{item.telefono ?? ""}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Puesto</div>
                <div className="mt-0.5 font-bold text-slate-900">
                  {typeof item.puesto === "number" && Number.isFinite(item.puesto)
                    ? String(item.puesto).padStart(2, "0")
                    : "-"}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Saldo</div>
                <div className="mt-0.5 font-bold text-slate-900">{money(item.saldo)}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Total</div>
                <div className="mt-0.5 font-bold text-slate-900">{money(item.total)}</div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Abonado</div>
                <div className="mt-0.5 font-bold text-slate-900">{money(item.abonado)}</div>
              </div>
            </div>

            {Array.isArray(item.puestos) && item.puestos.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-600">Puestos</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {[...item.puestos]
                    .filter((n) => typeof n === "number" && Number.isFinite(n))
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800"
                      >
                        {String(n).padStart(2, "0")}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
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
  const [selected, setSelected] = useState<CarteraItem | null>(null);

  if (loading) {
    return <SkeletonTable />;
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
            <th className="px-2 py-2 text-left font-semibold w-[72px]">Puesto</th>
            <th className="px-2 py-2 text-left font-semibold">Nombre</th>
            <th className="px-2 py-2 text-right font-semibold w-[84px]">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((it, idx) => {
            const puesto =
              typeof it.puesto === "number"
                ? it.puesto
                : Array.isArray(it.puestos) && it.puestos.length > 0
                  ? it.puestos[0]
                  : null;

            const rowKey = Number.isFinite(it.id) ? `cartera-${it.id}` : `cartera-${it.nombre}-${it.telefono ?? ""}-${idx}`;
            const rowClass = rowClassFor(it);
            const inlineStyle = rowClass ? undefined : styleFor(it);

            return (
              <tr
                key={rowKey}
                className={rowClass}
                style={inlineStyle}
                onClick={() => setSelected(it)}
              >
                <td className="px-2 py-2 font-bold text-slate-900 whitespace-nowrap">
                  {puesto === null ? "-" : String(puesto).padStart(2, "0")}
                </td>
                <td className="px-2 py-2 font-semibold text-slate-900 truncate">{it.nombre}</td>
                <td className="px-2 py-2 text-right font-bold text-slate-900 whitespace-nowrap">{money(it.saldo)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selected && <RowDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
