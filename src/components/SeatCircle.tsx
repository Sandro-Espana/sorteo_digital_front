"use client";

import Image from "next/image";

export type SeatStatus = "available" | "selected" | "reserved" | "sold" | "blocked";

interface SeatCircleProps {
  number: number;
  status: SeatStatus;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-[clamp(30px,7.2vw,34px)] h-[clamp(30px,7.2vw,34px)] text-[10px]",    // ligeramente menor para evitar desborde en el marco
  md: "w-12 h-12 text-sm", 
  lg: "w-14 h-14 text-base"
};

const availableClass = "bg-slate-50/95 border border-white/35 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-yellow-400/60";
const notAvailableClass = "bg-white/10 border border-white/20 text-white/70";
const selectedClass = "bg-yellow-100/95 border border-yellow-400/80 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]";

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function SeatCircle({ 
  number, 
  status, 
  onClick, 
  size = "md" 
}: SeatCircleProps) {
  if (typeof number !== "number" || !Number.isFinite(number)) return null;
  const formattedNumber = number.toString().padStart(2, "0");
  const showsNumber = status === "available" || status === "selected";

  const focusRingClass = "focus:ring-slate-400";

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styles
        "relative rounded-full flex items-center justify-center font-bold transition-all duration-200 overflow-hidden",
        "active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2",
        
        // Size
        sizeClasses[size],
        
        status === "selected"
          ? selectedClass
          : status === "available"
            ? availableClass
            : notAvailableClass,
        
        // Focus ring color based on status
        focusRingClass
      )}
      title={`Puesto ${formattedNumber} - ${status}`}
    >
      {showsNumber ? (
        formattedNumber
      ) : (
        <Image
          src="/logo.png"
          alt="Inversiones Gasca"
          fill
          sizes="(max-width: 640px) 40px, 48px"
          quality={100}
          className="object-cover"
          draggable={false}
        />
      )}
    </button>
  );
}
