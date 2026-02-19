"use client";

import { CarteraTable } from "@/components/CarteraTable";
import { CarteraFilters } from "@/components/CarteraFilters";
import { useCarteraQuery } from "@/lib/useCarteraQuery";
import { useState } from "react";

export function CarteraPage() {
  const [filters, setFilters] = useState({
    nombre: "",
    telefono: "",
  });

  const { items, loading, error, isOffline, retry } = useCarteraQuery(filters);

  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-2 mb-3">
        <CarteraFilters value={filters} onChange={setFilters} />
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

      <CarteraTable items={items} loading={loading} error={error} />
    </div>
  );
}
