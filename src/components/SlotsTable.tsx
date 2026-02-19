"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, API_BASE_URL, SORTEO_ID } from "@/lib/api";
import { puestoClasificadoToSeat, type PuestoClasificadoOut } from "@/lib/adapters";
import type { Seat } from "@/lib/types";
import { crearVenta, pagarVenta, obtenerResumenVenta, liberarCupo } from "@/lib/sales";
import { RaffleHeader } from "@/components/RaffleHeader";
import { DigitalRaffleGrid } from "@/components/DigitalRaffleGrid";
import { SaleModal } from "@/components/SaleModal";
import { AbonoModal } from "./AbonoModal";
import { SeatContextModal } from "./SeatContextModal";
import { PuestosFooter } from "@/components/PuestosFooter";
import type { SeatStatus } from "@/components/SeatCircle";
import {
  type ClienteForm,
  validateCliente,
  isEmptyErrors,
  normalizeClienteForm,
} from "@/lib/validators";

function seatIsDisponible(seat: Seat) {
  if (typeof seat?.can_venderse === "boolean") return seat.can_venderse;
  const estado = String(seat?.estado_actual ?? seat?.status ?? "").toUpperCase();
  return estado === "DISPONIBLE";
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm outline-none",
    hasError ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-slate-300 focus:ring-2 focus:ring-slate-200",
  ].join(" ");
}

