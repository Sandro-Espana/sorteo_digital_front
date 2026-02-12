"use client";

import { CarteraTable } from "@/components/CarteraTable";
import { useCartera } from "@/lib/useCartera";

export function CarteraPage() {
  const {
    filters: { nombre, telefono, soloDeuda },
    setNombre,
    setTelefono,
    setSoloDeuda,
    items,
    loading,
    error,
  } = useCartera();

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-2 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />

          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            inputMode="numeric"
            className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />

          <label className="h-9 inline-flex items-center gap-2 text-sm text-slate-800 select-none">
            <input
              type="checkbox"
              checked={soloDeuda}
              onChange={(e) => setSoloDeuda(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Solo con deuda</span>
          </label>
        </div>
      </div>

      <CarteraTable items={items} loading={loading} error={error} />
    </div>
  );
}
