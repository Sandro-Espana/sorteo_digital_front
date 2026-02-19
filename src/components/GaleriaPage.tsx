"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { apiPost, apiPostFormData } from "@/lib/api";
import { useGaleriaAniosQuery } from "@/lib/useGaleriaAniosQuery";
import type { GaleriaAlbumCreateIn } from "@/lib/galeria";
import { GaleriaAlbumCreateModal } from "@/components/GaleriaAlbumCreateModal";
import { GaleriaUploadPhotoModal } from "@/components/GaleriaUploadPhotoModal";
import { ConfirmModal } from "@/components/ConfirmModal";

export function GaleriaPage() {
  const { items, loading, error, isOffline, retry, invalidate } = useGaleriaAniosQuery();

  const [anioInput, setAnioInput] = useState("");
  const anioSelected = useMemo(() => {
    const n = Number(anioInput.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) && n >= 2000 && n <= 3000 ? n : null;
  }, [anioInput]);

  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("Álbum creado correctamente.");

  async function createAlbum(payload: GaleriaAlbumCreateIn) {
    setSubmitting(true);
    setCreateError(null);
    try {
      const out = await apiPost<any>("/api/gallery/album", payload);
      const idAlbum = typeof out?.id === "number" ? out.id : typeof out?.id_album === "number" ? out.id_album : null;

      invalidate();
      retry();

      setOpenCreate(false);
      setConfirmMsg("Álbum creado correctamente.");
      setShowConfirm(true);

      if (idAlbum) {
        window.location.assign(`/galeria/album/${idAlbum}`);
      }
    } catch (e: any) {
      const msg = String(e?.message ?? "Error creando álbum");
      if (msg.includes("409")) {
        setCreateError("Ya existe un álbum para ese año.");
      } else {
        setCreateError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadIndependentPhoto(payload: { image: File; description?: string }) {
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("image", payload.image);
      if (payload.description) form.append("description", payload.description);
      await apiPostFormData<unknown>("/api/gallery/photo", form);

      invalidate();
      retry();

      setOpenUpload(false);
      setConfirmMsg("Foto subida correctamente.");
      setShowConfirm(true);
    } catch (e: any) {
      setUploadError(String(e?.message ?? "Error subiendo foto"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-sm font-bold text-slate-900">Galería</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenUpload(true)}
            className="h-9 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            Subir Foto
          </button>
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
          >
            + Crear álbum
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
        <div className="text-xs font-semibold text-slate-700 mb-1">Año de entrega</div>
        <div className="flex items-center gap-2">
          <input
            value={anioInput}
            onChange={(e) => setAnioInput(e.target.value)}
            inputMode="numeric"
            placeholder="Ej: 2026"
            className="w-full h-10 rounded-md border border-slate-300 px-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="h-10 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            Crear
          </button>
        </div>
        <div className="mt-1 text-[11px] text-slate-600">
          La galería se organiza solo por año.
        </div>
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
        <div className="w-full text-center text-sm text-slate-700 py-8">No hay años para mostrar</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((y) => (
            <div key={y.anio} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-slate-900">Año {y.anio}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Total fotos: {typeof y.total_fotos === "number" ? y.total_fotos : "N/D"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAnioInput(String(y.anio));
                    setOpenCreate(true);
                  }}
                  className="h-9 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
                >
                  Crear álbum
                </button>
              </div>

              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                Por ahora no hay listado de álbumes por año en el backend.
              </div>

              <div className="mt-2 text-[11px] text-slate-600">
                Si ya tienes un ID de álbum, abre:
                <div className="mt-1">
                  <Link className="text-slate-900 underline" href="/galeria/album/1">
                    /galeria/album/ID
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <GaleriaAlbumCreateModal
        open={openCreate}
        anioDefault={anioSelected}
        onClose={() => {
          if (!submitting) setOpenCreate(false);
        }}
        onSubmit={createAlbum}
        submitting={submitting}
        error={createError}
      />

      <GaleriaUploadPhotoModal
        open={openUpload}
        onClose={() => {
          if (!uploading) setOpenUpload(false);
        }}
        onSubmit={uploadIndependentPhoto}
        submitting={uploading}
        error={uploadError}
      />

      <ConfirmModal open={showConfirm} title="Guardado" message={confirmMsg} onClose={() => setShowConfirm(false)} />
    </div>
  );
}
