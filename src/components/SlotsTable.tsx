"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, SORTEO_ID } from "@/lib/api";
import { puestoToSeat, type PuestoOut } from "@/lib/adapters";
import type { Seat } from "@/lib/types";
import { crearVenta, pagarVenta, obtenerResumenVenta, liberarCupo } from "@/lib/sales";
import { RaffleHeader } from "@/components/RaffleHeader";
import { DigitalRaffleGrid } from "@/components/DigitalRaffleGrid";
import { SaleModal } from "@/components/SaleModal";
import { AbonoModal } from "./AbonoModal";
import { SeatContextModal } from "./SeatContextModal";
import { Footer } from "@/components/Footer";
import type { SeatStatus } from "@/components/SeatCircle";
import {
  type ClienteForm,
  validateCliente,
  isEmptyErrors,
  normalizeClienteForm,
} from "@/lib/validators";

function seatIsDisponible(seat: Seat) {
  const st = seat.status ?? "DISPONIBLE";
  return st === "DISPONIBLE" || st === "ANULADO";
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

  async function refreshSeats() {
    const data = await apiGet<unknown>(`/api/v1/sorteos/${SORTEO_ID}/puestos`);
    if (!Array.isArray(data)) {
      throw new Error(
        `Respuesta inesperada del endpoint /api/v1/sorteos/${SORTEO_ID}/puestos. Se esperaba un arreglo de puestos, pero llegó un objeto. Revisa NEXT_PUBLIC_API_BASE_URL y la ruta del backend.`
      );
    }

    const mapped = (data as PuestoOut[]).map(puestoToSeat);
    setSeats(mapped);
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        await refreshSeats();
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
      const st = s.status ?? "DISPONIBLE";
      const pendingBySaldo = typeof s.saldo === "number" && s.saldo > 0;
      const pendingByTotals =
        typeof s.total === "number" && typeof s.abonado === "number" && s.abonado < s.total;
      const pending = pendingBySaldo || pendingByTotals;
      if (st === "DISPONIBLE" || st === "ANULADO") m[s.id] = "available";
      else if (st === "RESERVADO" || pending) m[s.id] = "reserved";
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
        id_sorteo: SORTEO_ID,
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

      const monto = Number(abonoInicial.replace(/[^0-9]/g, ""));
      if (Number.isFinite(monto) && monto > 0) {
        await pagarVenta(venta.id_venta, { monto });
      }

      await refreshSeats();
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
      await refreshSeats();
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
            No hay puestos para mostrar. El endpoint /api/v1/sorteos/{SORTEO_ID}/puestos está respondiendo un arreglo vacío.
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
                  setError(`No se encontró el puesto ${String(seatNumber).padStart(2, "0")} en la lista cargada. Verifica el endpoint /api/v1/sorteos/${SORTEO_ID}/puestos.`);
                  return;
                }
                const st = seat.status ?? "DISPONIBLE";
                if (st === "DISPONIBLE" || st === "ANULADO") {
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
        <Footer />
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
            await refreshSeats();
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
