import { AppNavbar } from "@/components/AppNavbar";
import { GaleriaPage } from "@/components/GaleriaPage";

export default function GaleriaRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <GaleriaPage />
      </div>
    </div>
  );
}
