"use client";

import { useMemo, useRef, useState } from "react";

function inputClass(hasError: boolean) {
  return (
    "w-full h-10 rounded-md border px-2 text-sm outline-none focus:ring-2 " +
    (hasError ? "border-rose-300 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-200")
  );
}

type LocalPreview = { file: File; url: string };

export function GaleriaUploadPhotoModal({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { image: File; description?: string }) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [touched, setTouched] = useState(false);
  const [preview, setPreview] = useState<LocalPreview | null>(null);
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasImage = Boolean(preview?.file);

  const descriptionTrim = useMemo(() => {
    const d = description.trim();
    return d ? d : undefined;
  }, [description]);

  if (!open) return null;

  function pickFile(files: FileList | null) {
    if (!files || !files.length) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) return;
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({ file: f, url: URL.createObjectURL(f) });
  }

  function submit() {
    setTouched(true);
    if (!preview?.file) return;
    onSubmit({ image: preview.file, description: descriptionTrim });
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">Subir foto</div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700"
              aria-label="Cerrar"
              disabled={submitting}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          <div className="px-4 py-3 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-xs font-semibold text-slate-700">Imagen</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-800 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Seleccionar
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  pickFile(e.target.files);
                  e.target.value = "";
                }}
              />

              <div className={"rounded-md border p-2 bg-slate-50 " + (touched && !hasImage ? "border-rose-200" : "border-slate-200")}>
                {preview ? (
                  <div className="aspect-square rounded-md overflow-hidden bg-white border border-slate-200">
                    <img src={preview.url} alt="preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600">Selecciona una imagen para subir.</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[72px] rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="(Opcional)"
                disabled={submitting}
              />
            </div>

            {touched && !hasImage ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                Debes seleccionar una imagen.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="w-full h-10 rounded-md bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
