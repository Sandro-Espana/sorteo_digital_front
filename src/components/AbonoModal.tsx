"use client";

import { useEffect, useMemo, useState } from "react";
import type { Seat } from "@/lib/types";

export function AbonoModal({
  isOpen,
  onClose,
  seat,
  submitting,
  onRegistrarAbono,
}: {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  submitting: boolean;
  onRegistrarAbono: (monto: number) => void;
}) {
  const [monto, setMonto] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const canRegistrar = !!seat?.id_venta;

  const ventaPuestos = useMemo(() => {
    const raw = seat?.venta_puestos;
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return [...raw].sort((a, b) => a - b);
  }, [seat?.venta_puestos]);

  const totalVenta = useMemo(() => {
    if (!seat) return 0;
    if (typeof seat.total === "number") return seat.total;
    if (typeof seat.abonado === "number" && typeof seat.saldo === "number") {
      return Math.max(0, seat.abonado + seat.saldo);
    }
    return 0;
  }, [seat]);

  const abonadoPrevio = useMemo(() => {
    if (!seat) return 0;
    if (typeof seat.abonado === "number") return seat.abonado;
    if (typeof seat.total === "number" && typeof seat.saldo === "number") return Math.max(0, seat.total - seat.saldo);
    return 0;
  }, [seat]);

  const saldoActual = useMemo(() => {
    if (!seat) return 0;
    if (typeof seat.saldo === "number") return seat.saldo;
    if (typeof seat.total === "number" && typeof seat.abonado === "number") return Math.max(0, seat.total - seat.abonado);
    return 0;
  }, [seat]);

  useEffect(() => {
    if (!isOpen) return;
    setMonto("");
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  function submit() {
    const v = Number(monto.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(v) || v <= 0) {
      setError("Ingresa un abono válido.");
      return;
    }
    if (saldoActual > 0 && v > saldoActual) {
      setError("El abono no puede ser mayor al saldo.");
      return;
    }
    setError(null);
    onRegistrarAbono(v);
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-slate-900">Abonos</h2>
                {seat?.cliente_nombre && (
                  <div className="mt-0.5 text-xs font-medium text-slate-600">{seat.cliente_nombre}</div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Puestos:</span>
                {ventaPuestos ? (
                  <div className="flex flex-wrap justify-end gap-1">
                    {ventaPuestos.map((n) => {
                      const isCurrent = !!seat && n === seat.id;
                      return (
                        <span
                          key={n}
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold border",
                            isCurrent
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-700 border-slate-200",
                          ].join(" ")}
                        >
                          {String(n).padStart(2, "0")}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-blue-600">{seat ? String(seat.id).padStart(2, "0") : "-"}</span>
                )}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total venta:</span>
                  <span className="text-sm font-bold text-slate-900">${totalVenta.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Abonado venta:</span>
                  <span className="text-sm font-bold text-slate-900">${abonadoPrevio.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Saldo venta:</span>
                  <span className="text-sm font-bold text-green-700">${saldoActual.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            {!canRegistrar && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                No se encontró la venta asociada a este puesto (`id_venta`). El backend debe enviar `id_venta` en el endpoint de puestos para poder registrar abonos.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo abono</label>
              <input
                type="text"
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/[^0-9.,]/g, ""))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="0"
              />
              {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !canRegistrar}
              className={[
                "w-full rounded-lg px-4 py-3 text-sm font-bold transition-colors",
                submitting || !canRegistrar
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700",
              ].join(" ")}
            >
              {submitting ? "Registrando..." : "Registrar abono"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
