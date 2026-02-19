"use client";

export function ConfirmModal({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-sm rounded-xl bg-white shadow-xl border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-700"
              aria-label="Cerrar"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
          <div className="px-4 py-4 text-sm text-slate-800">{message}</div>
        </div>
      </div>
    </div>
  );
}
