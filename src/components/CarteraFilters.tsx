"use client";

export type CarteraFiltersValue = {
  nombre: string;
  telefono: string;
};

export function CarteraFilters({
  value,
  onChange,
}: {
  value: CarteraFiltersValue;
  onChange: (next: CarteraFiltersValue) => void;
}) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          value={value.nombre}
          onChange={(e) => onChange({ ...value, nombre: e.target.value })}
          placeholder="Nombre"
          className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />

        <input
          value={value.telefono}
          onChange={(e) => onChange({ ...value, telefono: e.target.value })}
          placeholder="Teléfono"
          inputMode="numeric"
          className="w-full h-9 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />
      </div>
    </div>
  );
}
