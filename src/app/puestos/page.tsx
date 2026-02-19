import { AppNavbar } from "@/components/AppNavbar";
import { SlotsTable } from "@/components/SlotsTable";

export default function PuestosPage() {
  return (
    <div className="h-screen w-screen box-border bg-[#00163f] flex flex-col pt-4 pl-3 pr-3 pb-6">
      <div className="relative flex-1 min-h-0 mb-2 flex flex-col overflow-hidden rounded-[18px] bg-gradient-to-b from-[#0B2B66] to-[#0A295F] shadow-[inset_0_1px_0_rgba(255,255,255,0.30),inset_1px_0_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.35),inset_-1px_0_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_0_1px_rgba(255,255,255,0.16),0_0_28px_rgba(255,255,255,0.16),0_18px_60px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/12" />
        <div className="flex-shrink-0 mb-3">
          <AppNavbar />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <SlotsTable />
        </div>
      </div>
    </div>
  );
}
