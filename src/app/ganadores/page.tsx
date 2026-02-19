import { AppNavbar } from "@/components/AppNavbar";
import { GanadoresPage } from "@/components/GanadoresPage";

export default function GanadoresRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <GanadoresPage />
    </div>
  );
}
