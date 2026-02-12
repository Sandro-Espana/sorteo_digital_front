export type SlotStatus = "DISPONIBLE" | "RESERVADO" | "PAGADO" | "ANULADO" | "BLOQUEADO";
// Estado común para slots y seats
//src/lib/types.ts
export type Slot = {
  number: string;
  status: SlotStatus;
};

export type Seat = {
  id: number;          // <- tu UI usa esto
  status: SlotStatus;  // <- opcional, pero útil
  chanceA: Slot;
  chanceB: Slot;
  id_venta?: number;
  total?: number;
  abonado?: number;
  saldo?: number;
  cliente_nombre?: string;
  venta_puestos?: number[];
};

// Lo que viene del back
export type ApiPuesto = {
  puesto_num: number;
  status: SlotStatus;
  chanceA: Slot;
  chanceB: Slot;
};
