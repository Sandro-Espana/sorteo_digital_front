import type { Seat, SlotStatus } from "@/lib/types";
// src/components/SeatCard.tsx

function seatStatus(seat: Seat): SlotStatus {
  return seat.status ?? "DISPONIBLE";
}

function seatClasses(status: SlotStatus) {
  if (status === "PAGADO") return "border-green-600 bg-green-100 shadow-sm";
  if (status === "RESERVADO") return "border-blue-600 bg-blue-100 shadow-sm";
  return "border-slate-300 bg-white hover:bg-slate-50 hover:shadow-sm";
}

function seatHeaderText(status: SlotStatus) {
  if (status === "PAGADO") return "text-green-800";
  if (status === "RESERVADO") return "text-blue-800";
  return "text-slate-700";
}

function pillClasses(status: SlotStatus) {
  if (status === "PAGADO") return "bg-green-600 text-white border-green-700";
  if (status === "RESERVADO") return "bg-blue-600 text-white border-blue-700";
  return "bg-white text-slate-900 border-slate-300";
}

export function SeatCard({
  seat,
  onClick,
}: {
  seat: Seat;
  onClick?: () => void;
}) {
  const status = seatStatus(seat);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-12 h-14 sm:w-14 sm:h-16",
        "rounded-lg border",
        "flex flex-col items-center justify-center",
        "transition-all",
        "active:scale-[0.95]",
        seatClasses(status),
      ].join(" ")}
      title={`Puesto #${seat.id} - ${status}`}
    >
      {/* Número del puesto - pequeño y sutil */}
      <div className={[("text-[9px] font-medium mb-1"), seatHeaderText(status)].join(" ")}>
        #{seat.id}
      </div>
    </button>
  );
}
