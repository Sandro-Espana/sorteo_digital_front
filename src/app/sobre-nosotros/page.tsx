import { AppNavbar } from "@/components/AppNavbar";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm font-bold text-slate-900 mb-2">Sobre Nosotros</div>
          <div className="text-sm text-slate-700">
            Inversiones Gasca.
          </div>
        </div>
      </div>
    </div>
  );
}
