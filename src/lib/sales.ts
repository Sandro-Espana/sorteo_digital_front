import { apiDelete, apiGet, apiPost } from "@/lib/api";
//src/lib/sales.ts
export type ClienteIn = {
  nombres: string;
  apellidos?: string;
  celular?: string;
  email?: string;
  direccion?: string;
};

export type VentaCreateIn = {
  id_sorteo: number;
  puestos: number[];
  cliente?: ClienteIn;
};

export type VentaOut = {
  id_venta: number;
  id_sorteo: number;
  total: number;
  estado: string;
};

export type PagoIn = {
  monto: number;
  metodo_pago?: string;
  referencia?: string;
  nota?: string;
};

export type PagoOut = {
  id_pago: number;
  id_venta: number;
  monto: number;
  estado_venta: string;
};

export type VentaResumenOut = {
  id_venta: number;
  id_sorteo: number;
  estado: string;
  total: number;
  abonado: number;
  saldo: number;
  cliente_nombre?: string | null;
  cliente_celular?: string | null;
};

export function crearVenta(payload: VentaCreateIn) {
  return apiPost<VentaOut>("/api/v1/ventas", payload);
}

export function pagarVenta(id_venta: number, payload: PagoIn) {
  return apiPost<PagoOut>(`/api/v1/ventas/${id_venta}/pagos`, payload);
}

export function obtenerResumenVenta(id_venta: number) {
  return apiGet<VentaResumenOut>(`/api/v1/ventas/${id_venta}/resumen`);
}

export function liberarCupo(id_venta: number) {
  return apiPost<{ ok: boolean }>(`/api/v1/ventas/${id_venta}/liberar`, {});
}

export function liberarVenta(id_venta: number) {
  return apiDelete<void>(`/api/v1/ventas/${id_venta}`);
}
