"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiPostFormData } from "@/lib/api";
import { useGaleriaAlbumFotosQuery } from "@/lib/useGaleriaAlbumFotosQuery";
import { ConfirmModal } from "@/components/ConfirmModal";

function toAbsoluteStaticUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/static/")) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    return `${base}${url}`;
  }
  return url;
}

type LocalPreview = {
  file: File;
  url: string;
};

export function GaleriaAlbumPage({ idAlbum }: { idAlbum: number }) {
  const { items, loading, error, isOffline, retry, invalidate } = useGaleriaAlbumFotosQuery(idAlbum);

  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState<LocalPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  const [zoomUrl, setZoomUrl] = useState<string | null>(null);
  const zoomAbs = useMemo(() => (zoomUrl ? toAbsoluteStaticUrl(zoomUrl) : null), [zoomUrl]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("Fotos subidas correctamente.");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const next: LocalPreview[] = arr
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));

    setPreviews((prev) => [...prev, ...next]);
  }

  function clearPreviews() {
    setPreviews((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return [];
    });
  }

  async function upload() {
    if (!previews.length) return;

    setUploading(true);
    setUploadError(null);
    try {
      const desc = description.trim();
      for (const p of previews) {
        const form = new FormData();
        form.append("image", p.file);
        if (desc) form.append("description", desc);
        form.append("albumId", String(idAlbum));
        await apiPostFormData<unknown>("/api/gallery/photo", form);
      }
      setConfirmMsg("Fotos subidas correctamente.");
      setShowConfirm(true);
      clearPreviews();
      setDescription("");
      invalidate();
      retry();
    } catch (e: any) {
      setUploadError(String(e?.message ?? "Error subiendo fotos"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-sm font-bold text-slate-900">Álbum #{idAlbum}</div>
          <div className="text-xs text-slate-600">
            <Link className="underline" href="/galeria">
              Volver a Galería
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
        >
          Agregar fotos
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={
          "rounded-lg border bg-white p-3 mb-3 " +
          (dragOver ? "border-slate-900" : "border-slate-200")
        }
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
      >
        <div className="text-xs font-semibold text-slate-700">Subir fotos</div>
        <div className="text-[11px] text-slate-600 mt-1">
          Arrastra y suelta aquí o usa el botón “Agregar fotos”.
        </div>

        {previews.length ? (
          <div className="mt-3">
            <div className="mb-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[64px] rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="(Opcional)"
                disabled={uploading}
              />
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs text-slate-700">Preview ({previews.length})</div>
              <button
                type="button"
                onClick={clearPreviews}
                disabled={uploading}
                className="h-8 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                Limpiar
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {previews.map((p, idx) => (
                <div key={idx} className="aspect-square rounded-md border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={p.url} alt="preview" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            {uploadError ? (
              <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{uploadError}</div>
            ) : null}

            <button
              type="button"
              onClick={upload}
              disabled={uploading}
              className="mt-3 w-full h-10 rounded-md bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {uploading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        ) : null}
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
          {items.map((f, idx) => (
            <button
              key={f.id_foto ?? idx}
              type="button"
              onClick={() => setZoomUrl(f.url_foto)}
              className="aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-slate-400"
            >
              <img src={toAbsoluteStaticUrl(f.url_foto)} alt="foto" className="w-full h-full object-contain" />
            </button>
          ))}
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

      <ConfirmModal open={showConfirm} title="Guardado" message={confirmMsg} onClose={() => setShowConfirm(false)} />
    </div>
  );
}
