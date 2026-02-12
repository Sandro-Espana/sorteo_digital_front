export type CarteraItem = {
  id_venta: number;
  puesto?: number | null;
  puestos?: number[];
  cliente_nombre: string;
  cliente_telefono?: string | null;
  total: number;
  abonado: number;
  saldo: number;
  vendedor_id?: number | null;
  vendedor_color?: string | null;
};

export type CarteraQuery = {
  nombre?: string;
  telefono?: string;
  debe?: boolean;
};

export function carteraQueryToSearchParams(query: CarteraQuery) {
  const params = new URLSearchParams();
  if (query.nombre) params.set("nombre", query.nombre);
  if (query.telefono) params.set("telefono", query.telefono);
  if (typeof query.debe === "boolean") params.set("debe", query.debe ? "true" : "false");
  return params;
}
