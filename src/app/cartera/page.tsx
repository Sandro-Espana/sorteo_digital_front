import { AppNavbar } from "@/components/AppNavbar";
import { CarteraPage } from "@/components/CarteraPage";

export default function CarteraPageRoute() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar compact />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <CarteraPage />
      </div>
    </div>
  );
}
