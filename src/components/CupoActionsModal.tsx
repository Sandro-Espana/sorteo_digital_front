"use client";

import { useEffect, useMemo, useState } from "react";
import type { Seat } from "@/lib/types";

export function CupoActionsModal({
  isOpen,
  onClose,
  seat,
  onOpenAbono,
  onLiberarCupo,
  submitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  onOpenAbono: () => void;
  onLiberarCupo: () => void;
  submitting: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

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

  const telefono = useMemo(() => {
    const s: any = seat as any;
    return typeof s?.cliente_celular === "string" && s.cliente_celular.trim() ? s.cliente_celular.trim() : null;
  }, [seat]);

  useEffect(() => {
    if (!isOpen) return;
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

  function handleLiberar() {
    if (!seat?.id_venta) {
      setError("No se encontró la venta asociada a este puesto.");
      return;
    }

    if (!(saldoActual > 0)) {
      setError("No se puede liberar un cupo totalmente cancelado.");
      return;
    }

    const ok = window.confirm(
      "¿Está seguro de liberar este cupo?\nEsta acción eliminará el registro de venta."
    );
    if (!ok) return;

    setError(null);
    onLiberarCupo();
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-slate-900">Puesto: #{seat ? String(seat.id).padStart(2, "0") : "-"}</h2>
                {seat?.cliente_nombre && (
                  <div className="mt-0.5 text-xs font-medium text-slate-600">Cliente: {seat.cliente_nombre}</div>
                )}
                {telefono && (
                  <div className="mt-0.5 text-xs font-medium text-slate-600">Tel: {telefono}</div>
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
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total:</span>
                  <span className="text-sm font-bold text-slate-900">${totalVenta.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Abonado:</span>
                  <span className="text-sm font-bold text-slate-900">${abonadoPrevio.toLocaleString("es-CO")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Saldo:</span>
                  <span className="text-sm font-bold text-green-700">${saldoActual.toLocaleString("es-CO")}</span>
                </div>
              </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenAbono}
                disabled={submitting || !seat?.id_venta}
                className={[
                  "w-full rounded-lg px-4 py-3 text-sm font-bold transition-colors",
                  submitting || !seat?.id_venta
                    ? "bg-blue-300 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700",
                ].join(" ")}
              >
                Registrar Abono
              </button>

              {saldoActual > 0 && (
                <button
                  type="button"
                  onClick={handleLiberar}
                  disabled={submitting}
                  className={[
                    "w-full rounded-lg px-4 py-3 text-sm font-bold transition-colors",
                    submitting
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-amber-600 text-white hover:bg-amber-700",
                  ].join(" ")}
                >
                  Liberar Cupo
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg px-4 py-3 text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
