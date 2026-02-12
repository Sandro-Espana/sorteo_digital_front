import type { Seat, SlotStatus } from "@/lib/types";
//src/lib/adapters.ts
export type PuestoOut = {
  puesto_num: number;
  status: SlotStatus; // usa el tipo del front
  chanceA: { number: string; status: SlotStatus };
  chanceB: { number: string; status: SlotStatus };
  id_venta?: number;
  total?: number;
  abonado?: number;
  saldo?: number;
  cliente_nombre?: string;
  venta_puestos?: number[];
};

export function puestoToSeat(p: PuestoOut): Seat {
  return {
    id: p.puesto_num,
    status: p.status,
    chanceA: { number: p.chanceA.number, status: p.status },
    chanceB: { number: p.chanceB.number, status: p.status },
    id_venta: p.id_venta,
    total: p.total,
    abonado: p.abonado,
    saldo: p.saldo,
    cliente_nombre: p.cliente_nombre,
    venta_puestos: p.venta_puestos,
  };
}
