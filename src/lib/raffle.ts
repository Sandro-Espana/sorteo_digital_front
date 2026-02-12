import type { Seat, Slot, SlotStatus } from "./types";
import { apiGet, SORTEO_ID } from "./api";

// Tipo para la respuesta del sorteo
type SorteoInfo = {
  id_sorteo: number;
  premio?: string | null;
  valor_premio?: number | null;
  precio_boleta?: number | null;
  fecha_sorteo?: string | null;
  loteria_nombre?: string | null;
  // otras propiedades que pueda tener la tabla tb_sorteos
};

// Estado inicial estático (valores dinámicos)
const staticRaffleInfo = {
  title: "", // Sin título
  prizeText: "$ 5.000.000", // Se actualizará desde BD
  ticketPriceText: "$ 35.000", // Se actualizará desde BD
  drawDateText: "2 de Febrero de 2026", // Se actualizará desde BD
  drawIdText: "1",
  lotteryNameText: "",
  ruleText: "",
};

// Estado dinámico que se actualizará con datos del backend
let dynamicRaffleInfo = { ...staticRaffleInfo };

function formatDateOnly(input: string): string {
  const trimmed = input.trim();

  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m?.[1]) return m[1];

  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }

  return trimmed;
}

// Función para obtener los valores dinámicos desde la base de datos
export async function fetchRaffleData(): Promise<void> {
  try {
    const data = await apiGet<SorteoInfo>(`/api/v1/sorteos/${SORTEO_ID}`);
    if (data) {
      // Actualizar solo los valores dinámicos
      if (data.id_sorteo) {
        dynamicRaffleInfo.drawIdText = String(data.id_sorteo);
      }
      if (data.loteria_nombre) {
        dynamicRaffleInfo.lotteryNameText = data.loteria_nombre;
      }
      if (data.valor_premio) {
        dynamicRaffleInfo.prizeText = `$ ${data.valor_premio.toLocaleString("es-CO")}`;
      }
      if (data.precio_boleta) {
        dynamicRaffleInfo.ticketPriceText = `$ ${data.precio_boleta.toLocaleString("es-CO")}`;
      }
      if (data.fecha_sorteo) {
        // Formatear fecha si es necesario
        dynamicRaffleInfo.drawDateText = formatDateOnly(data.fecha_sorteo);
      }
    }
  } catch (error) {
    console.warn("No se pudo obtener los datos del sorteo, usando valores por defecto:", error);
    // Mantenemos los valores estáticos si falla la API
  }
}

// Exportamos la información del sorteo (título estático, valores dinámicos)
export const raffleInfo = dynamicRaffleInfo;

// Función para actualizar manualmente si es necesario
export function updateRaffleData(prize?: number, ticketPrice?: number, drawDate?: string) {
  if (prize) dynamicRaffleInfo.prizeText = `$ ${prize.toLocaleString("es-CO")}`;
  if (ticketPrice) dynamicRaffleInfo.ticketPriceText = `$ ${ticketPrice.toLocaleString("es-CO")}`;
  if (drawDate) dynamicRaffleInfo.drawDateText = drawDate;
}

function to3(n: number) {
  return String(n).padStart(3, "0");
}

// (Opcional) para que se vea “lleno” como en la imagen con algunos ocupados
function demoStatus(n: number): SlotStatus {
  if (n % 17 === 0) return "PAGADO";
  if (n % 11 === 0) return "RESERVADO";
  return "DISPONIBLE";
}

export function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  for (let i = 0; i < 500; i++) { // Mantenemos 500 puestos totales
    const aNum = i * 2;       // 0,2,4...
    const bNum = i * 2 + 1;   // 1,3,5...

    const chanceA: Slot = { number: to3(aNum), status: demoStatus(aNum) };
    const chanceB: Slot = { number: to3(bNum), status: demoStatus(bNum) };

    seats.push({
      id: i + 1,
      status: demoStatus(i + 1), // Agregar el status basado en el ID del puesto
      chanceA,
      chanceB,
    });
  }
  return seats;
}
