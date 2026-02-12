"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ClienteErrors, ClienteForm } from "@/lib/validators";

interface SaleModalProps {
  isOpen: boolean;
  onBackToGrid: () => void;
  onCancel: () => void;
  selectedCount: number;
  totalEstimado: number;
  selectedSeats: number[];
  abonoInicial: string;
  setAbonoInicial: Dispatch<SetStateAction<string>>;
  onRemoveSeat: (seatNumber: number) => void;
  cliente: ClienteForm;
  setCliente: Dispatch<SetStateAction<ClienteForm>>;
  touched: Partial<Record<keyof ClienteForm, boolean>>;
  setTouched: Dispatch<SetStateAction<Partial<Record<keyof ClienteForm, boolean>>>>;
  clienteErrors: ClienteErrors;
  onCrearVenta: () => void;
  canCreateVenta: boolean;
  submitting: boolean;
  inputClass: (hasError: boolean) => string;
}

export function SaleModal({
  isOpen,
  onBackToGrid,
  onCancel,
  selectedCount,
  totalEstimado,
  selectedSeats,
  abonoInicial,
  setAbonoInicial,
  onRemoveSeat,
  cliente,
  setCliente,
  touched,
  setTouched,
  clienteErrors,
  onCrearVenta,
  canCreateVenta,
  submitting,
  inputClass,
}: SaleModalProps) {
  const formattedSeats = useMemo(() => {
    return [...selectedSeats].sort((a, b) => a - b);
  }, [selectedSeats]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Reservar Puestos
              </h2>
              <button
                onClick={onCancel}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Resumen de selección */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Puestos seleccionados:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {selectedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Total estimado:
                </span>
                <span className="text-lg font-bold text-green-600">
                  ${totalEstimado.toLocaleString("es-CO")}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">Puestos:</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onBackToGrid}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                      aria-label="Seleccionar otro puesto en la grilla"
                      title="Seleccionar otro puesto en la grilla"
                    >
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">Abono:</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={abonoInicial}
                    onChange={(e) => setAbonoInicial(e.target.value.replace(/[^0-9.,]/g, ""))}
                    className="w-32 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="0"
                  />
                </div>

                {formattedSeats.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formattedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-700 border border-slate-200"
                      >
                        <span>{seat}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onRemoveSeat(seat);
                            onBackToGrid();
                          }}
                          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                          aria-label={`Quitar puesto ${seat}`}
                          title={`Quitar puesto ${seat}`}
                        >
                          <span className="text-xs leading-none">×</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Formulario de cliente */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Datos del cliente
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Nombres */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputClass(!!touched.nombres && !!clienteErrors.nombres)}
                    placeholder="Nombres completos"
                    value={cliente.nombres}
                    onChange={(e) => setCliente((p) => ({ ...p, nombres: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, nombres: true }))}
                  />
                  {!!touched.nombres && clienteErrors.nombres && (
                    <div className="mt-1 text-xs text-red-600">{clienteErrors.nombres}</div>
                  )}
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Celular (opcional)
                  </label>
                  <input
                    className={inputClass(!!touched.celular && !!clienteErrors.celular)}
                    placeholder="Número de celular"
                    value={cliente.celular}
                    onChange={(e) => setCliente((p) => ({ ...p, celular: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, celular: true }))}
                  />
                  {!!touched.celular && clienteErrors.celular && (
                    <div className="mt-1 text-xs text-red-600">{clienteErrors.celular}</div>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección (opcional)
                  </label>
                  <input
                    className={inputClass(!!touched.direccion && !!clienteErrors.direccion)}
                    placeholder="Dirección de residencia"
                    value={cliente.direccion}
                    onChange={(e) => setCliente((p) => ({ ...p, direccion: e.target.value }))}
                    onBlur={() => setTouched((t) => ({ ...t, direccion: true }))}
                  />
                  {!!touched.direccion && clienteErrors.direccion && (
                    <div className="mt-1 text-xs text-red-600">{clienteErrors.direccion}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={onCrearVenta}
              disabled={!canCreateVenta}
              className={[
                "w-full rounded-lg px-4 py-3 text-sm font-bold transition-colors",
                canCreateVenta
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-300 text-white cursor-not-allowed",
              ].join(" ")}
            >
              {submitting ? "Creando venta..." : "Reservar / Crear venta"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
