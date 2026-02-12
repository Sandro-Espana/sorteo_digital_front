import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/components/HomePage";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <HomePage />
    </div>
  );
}
