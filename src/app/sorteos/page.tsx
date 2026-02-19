import { AppNavbar } from "@/components/AppNavbar";
import { SorteosPage } from "@/components/SorteosPage";
import { Footer } from "@/components/Footer";

export default function SorteosRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppNavbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-3">
        <SorteosPage />
      </div>
      <Footer />
    </div>
  );
}
