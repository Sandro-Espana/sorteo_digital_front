"use client";

import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import { GastosTable } from "@/components/GastosTable";
import { GastoCreateModal } from "@/components/GastoCreateModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useGastosQuery } from "@/lib/useGastosQuery";

export function GastosPage() {
  const [rango, setRango] = useState<"dia" | "semana" | "mes">("dia");
  const [concepto, setConcepto] = useState("");

  const { items, loading, error, isOffline, retry, invalidate } = useGastosQuery({ rango, concepto });

  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const totalValor = useMemo(() => items.reduce((acc, it) => acc + (Number.isFinite(it.valor) ? it.valor : 0), 0), [items]);

  async function createGasto(payload: { concepto: string; valor: number; observacion?: string }) {
    setSubmitting(true);
    setCreateError(null);
    try {
      await apiPost("/api/gastos", payload);
      setOpenCreate(false);
      setShowConfirm(true);
      invalidate();
      retry();
    } catch (e: any) {
      setCreateError(String(e?.message ?? "Error guardando gasto"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-sm font-bold text-slate-900">Gastos</div>
        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
        >
          Nuevo
        </button>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2 items-center">
        <div className="col-span-1">
          <select
            value={rango}
            onChange={(e) => setRango(e.target.value as any)}
            className="w-full h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
        </div>

        <div className="col-span-2">
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Concepto"
            className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
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

      <div className="mb-2 text-xs text-slate-700">
        <span className="font-bold">Total listado:</span> {totalValor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
      </div>

      <GastosTable items={items} loading={loading} error={error} />

      <GastoCreateModal
        open={openCreate}
        onClose={() => {
          if (!submitting) setOpenCreate(false);
        }}
        onSubmit={createGasto}
        submitting={submitting}
        error={createError}
      />

      <ConfirmModal
        open={showConfirm}
        title="Guardado"
        message="Gasto registrado correctamente."
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
}
