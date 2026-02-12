import { Navbar } from "@/components/Navbar";
import { CarteraPage } from "@/components/CarteraPage";

export default function CarteraRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <CarteraPage />
      </div>
    </div>
  );
}
