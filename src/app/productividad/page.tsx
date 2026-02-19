import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";

const meses = [
  { n: 1, label: "Enero" },
  { n: 2, label: "Febrero" },
  { n: 3, label: "Marzo" },
  { n: 4, label: "Abril" },
  { n: 5, label: "Mayo" },
  { n: 6, label: "Junio" },
  { n: 7, label: "Julio" },
  { n: 8, label: "Agosto" },
  { n: 9, label: "Septiembre" },
  { n: 10, label: "Octubre" },
  { n: 11, label: "Noviembre" },
  { n: 12, label: "Diciembre" },
];

export default function ProductividadIndexPage() {
  const anio = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="mb-3">
          <div className="text-sm font-bold text-slate-900">Productividad</div>
          <div className="text-xs text-slate-600">Selecciona un mes</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {meses.map((m) => (
            <Link
              key={m.n}
              href={`/productividad/${anio}/${m.n}`}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 inline-flex items-center justify-between text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              <span>{m.label}</span>
              <span className="text-slate-400">›</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
