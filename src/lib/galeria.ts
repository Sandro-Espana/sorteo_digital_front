export type GaleriaAnioItem = {
  anio: number;
  total_fotos?: number | null;
};

export type GaleriaAlbumCreateIn = {
  year: number;
};

export type GaleriaAlbumCreateOut = {
  id: number;
  year?: number;
  name?: string;
};

export type GaleriaFotoItem = {
  id_foto?: number;
  url_foto: string;
  description?: string | null;
  nombre_archivo?: string | null;
  mime_type?: string | null;
  created_at?: string | null;
  tamano_kb?: number | null;
  tamaño_kb?: number | null;
};
