import { AppNavbar } from "@/components/AppNavbar";
import { ProductividadMesPage } from "@/components/ProductividadMesPage";

export default async function ProductividadMesRoutePage({
  params,
}: {
  params: Promise<{ anio: string; mes: string }>;
}) {
  const p = await params;
  const anio = Number(p.anio);
  const mes = Number(p.mes);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <ProductividadMesPage anio={anio} mes={mes} />
      </div>
    </div>
  );
}
