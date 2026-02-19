import { AppNavbar } from "@/components/AppNavbar";
import { HomePage } from "@/components/HomePage";

export default function DashboardRoutePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <HomePage />
    </div>
  );
}
