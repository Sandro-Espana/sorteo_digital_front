import type { Slot } from "@/lib/types";
//src/components/SlotCell.tsx
/**
 * ✅ Estilo del botón según el estado del slot
 */
function styleByStatus(status: Slot["status"]) {
  switch (status) {
    case "PAGADO":
      return "bg-green-50 border-green-500 text-green-900";
    case "RESERVADO":
      return "bg-blue-50 border-blue-500 text-blue-900";
    default:
      return "bg-white border-slate-200 text-slate-900";
  }
}

function badgeByStatus(status: Slot["status"]) {
  switch (status) {
    case "PAGADO":
      return "bg-green-600 text-white";
    case "RESERVADO":
      return "bg-blue-600 text-white";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

export function SlotCell({
  slot,
  label,
  onClick,
}: {
  slot: Slot;
  label: "A" | "B";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full h-10 sm:h-11",
        "rounded-lg border",
        "flex items-center justify-center gap-2",
        "transition hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0",
        styleByStatus(slot.status),
      ].join(" ")}
      title={`${label} ${slot.number} - ${slot.status}`}
      type="button"
    >
      <span className={`text-[10px] font-extrabold rounded px-2 py-0.5 ${badgeByStatus(slot.status)}`}>
        {label}
      </span>
      <span className="text-base sm:text-lg font-extrabold tracking-wider">
        {slot.number}
      </span>
    </button>
  );
}
