export type SlotStatus = "DISPONIBLE" | "RESERVADO" | "PAGADO" | "ANULADO" | "BLOQUEADO";
// Estado común para slots y seats
//src/lib/types.ts
export type Seat = {
  id: number;          // <- tu UI usa esto
  status: SlotStatus;  // <- opcional, pero útil
  id_venta?: number;
  total?: number;
  abonado?: number;
  saldo?: number;
  cliente_nombre?: string;
  venta_puestos?: number[];

  // Fuente única de verdad (backend HU)
  estado_actual?: string;
  is_disponible?: boolean;
  is_reservado?: boolean;
  is_vendido?: boolean;
  is_bloqueado?: boolean;
  is_anulado?: boolean;
  can_venderse?: boolean;
  can_reservarse?: boolean;
  can_liberarse?: boolean;
  can_anularse?: boolean;
};

// Lo que viene del back
export type ApiPuesto = {
  puesto_num: number;
  status: SlotStatus;
};
