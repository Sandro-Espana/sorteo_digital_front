"use client";

import { useMemo, useState } from "react";
import type { SorteoCreateIn } from "@/lib/sorteos";
import { useLoteriasQuery } from "@/lib/useLoteriasQuery";

function inputClass(hasError: boolean) {
  return (
    "w-full h-10 rounded-md border px-2 text-sm outline-none focus:ring-2 " +
    (hasError ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-200")
  );
}

function moneyPreview(v: string) {
  const n = Number(v.replace(/[^0-9.]/g, "")) || 0;
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function SorteoCreateModal({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SorteoCreateIn) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [fechaHora, setFechaHora] = useState("");
  const [premio, setPremio] = useState("");
  const [precioBoleta, setPrecioBoleta] = useState("");
  const [loteriaId, setLoteriaId] = useState("");
  const [touched, setTouched] = useState(false);

  const { items: loterias, loading: lotLoading, error: lotError, isOffline: lotOffline, retry: lotRetry } = useLoteriasQuery();

  const nombreAuto = useMemo(() => (fechaHora ? `Sorteo ${fechaHora}` : ""), [fechaHora]);
  const nombreOk = nombreAuto.trim().length > 0;
  const premioNum = useMemo(() => Number(premio.replace(/[^0-9.]/g, "")) || 0, [premio]);
  const precioNum = useMemo(() => Number(precioBoleta.replace(/[^0-9.]/g, "")) || 0, [precioBoleta]);
  const loteriaNum = useMemo(() => {
    const n = Number(loteriaId.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [loteriaId]);

  const fechaOk = useMemo(() => {
    if (!fechaHora) return false;
    const dt = new Date(fechaHora);
    if (Number.isNaN(dt.getTime())) return false;
    return dt.getTime() > Date.now();
  }, [fechaHora]);

  const premioOk = premioNum > 0;
  const precioOk = precioNum > 0;

  if (!open) return null;

  function submit() {
    setTouched(true);
    if (!nombreOk || !fechaOk || !premioOk || !precioOk) return;

    const iso = new Date(`${fechaHora}T00:00:00`).toISOString();

    onSubmit({
      nombre: nombreAuto.trim(),
      fecha_hora_sorteo: iso,
      premio: String(premioNum),
      total_boletas: 100,
      oportunidades_por_boleta: 1,
      precio_boleta: precioNum,
      loteria_id: loteriaNum,
    });
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Crear sorteo</div>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
              <input
                value={nombreAuto}
                className={inputClass(touched && !nombreOk)}
                placeholder=""
                disabled
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha del sorteo</label>
              <input
                type="date"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                onBlur={() => setTouched(true)}
                className={inputClass(touched && !fechaOk)}
                disabled={submitting}
              />
              {touched && !fechaOk ? (
                <div className="mt-1 text-xs text-rose-700">Debe ser una fecha futura.</div>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Premio</label>
              <input
                type="number"
                value={premio}
                onChange={(e) => setPremio(e.target.value)}
                onBlur={() => setTouched(true)}
                inputMode="decimal"
                className={inputClass(touched && !premioOk)}
                placeholder="Ej: 1500000"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio boleta</label>
                <input
                  type="number"
                  value={precioBoleta}
                  onChange={(e) => setPrecioBoleta(e.target.value)}
                  onBlur={() => setTouched(true)}
                  inputMode="decimal"
                  className={inputClass(touched && !precioOk)}
                  placeholder="Ej: 50000"
                  disabled={submitting}
                />
                <div className="mt-1 text-xs text-slate-600">{moneyPreview(precioBoleta)}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lotería</label>
                <select
                  value={loteriaId}
                  onChange={(e) => setLoteriaId(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  disabled={submitting || lotLoading}
                >
                  <option value="">{lotLoading ? "Cargando..." : "Selecciona..."}</option>
                  {loterias.map((l) => (
                    <option key={l.id} value={String(l.id)}>
                      {l.nombre}
                    </option>
                  ))}
                </select>

                {lotOffline ? (
                  <div className="mt-1 text-[11px] text-amber-700">Sin conexión. No se pudo cargar la lista.</div>
                ) : null}

                {lotError ? (
                  <button
                    type="button"
                    onClick={lotRetry}
                    className="mt-1 text-[11px] font-bold text-slate-700 underline"
                    disabled={submitting}
                  >
                    Reintentar cargar
                  </button>
                ) : null}
              </div>
            </div>

            {touched && (!nombreOk || !fechaOk || !premioOk || !precioOk) ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                Revisa los campos marcados.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full h-10 rounded-md bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
