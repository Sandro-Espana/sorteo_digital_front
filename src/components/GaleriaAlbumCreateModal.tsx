"use client";

import { useMemo, useState } from "react";
import type { GaleriaAlbumCreateIn } from "@/lib/galeria";

function inputClass(hasError: boolean) {
  return (
    "w-full h-10 rounded-md border px-2 text-sm outline-none focus:ring-2 " +
    (hasError ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-200")
  );
}

export function GaleriaAlbumCreateModal({
  open,
  anioDefault,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  anioDefault: number | null;
  onClose: () => void;
  onSubmit: (payload: GaleriaAlbumCreateIn) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [anio, setAnio] = useState("");
  const [touched, setTouched] = useState(false);

  const anioNum = useMemo(() => {
    const source = anio.trim() ? anio : anioDefault != null ? String(anioDefault) : "";
    const n = Number(source.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) && n >= 2000 && n <= 3000 ? n : null;
  }, [anio, anioDefault]);

  if (!open) return null;

  function submit() {
    setTouched(true);
    if (!anioNum) return;

    onSubmit({
      year: anioNum,
    });
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Crear álbum</div>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Año</label>
              <input
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                onBlur={() => setTouched(true)}
                inputMode="numeric"
                className={inputClass(touched && !anioNum)}
                placeholder={anioDefault != null ? String(anioDefault) : "Ej: 2026"}
                disabled={submitting}
              />
            </div>

            {touched && !anioNum ? (
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
