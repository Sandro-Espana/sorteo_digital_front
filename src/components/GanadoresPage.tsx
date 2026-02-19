"use client";

import { useMemo, useState } from "react";
import { usePublicGalleryQuery } from "@/lib/usePublicGalleryQuery";

function toAbsoluteStaticUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/static/")) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    return `${base}${url}`;
  }
  return url;
}

export function GanadoresPage() {
  const { items, loading, error, isOffline, retry } = usePublicGalleryQuery();
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const zoomAbs = useMemo(() => (zoomUrl ? toAbsoluteStaticUrl(zoomUrl) : null), [zoomUrl]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
      <div className="mb-3 text-center">
        <div className="text-base sm:text-lg font-black text-slate-900">Cumpliendo sueños, entregando premios</div>
      </div>

      {isOffline && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Sin conexión. Revisa tu internet.
        </div>
      )}

      {error && !loading && (
        <div className="mb-2">
          <button
            type="button"
            onClick={retry}
            className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="w-full rounded-lg border border-slate-200 bg-white p-4">
          <div className="h-4 w-44 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-56 bg-slate-200 rounded" />
        </div>
      ) : !items.length ? (
        <div className="w-full text-center text-sm text-slate-700 py-8">No hay fotos para mostrar</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((f, idx) => {
            const desc = f.description;
            return (
              <button
                key={(f.id_foto ?? idx) as any}
                type="button"
                onClick={() => setZoomUrl(f.url_foto)}
                className="rounded-lg border border-slate-200 overflow-hidden bg-white hover:border-slate-400"
              >
                <div className="aspect-square bg-slate-50">
                  <img src={toAbsoluteStaticUrl(f.url_foto)} alt="foto" className="w-full h-full object-contain" />
                </div>
                <div className="p-2 text-left">
                  <div className="text-[11px] text-slate-700 line-clamp-2">{desc || ""}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {zoomAbs ? (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <div className="w-full max-w-3xl">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => setZoomUrl(null)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-md bg-white/90 hover:bg-white"
                  aria-label="Cerrar"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
                <img src={zoomAbs} alt="zoom" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
