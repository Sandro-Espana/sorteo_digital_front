import type { Seat, SlotStatus } from "@/lib/types";
//src/lib/adapters.ts
export type PuestoOut = {
  puesto_num?: number;
  numero_puesto?: number;
  status: SlotStatus; // usa el tipo del front
  id_venta?: number;
  total?: number;
  abonado?: number;
  saldo?: number;
  cliente_nombre?: string;
  venta_puestos?: number[];
};

export type PuestoClasificadoOut = {
  numero_puesto: number;
  id_venta?: number | null;
  total?: number | null;
  abonado?: number | null;
  saldo?: number | null;
  estado_actual: string;
  is_disponible: boolean;
  is_reservado: boolean;
  is_vendido: boolean;
  is_bloqueado: boolean;
  is_anulado: boolean;
  can_venderse: boolean;
  can_reservarse: boolean;
  can_liberarse: boolean;
  can_anularse: boolean;
};

export function normalizeSlotStatus(raw: unknown): SlotStatus {
  const s = String(raw ?? "").toUpperCase().trim();
  if (s === "DISPONIBLE") return "DISPONIBLE";
  if (s === "RESERVADO" || s === "RESERVADA") return "RESERVADO";
  if (s === "PAGADO" || s === "PAGADA" || s === "VENDIDA" || s === "VENDIDO") return "PAGADO";
  if (s === "ANULADO" || s === "ANULADA") return "ANULADO";
  if (s === "BLOQUEADO" || s === "BLOQUEADA") return "BLOQUEADO";
  return "DISPONIBLE";
}

export function puestoToSeat(p: PuestoOut): Seat {
  const idRaw = p.puesto_num ?? p.numero_puesto;
  const id = typeof idRaw === "number" && Number.isFinite(idRaw) ? idRaw : NaN;
  return {
    id,
    status: normalizeSlotStatus((p as any)?.status),
    id_venta: p.id_venta,
    total: p.total,
    abonado: p.abonado,
    saldo: p.saldo,
    cliente_nombre: p.cliente_nombre,
    venta_puestos: p.venta_puestos,
  };
}

export function puestoClasificadoToSeat(p: PuestoClasificadoOut): Seat {
  const id = Number(p?.numero_puesto);
  const estado = String(p?.estado_actual ?? "").toUpperCase();

  const status: SlotStatus = p?.is_disponible
    ? "DISPONIBLE"
    : p?.is_anulado
      ? "ANULADO"
      : p?.is_bloqueado
        ? "BLOQUEADO"
        : p?.is_vendido
          ? "PAGADO"
          : p?.is_reservado
            ? "RESERVADO"
            : normalizeSlotStatus(estado);

  return {
    id,
    status,
    id_venta: p.id_venta == null ? undefined : Number(p.id_venta),
    total: p.total == null ? undefined : Number(p.total),
    abonado: p.abonado == null ? undefined : Number(p.abonado),
    saldo: p.saldo == null ? undefined : Number(p.saldo),
    estado_actual: estado,
    is_disponible: !!p.is_disponible,
    is_reservado: !!p.is_reservado,
    is_vendido: !!p.is_vendido,
    is_bloqueado: !!p.is_bloqueado,
    is_anulado: !!p.is_anulado,
    can_venderse: !!p.can_venderse,
    can_reservarse: !!p.can_reservarse,
    can_liberarse: !!p.can_liberarse,
    can_anularse: !!p.can_anularse,
  };
}
