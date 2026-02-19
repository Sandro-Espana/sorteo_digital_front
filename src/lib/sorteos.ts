export type SorteoListItem = {
  id_sorteo: number;
  nombre: string;
  estado: string;
  fecha_hora_sorteo?: string | null;
  total_boletas?: number | null;
  oportunidades_por_boleta?: number | null;
  precio_boleta?: number | null;
  loteria_id?: number | null;
};

export type SorteoCreateIn = {
  nombre: string;
  fecha_hora_sorteo: string;
  premio?: string;
  total_boletas: number;
  oportunidades_por_boleta: number;
  precio_boleta: number;
  loteria_id?: number | null;
};

export type SorteoCreateOut = {
  id_sorteo: number;
  nombre: string;
  estado: string;
};
