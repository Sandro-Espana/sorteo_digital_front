"use client";

import { useMemo } from "react";
import { SeatCircle, type SeatStatus } from "./SeatCircle";

interface DigitalRaffleGridProps {
  onSeatSelect?: (seatNumber: number) => void;
  selectedSeats?: number[];
  seatStatusByNumber?: Record<number, SeatStatus>;
  seatNumbers?: number[];
  maxSeats?: number;
  size?: "sm" | "md" | "lg";
}

export function DigitalRaffleGrid({ 
  onSeatSelect, 
  selectedSeats = [],
  seatStatusByNumber,
  seatNumbers,
  maxSeats = 100, // Exactamente 100 puestos (00-99)
  size = "sm" // Por defecto tamaño pequeño
}: DigitalRaffleGridProps) {
  const seats = useMemo(() => {
    if (Array.isArray(seatNumbers)) {
      return [...seatNumbers].sort((a, b) => a - b).map((n) => ({ number: n }));
    }

    return Array.from({ length: maxSeats }, (_, index) => ({ number: index }));
  }, [maxSeats, seatNumbers]);

  const handleSeatClick = (seatNumber: number) => {
    onSeatSelect?.(seatNumber);
  };

  const getSeatStatus = (seatNumber: number): SeatStatus => {
    if (selectedSeats.includes(seatNumber)) return "selected";
    return seatStatusByNumber?.[seatNumber] ?? "available";
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-[22px] bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_18px_50px_rgba(0,0,0,0.45)] px-0.5 py-0.5">
        <div className="grid grid-cols-10 gap-x-2 gap-y-1 justify-items-center">
          {seats.map((seat) => (
            <SeatCircle
              key={seat.number}
              number={seat.number}
              status={getSeatStatus(seat.number)}
              onClick={() => handleSeatClick(seat.number)}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
