import { AppNavbar } from "@/components/AppNavbar";
import { GastosPage } from "@/components/GastosPage";

export default function GastosRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <GastosPage />
      </div>
    </div>
  );
}
