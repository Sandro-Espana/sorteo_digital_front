import { AppNavbar } from "@/components/AppNavbar";
import { ProductividadSorteoPage } from "@/components/ProductividadSorteoPage";

export default async function ProductividadSorteoRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const idSorteo = Number(p.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <ProductividadSorteoPage idSorteo={idSorteo} />
      </div>
    </div>
  );
}
