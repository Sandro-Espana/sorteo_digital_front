export type GastoItem = {
  id_gasto: number;
  concepto: string;
  valor: number;
  observacion?: string | null;
  usuario_id: number | null;
  usuario_nombre?: string | null;
  created_at: string | null;
};
