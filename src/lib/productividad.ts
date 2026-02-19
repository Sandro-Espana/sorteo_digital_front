export type ProductividadSorteoRow = {
  id_sorteo: number;
  sorteo: string;
  fecha: string | null;
  estado: string;
  total_vendido: number;
  total_abonado: number;
  saldo_total: number;
  ocupacion_porcentaje: number;
};

export type ProductividadVendedorRow = {
  vendedor_id: number | null;
  vendedor: string;
  ventas_realizadas: number;
  total_vendido: number;
  total_cobrado: number;
  saldo_total: number;
  efectividad_porcentaje: number;
};

export type ProductividadMensualResponse = {
  mes: number;
  anio: number;
  sorteos: unknown[];
  por_vendedor?: unknown[];
};

export type ProductividadSorteoResponse = {
  id_sorteo: number;
  sorteo: string;
  fecha: string | null;
  estado: string;
  total_vendido: number;
  total_abonado: number;
  saldo_total: number;
  ocupacion_porcentaje: number;
  por_vendedor?: unknown[];
  historial?: unknown[];
};
