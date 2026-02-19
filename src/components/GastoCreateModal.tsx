"use client";

import { useMemo, useState } from "react";

function moneyPreview(v: string) {
  const n = Number(v.replace(/[^0-9]/g, "")) || 0;
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function GastoCreateModal({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { concepto: string; valor: number; observacion?: string }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [concepto, setConcepto] = useState("");
  const [valor, setValor] = useState("");
  const [observacion, setObservacion] = useState("");
  const [touched, setTouched] = useState(false);

  const conceptoOk = concepto.trim().length >= 1 && concepto.trim().length <= 150;
  const valorNum = useMemo(() => Number(valor.replace(/[^0-9]/g, "")) || 0, [valor]);
  const valorOk = valorNum > 0;

  if (!open) return null;

  function submit() {
    setTouched(true);
    if (!conceptoOk || !valorOk) return;
    onSubmit({
      concepto: concepto.trim(),
      valor: valorNum,
      observacion: observacion.trim() ? observacion.trim() : undefined,
    });
  }

  const conceptoInvalid = touched && !conceptoOk;
  const valorInvalid = touched && !valorOk;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Registrar gasto</div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700"
              aria-label="Cerrar"
              disabled={submitting}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Concepto</label>
              <input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                onBlur={() => setTouched(true)}
                className={
                  "w-full h-10 rounded-md border px-2 text-sm outline-none focus:ring-2 " +
                  (conceptoInvalid
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-300 focus:ring-slate-200")
                }
                placeholder="Ej: Compra talonarios"
                disabled={submitting}
              />
              {conceptoInvalid ? (
                <div className="mt-1 text-xs text-rose-700">Ingresa un concepto (1 a 150 caracteres).</div>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor</label>
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onBlur={() => setTouched(true)}
                inputMode="numeric"
                className={
                  "w-full h-10 rounded-md border px-2 text-sm outline-none focus:ring-2 " +
                  (valorInvalid ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-200")
                }
                placeholder="Ej: 50000"
                disabled={submitting}
              />
              <div className="mt-1 text-xs text-slate-600">{moneyPreview(valor)}</div>
              {valorInvalid ? <div className="mt-1 text-xs text-rose-700">El valor debe ser mayor a 0.</div> : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Observación (opcional)</label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full min-h-[84px] rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Detalle adicional"
                disabled={submitting}
              />
            </div>

            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full h-10 rounded-md bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
