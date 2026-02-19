import { AppNavbar } from "@/components/AppNavbar";
import { GaleriaAlbumPage } from "@/components/GaleriaAlbumPage";

export default async function GaleriaAlbumRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idAlbum = Number(id);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <GaleriaAlbumPage idAlbum={idAlbum} />
      </div>
    </div>
  );
}
