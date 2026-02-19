"use client";

import { useEffect, useMemo, useState } from "react";
import type { Seat } from "@/lib/types";
import { apiGet } from "@/lib/api";
import type { PuestoClasificadoOut } from "@/lib/adapters";

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
  const [puestosVenta, setPuestosVenta] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const idVenta = seat?.id_venta ?? null;

  const canLiberar = useMemo(() => {
    if (typeof seat?.can_liberarse === "boolean") return seat.can_liberarse;
    const estadoVenta = String(resumen?.estado ?? "").toUpperCase();
    if (estadoVenta === "PAGADA") return false;
    if (estadoVenta === "PARCIAL" || estadoVenta === "ABIERTA") return true;
    return typeof resumen?.saldo === "number" && resumen.saldo > 0;
  }, [resumen?.estado, resumen?.saldo, seat?.can_liberarse]);

  const isVentaPagada = useMemo(() => {
    const estadoVenta = String(resumen?.estado ?? "").toUpperCase();
    return estadoVenta === "PAGADA";
  }, [resumen?.estado]);

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
    setPuestosVenta([]);

    if (!idVenta) {
      setError("No se encontró la venta asociada a este puesto.");
      return;
    }

    let alive = true;
    loadResumen(idVenta)
      .then(async (r) => {
        if (!alive) return;
        setResumen(r);
        try {
          const data = await apiGet<any>(`/api/sorteos/${encodeURIComponent(String(r.id_sorteo))}/puestos-clasificados`);
          const puestos = Array.isArray(data?.puestos) ? (data.puestos as PuestoClasificadoOut[]) : [];
          const nums = puestos
            .filter((p) => Number(p?.id_venta) === Number(idVenta))
            .map((p) => Number(p?.numero_puesto))
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);
          if (!alive) return;
          setPuestosVenta(nums);
        } catch {
          if (!alive) return;
          setPuestosVenta([]);
        }
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

  const puestosGrid = useMemo(() => {
    const current = seat?.id;
    const list = Array.isArray(puestosVenta) && puestosVenta.length ? puestosVenta : (typeof current === "number" ? [current] : []);
    const uniq = [...new Set(list.filter((n) => typeof n === "number" && Number.isFinite(n)))].sort((a, b) => a - b);
    return uniq;
  }, [puestosVenta, seat?.id]);

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

        <div className="mt-1 text-center">
          <div className="text-xl font-extrabold text-slate-900">{clienteNombre || ""}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">{clienteCel ? `Tel: ${clienteCel}` : ""}</div>
        </div>

        <div className="mt-3 flex items-center justify-center">
          <div
            className={
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold " +
              (isVentaPagada ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900")
            }
          >
            {isVentaPagada ? "PAGO COMPLETO" : "PAGO PARCIAL"}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4">
          <div className="text-xs font-bold text-slate-900 text-center">Puestos asociados a esta venta</div>
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {puestosGrid.map((n) => {
              const isCurrent = typeof seat?.id === "number" && Number(seat.id) === Number(n);
              return (
                <div
                  key={String(n)}
                  className={
                    "relative flex items-center justify-center rounded-lg px-2 py-2 text-sm font-extrabold transition-all " +
                    (isCurrent
                      ? "bg-yellow-100 border border-yellow-400 text-slate-900 shadow-[0_0_0_2px_rgba(250,204,21,0.25)] scale-[1.04]"
                      : "bg-slate-100 border border-slate-200 text-slate-700")
                  }
                  title={isCurrent ? "Seleccionado" : ""}
                >
                  {String(n).padStart(2, "0")}
                  {isCurrent ? (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                      Seleccionado
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          {canLiberar ? (
            <>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={submitting || !!error}
                className={[
                  "w-full rounded-xl px-5 py-3 text-sm font-extrabold transition-colors duration-200",
                  submitting || !!error
                    ? "bg-slate-300 text-white cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700",
                ].join(" ")}
              >
                Liberar cupos
              </button>
              <div className="mt-2 text-[11px] text-slate-600 text-center">
                Se liberarán TODOS los puestos asociados a esta reserva
              </div>
            </>
          ) : (
            <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 text-center">
              Estos puestos ya fueron pagados en su totalidad. No pueden liberarse.
            </div>
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
            ¿Confirmas que deseas liberar TODOS los puestos de esta venta?
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
