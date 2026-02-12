"use client";

import { useEffect, useMemo, useState } from "react";
import type { Seat } from "@/lib/types";

export type VentaResumenOut = {
  id_venta: number;
  id_sorteo: number;
  estado: string;
  total: number;
  abonado: number;
  saldo: number;
  cliente_nombre?: string | null;
  cliente_celular?: string | null;
};

export function SeatContextModal({
  isOpen,
  onClose,
  seat,
  submitting,
  loadResumen,
  onLiberarCupo,
}: {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  submitting: boolean;
  loadResumen: (id_venta: number) => Promise<VentaResumenOut>;
  onLiberarCupo: () => void;
}) {
  const [resumen, setResumen] = useState<VentaResumenOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const idVenta = seat?.id_venta ?? null;

  const canLiberar = useMemo(() => {
    return typeof resumen?.saldo === "number" && resumen.saldo > 0;
  }, [resumen?.saldo]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      setIsConfirmOpen(false);
      return;
    }

    setMounted(true);
    requestAnimationFrame(() => setVisible(true));

    setError(null);
    setResumen(null);

    if (!idVenta) {
      setError("No se encontró la venta asociada a este puesto.");
      return;
    }

    let alive = true;
    loadResumen(idVenta)
      .then((r) => {
        if (!alive) return;
        setResumen(r);
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar la información de la venta");
      });

    return () => {
      alive = false;
    };
  }, [isOpen, idVenta, loadResumen]);

  function requestClose() {
    setVisible(false);
    setIsConfirmOpen(false);
    window.setTimeout(() => {
      setMounted(false);
      onClose();
    }, 200);
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };

    if (mounted) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mounted]);

  useEffect(() => {
    if (isOpen) return;
    if (!mounted) return;
    window.setTimeout(() => setMounted(false), 200);
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const clienteNombre = resumen?.cliente_nombre?.trim() || "";
  const clienteCel = resumen?.cliente_celular?.trim() || "";

  const puestoText = seat ? `#${String(seat.id).padStart(2, "0")}` : "";

  function ModalPrincipal() {
    return (
      <div
        className={[
          "bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.18)] w-full max-w-sm p-5",
          "transition-all duration-200",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-end">
          <button
            onClick={requestClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-2 text-center">
          <div className="text-xl font-extrabold text-slate-900">
            {clienteNombre || ""}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Puesto {puestoText}</div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {clienteCel && (
          <div className="mt-3 text-center text-xs font-medium text-slate-500">
            Tel: {clienteCel}
          </div>
        )}

        <div className="mt-5 flex justify-center">
          {canLiberar && (
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={submitting || !!error}
              className={[
                "w-full max-w-[220px] rounded-lg px-5 py-3 text-sm font-bold transition-colors duration-200",
                submitting || !!error
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700",
              ].join(" ")}
            >
              Liberar cupo
            </button>
          )}
        </div>
      </div>
    );
  }

  function ModalConfirmacion() {
    if (!isConfirmOpen) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setIsConfirmOpen(false)}>
        <div
          className={[
            "bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)] w-full max-w-xs p-4",
            "transition-all duration-200",
            visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm font-semibold text-slate-900 text-center">
            ¿Confirmas que deseas liberar el puesto {puestoText}?
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await onLiberarCupo();
                setIsConfirmOpen(false);
                requestClose();
              }}
              disabled={submitting || !!error}
              className={[
                "rounded-lg px-4 py-2 text-sm font-bold transition-colors duration-200",
                submitting || !!error
                  ? "bg-slate-300 text-white cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700",
              ].join(" ")}
            >
              Confirmar
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmOpen(false)}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={requestClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ModalPrincipal />
      </div>

      <ModalConfirmacion />
    </>
  );
}