export function SlotsTable() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paidMessage, setPaidMessage] = useState<string | null>(null);

  const [currentSorteoId, setCurrentSorteoId] = useState<number>(SORTEO_ID);

  // ✅ selección de puestos
  const [selected, setSelected] = useState<number[]>([]);

  // ✅ form cliente + touched (para UX)
  const [cliente, setCliente] = useState<ClienteForm>({
    nombres: "",
    apellidos: "",
    celular: "",
    email: "",
    direccion: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof ClienteForm, boolean>>>({});

  // ✅ estado de request
  const [submitting, setSubmitting] = useState(false);

  // ✅ estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [abonoInicial, setAbonoInicial] = useState<string>("");
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [abonoSeat, setAbonoSeat] = useState<Seat | null>(null);

  const [isSeatContextOpen, setIsSeatContextOpen] = useState(false);
  const [contextSeat, setContextSeat] = useState<Seat | null>(null);

  async function refreshSeats(idSorteo: number) {
    const data = await apiGet<any>(`/api/sorteos/${encodeURIComponent(String(idSorteo))}/puestos-clasificados`);
    const puestos = Array.isArray(data?.puestos) ? (data.puestos as PuestoClasificadoOut[]) : null;
    if (!puestos) {
      throw new Error(
        `Respuesta inesperada del endpoint /api/sorteos/${encodeURIComponent(String(idSorteo))}/puestos-clasificados. Se esperaba un objeto { puestos: [] }.`
      );
    }

    const mapped = puestos.map(puestoClasificadoToSeat);
    setSeats(mapped);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        let idSorteo = SORTEO_ID;
        try {
          const sorteos = await apiGet<unknown>("/api/sorteos");
          const arr = Array.isArray(sorteos)
            ? (sorteos as any[])
            : Array.isArray((sorteos as any)?.sorteos)
              ? (sorteos as any).sorteos
              : [];
          const activos = arr
            .filter((s: any) => String(s?.estado ?? "").toUpperCase() === "ACTIVO")
            .map((s: any) => Number(s?.id_sorteo ?? s?.id))
            .filter((n: any) => Number.isFinite(n) && n > 0)
            .sort((a: number, b: number) => b - a);
          if (activos.length) idSorteo = activos[0];
        } catch {}

        if (!alive) return;
        setCurrentSorteoId(idSorteo);
        await refreshSeats(idSorteo);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando puestos");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!paidMessage) return;
    const t = setTimeout(() => setPaidMessage(null), 2500);
    return () => clearTimeout(t);
  }, [paidMessage]);

  // ✅ validación reactiva
  const clienteErrors = useMemo(() => validateCliente(cliente), [cliente]);
  const clienteOk = useMemo(() => isEmptyErrors(clienteErrors), [clienteErrors]);

  // ✅ total estimado
  const totalEstimado = useMemo(() => {
    const precio = 35000;
    return selected.length * precio;
  }, [selected]);

  // ✅ regla final para habilitar botón
  const canCreateVenta = selected.length > 0 && clienteOk && !submitting && !loading;

  const seatStatusByNumber = useMemo(() => {
    const m: Record<number, SeatStatus> = {};
    for (const s of seats) {
      if (s.is_disponible) {
        m[s.id] = "available";
        continue;
      }
      if (s.is_bloqueado || s.is_anulado) {
        m[s.id] = "blocked";
        continue;
      }
      if (s.is_vendido) {
        m[s.id] = "sold";
        continue;
      }
      if (s.is_reservado) {
        m[s.id] = "reserved";
        continue;
      }
      const st = s.status ?? "DISPONIBLE";
      if (st === "DISPONIBLE") m[s.id] = "available";
      else if (st === "RESERVADO") m[s.id] = "reserved";
      else if (st === "BLOQUEADO" || st === "ANULADO") m[s.id] = "blocked";
      else m[s.id] = "sold";
    }
    return m;
  }, [seats]);

  function toggleSeat(seat: Seat) {
    if (!seatIsDisponible(seat)) return;

    setSelected((prev) => {
      const exists = prev.includes(seat.id);
      if (exists) return prev.filter((x) => x !== seat.id);
      return [...prev, seat.id].sort((a, b) => a - b);
    });

    // Abrir modal al seleccionar un puesto
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function getToken() {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("jwt")
    );
  }

  async function downloadComprobante(idVenta: number) {
    const url = `${API_BASE_URL}/api/ventas/${encodeURIComponent(String(idVenta))}/comprobante.png`;
    const token = getToken();

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) throw new Error("No se pudo generar el comprobante");

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `comprobante_venta_${idVenta}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objectUrl);
  }

  function cancelProceso() {
    setSelected([]);
    setCliente({
      nombres: "",
      apellidos: "",
      celular: "",
      email: "",
      direccion: "",
    });
    setTouched({});
    setAbonoInicial("");
    closeModal();
  }

  function onRemoveSeat(seatNumber: number) {
    setSelected((prev) => prev.filter((x) => x !== seatNumber));
  }

  async function onCrearVenta() {
    if (!canCreateVenta) {
      setTouched({
        nombres: true,
        apellidos: true,
        celular: true,
        direccion: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const c = normalizeClienteForm(cliente);

      const payload = {
        id_sorteo: currentSorteoId,
        puestos: selected,
        cliente: {
          nombres: c.nombres,
          apellidos: c.apellidos || undefined,
          celular: c.celular || undefined,
          email: c.email || undefined,
          direccion: c.direccion || undefined,
        },
      };

      const venta = await crearVenta(payload);

      // UX: cerrar el modal apenas se crea la venta
      closeModal();

      // Descargar comprobante sin bloquear el render
      window.setTimeout(() => {
        downloadComprobante(venta.id_venta).catch(() => {
          // silencioso: no bloquea la venta
        });
      }, 0);

      const monto = Number(abonoInicial.replace(/[^0-9]/g, ""));
      if (Number.isFinite(monto) && monto > 0) {
        await pagarVenta(venta.id_venta, { monto });
      }

      await refreshSeats(currentSorteoId);
      setSelected([]);
      setCliente({
        nombres: "",
        apellidos: "",
        celular: "",
        email: "",
        direccion: "",
      });
      setTouched({});
      setAbonoInicial("");
    } catch (e: any) {
      setError(e?.message ?? "Error creando venta");
    } finally {
      setSubmitting(false);
    }
  }

  function closeAbonoModal() {
    setIsAbonoModalOpen(false);
    setAbonoSeat(null);
  }

  function closeSeatContextModal() {
    setIsSeatContextOpen(false);
    setContextSeat(null);
  }

  function openSeatContextModal(seat: Seat) {
    setContextSeat(seat);
    setIsSeatContextOpen(true);
  }

  async function onRegistrarAbono(monto: number) {
    if (!abonoSeat?.id_venta) {
      setError("No se encontró la venta asociada a este puesto.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await pagarVenta(abonoSeat.id_venta, { monto });
      await refreshSeats(currentSorteoId);
      closeAbonoModal();
    } catch (e: any) {
      setError(e?.message ?? "Error registrando abono");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden pt-0">
      {/* Header - Altura fija */}
      <header className="flex-shrink-0 mb-1">
        <RaffleHeader />
      </header>

      {(error || loading) && (
        <div className="mx-auto w-full max-w-md px-2">
          {error && (
            <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/80">
              Cargando puestos...
            </div>
          )}
        </div>
      )}

      {!loading && !error && seats.length === 0 && (
        <div className="mx-auto w-full max-w-md px-2">
          <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            No hay puestos para mostrar. El endpoint /api/sorteos/{String(currentSorteoId)}/puestos-clasificados está respondiendo vacío.
            Revisa en la BD/Backend que el sorteo tenga generados sus puestos (por ejemplo, que total_boletas no sea 0).
          </div>
        </div>
      )}

      {/* Grid - Ocupa TODO el alto disponible SIN centrado */}
      <main className="flex-1 overflow-hidden">
        <div className="relative h-full flex items-start justify-center px-2 pt-0 pb-1">
          <div className="pointer-events-none absolute inset-0 opacity-100 [backdrop-filter:blur(6px)]" />
          <div className="relative w-full">
            <DigitalRaffleGrid 
              onSeatSelect={(seatNumber) => {
                const seat = seats.find((s) => s.id === seatNumber);
                if (!seat) {
                  setError(`No se encontró el puesto ${String(seatNumber).padStart(2, "0")} en la lista cargada. Verifica el endpoint /api/sorteos/${String(currentSorteoId)}/puestos-clasificados.`);
                  return;
                }
                if (seatIsDisponible(seat)) {
                  toggleSeat(seat);
                  return;
                }

                openSeatContextModal(seat);
              }}
              selectedSeats={selected}
              seatStatusByNumber={seatStatusByNumber}
              seatNumbers={seats.map((s) => s.id)}
              size="sm"
            />
          </div>
        </div>
      </main>

      {paidMessage && (
        <div className="mx-auto w-full max-w-md px-2">
          <div className="mb-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 text-center">
            {paidMessage}
          </div>
        </div>
      )}

      {/* Footer - Altura fija */}
      <div className="flex-shrink-0 mt-1">
        <PuestosFooter />
      </div>

      {/* Modal de venta */}
      <SaleModal
        isOpen={isModalOpen}
        onBackToGrid={closeModal}
        onCancel={cancelProceso}
        selectedCount={selected.length}
        totalEstimado={totalEstimado}
        selectedSeats={selected}
        abonoInicial={abonoInicial}
        setAbonoInicial={setAbonoInicial}
        onRemoveSeat={onRemoveSeat}
        cliente={cliente}
        setCliente={setCliente}
        touched={touched}
        setTouched={setTouched}
        clienteErrors={clienteErrors}
        onCrearVenta={onCrearVenta}
        canCreateVenta={canCreateVenta}
        submitting={submitting}
        inputClass={inputClass}
      />

      <AbonoModal
        isOpen={isAbonoModalOpen}
        onClose={closeAbonoModal}
        seat={abonoSeat}
        submitting={submitting}
        onRegistrarAbono={onRegistrarAbono}
      />

      <SeatContextModal
        isOpen={isSeatContextOpen}
        onClose={closeSeatContextModal}
        seat={contextSeat}
        submitting={submitting}
        loadResumen={obtenerResumenVenta}
        onLiberarCupo={async () => {
          if (!contextSeat?.id_venta) {
            setError("No se encontró la venta asociada a este puesto.");
            return;
          }

          try {
            setSubmitting(true);
            setError(null);
            await liberarCupo(contextSeat.id_venta);
            await refreshSeats(currentSorteoId);
            closeSeatContextModal();
          } catch (e: any) {
            setError(e?.message ?? "Error liberando cupo");
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
