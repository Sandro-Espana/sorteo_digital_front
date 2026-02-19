"use client";

import { useMemo, useState } from "react";
import { apiPost, apiPut } from "@/lib/api";
import { SORTEO_ID } from "@/lib/api";
import { useSorteosQuery } from "@/lib/useSorteosQuery";
import type { SorteoCreateIn, SorteoCreateOut } from "@/lib/sorteos";
import { SorteoCreateModal } from "@/components/SorteoCreateModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useEstadisticasPuestosQuery } from "@/lib/useEstadisticasPuestosQuery";
import { useDashboardVentasVendedoresQuery } from "@/lib/useDashboardVentasVendedoresQuery";

type EstadoSorteo = "ACTIVO" | "REALIZADO" | "CANCELADO";

function money(v: number | null | undefined) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function pct(v: number | null | undefined, digits = 0) {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return `${(n * 100).toFixed(digits)}%`;
}

function DonutPuestos({
  total,
  disponibles,
  reservados,
  vendidos,
  bloqueados,
  anulados,
}: {
  total: number;
  disponibles: number;
  reservados: number;
  vendidos: number;
  bloqueados: number;
  anulados: number;
}) {
  const safeTotal = total > 0 ? total : 1;
  const pDisp = Math.max(0, Math.min(100, (disponibles / safeTotal) * 100));
  const pRes = Math.max(0, Math.min(100, (reservados / safeTotal) * 100));
  const pVen = Math.max(0, Math.min(100, (vendidos / safeTotal) * 100));
  const pBlo = Math.max(0, Math.min(100, (bloqueados / safeTotal) * 100));
  const pAnu = Math.max(0, Math.min(100, (anulados / safeTotal) * 100));
  const sum = Math.max(0, Math.min(100, pVen + pRes + pDisp + pBlo + pAnu));

  const a1 = pVen;
  const a2 = a1 + pRes;
  const a3 = a2 + pDisp;
  const a4 = a3 + pBlo;
  const a5 = a4 + pAnu;

  const bg = `conic-gradient(#22c55e 0% ${a1}%, #f97316 ${a1}% ${a2}%, #e2e8f0 ${a2}% ${a3}%, #a855f7 ${a3}% ${a4}%, #ef4444 ${a4}% ${a5}%, transparent ${sum}% 100%)`;

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="h-16 w-16 rounded-full" style={{ background: bg }}>
          <div className="h-full w-full rounded-full flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-white" />
          </div>
        </div>

        <div className="text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span className="text-slate-700">Vendidos</span>
            <span className="font-bold text-slate-900">{vendidos}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-slate-700">Reservados</span>
            <span className="font-bold text-slate-900">{reservados}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
            <span className="text-slate-700">Disponibles</span>
            <span className="font-bold text-slate-900">{disponibles}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-slate-700">Bloqueados</span>
            <span className="font-bold text-slate-900">{bloqueados}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            <span className="text-slate-700">Anulados</span>
            <span className="font-bold text-slate-900">{anulados}</span>
          </div>
        </div>
      </div>

      {open ? (
        <div className="absolute left-0 top-full mt-2 w-max rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-lg z-10">
          <div className="font-bold text-slate-900 mb-1">Detalle</div>
          <div>Vendidos: {vendidos}</div>
          <div>Reservados: {reservados}</div>
          <div>Disponibles: {disponibles}</div>
          <div>Bloqueados: {bloqueados}</div>
          <div>Anulados: {anulados}</div>
        </div>
      ) : null}
    </div>
  );
}

function DashboardCharts({ idSorteo }: { idSorteo: number }) {
  const { data: stats, loading: statsLoading, error: statsError, isOffline: statsOffline, retry: statsRetry } = useEstadisticasPuestosQuery(idSorteo);
  const { data: vendData, loading: vendLoading, error: vendError, isOffline: vendOffline, retry: vendRetry } = useDashboardVentasVendedoresQuery(idSorteo);

  const vendorOnlySinVendedor = useMemo(() => {
    const rows = vendData?.vendedores ?? [];
    if (rows.length !== 1) return false;
    const r = rows[0];
    const id = r?.vendedor_id;
    const name = (r?.nombre ?? "").toLowerCase();
    return id === 0 || name.includes("sin vendedor");
  }, [vendData]);

  const maxVendor = useMemo(() => {
    const rows = vendData?.vendedores ?? [];
    return rows.reduce((m, r) => Math.max(m, (r.total_pagado ?? 0) + (r.total_abonado ?? 0)), 0);
  }, [vendData]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const totalPuestos = stats.total > 0 ? stats.total : 0;
    const disponibles = Math.max(0, stats.disponibles ?? 0);
    const reservados = Math.max(0, stats.reservados ?? 0);
    const vendidos = Math.max(0, stats.vendidos ?? 0);
    const bloqueados = Math.max(0, stats.bloqueados ?? 0);
    const anulados = Math.max(0, stats.anulados ?? 0);

    const sumaVerificada = Math.max(0, stats.suma_verificada ?? 0);
    const deltaOcupacion = sumaVerificada - totalPuestos;
    const ocupacionInconsistente = totalPuestos > 0 && Math.abs(deltaOcupacion) > 0;

    const ocupados = Math.max(0, totalPuestos - disponibles);
    const ocupacionPct = totalPuestos > 0 ? ocupados / totalPuestos : 0;

    const vendedores = vendData?.vendedores ?? [];
    const totalPagado = vendedores.reduce((a, r) => a + (r.total_pagado ?? 0), 0);
    const totalAbonado = vendedores.reduce((a, r) => a + (r.total_abonado ?? 0), 0);

    return {
      totalPuestos,
      disponibles,
      reservados,
      vendidos,
      bloqueados,
      anulados,
      sumaVerificada,
      ocupacionPct,
      totalPagado,
      totalAbonado,
      ocupacionInconsistente,
      deltaOcupacion,
    };
  }, [stats, vendData]);

  const vendedorMetrics = useMemo(() => {
    const rows = vendData?.vendedores ?? [];
    const totalPagado = rows.reduce((a, r) => a + (r.total_pagado ?? 0), 0);
    const denomTotalPagado = totalPagado > 0 ? totalPagado : 1;

    return rows
      .map((v) => {
        const pag = v.total_pagado ?? 0;
        const abo = v.total_abonado ?? 0;
        const total = pag + abo;
        const cobranza = total > 0 ? pag / total : 0;
        const contribPagado = pag / denomTotalPagado;
        const riesgoAbono = total > 0 ? abo / total : 0;

        return {
          ...v,
          pag,
          abo,
          total,
          cobranza,
          contribPagado,
          riesgoAbono,
          impactoOcupacion: pag + abo * 0.5,
        };
      })
      .sort((a, b) => b.impactoOcupacion - a.impactoOcupacion);
  }, [vendData]);

  const vendedoresByPagado = useMemo(() => {
    return [...vendedorMetrics].sort((a, b) => b.pag - a.pag);
  }, [vendedorMetrics]);

  const maxVendorY = useMemo(() => {
    const rows = vendedoresByPagado;
    return rows.reduce((m, v) => Math.max(m, v.pag ?? 0, v.abo ?? 0), 0);
  }, [vendedoresByPagado]);

  const barsValidation = useMemo(() => {
    if (!kpis) return null;
    const rows = vendedoresByPagado;
    const sumPag = rows.reduce((a, r) => a + (r.pag ?? 0), 0);
    const sumAbo = rows.reduce((a, r) => a + (r.abo ?? 0), 0);
    const badRows = rows.filter((r) => Math.abs((r.total ?? 0) - ((r.pag ?? 0) + (r.abo ?? 0))) > 0.0001);

    const diffPag = sumPag - (kpis.totalPagado ?? 0);
    const diffAbo = sumAbo - (kpis.totalAbonado ?? 0);
    const showGlobalMismatch = Math.abs(diffPag) > 1 || Math.abs(diffAbo) > 1;

    return {
      sumPag,
      sumAbo,
      diffPag,
      diffAbo,
      showGlobalMismatch,
      badRowsCount: badRows.length,
    };
  }, [kpis, vendedoresByPagado]);


  return (
    <div className="mb-0">
      <div className="rounded-lg border border-slate-200 bg-white p-2">
        {statsOffline || vendOffline ? (
          <div className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Sin conexión. Revisa tu internet.
          </div>
        ) : null}

        {statsError || vendError ? (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                statsRetry();
                vendRetry();
              }}
              className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              Reintentar
            </button>
            <div className="text-xs text-rose-700">{statsError ?? vendError}</div>
          </div>
        ) : null}

        {statsLoading || vendLoading ? (
          <div className="mt-1">
            <div className="h-4 w-44 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-56 bg-slate-200 rounded" />
          </div>
        ) : stats && kpis ? (
          <div className="mt-1 space-y-2">
            {kpis.ocupacionInconsistente ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <div className="font-bold">Validación de ocupación</div>
                <div>
                  La suma del backend no cuadra con el total de puestos. Total: {kpis.totalPuestos} | Vendidos: {kpis.vendidos} | Reservados: {kpis.reservados} | Disponibles: {kpis.disponibles} | Bloqueados: {kpis.bloqueados} | Anulados: {kpis.anulados}.
                </div>
                <div>
                  Δ (Suma verificada) - Total = <span className="font-bold">{kpis.deltaOcupacion}</span>.
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3">
                <div className="text-[11px] text-slate-600">Total ingresado</div>
                <div className="mt-1 text-lg font-extrabold text-green-700">{money(kpis.totalPagado + kpis.totalAbonado)}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 sm:p-3">
                <div className="text-[11px] text-slate-600">Total en cartera</div>
                <div className="mt-1 text-lg font-extrabold text-orange-700">{money(kpis.totalAbonado)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-2 sm:p-3">
                <div className="space-y-3">
                  <div className="w-full">
                    <DonutPuestos
                      total={kpis.totalPuestos}
                      disponibles={kpis.disponibles}
                      reservados={kpis.reservados}
                      vendidos={kpis.vendidos}
                      bloqueados={kpis.bloqueados}
                      anulados={kpis.anulados}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <div>Meta</div>
                        <div className="font-semibold text-slate-900">{pct(kpis.ocupacionPct, 0)}</div>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${Math.max(0, Math.min(100, kpis.ocupacionPct * 100))}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[11px] text-slate-600">Riesgo de no llenar</div>
                        <div
                          className={
                            "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold " +
                            (kpis.ocupacionPct < 0.25
                              ? "bg-orange-100 text-orange-900"
                              : kpis.ocupacionPct < 0.6
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900")
                          }
                        >
                          {kpis.ocupacionPct < 0.25 ? "ALTO" : kpis.ocupacionPct < 0.6 ? "MEDIO" : "BAJO"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-2 sm:p-3">
                {vendorOnlySinVendedor ? (
                  <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    El backend está devolviendo ventas sin vendedor asignado ("Sin vendedor"). Para comparar productividad por vendedor,
                    las ventas/pagos deben quedar asociadas a un vendedor.
                  </div>
                ) : null}

                {barsValidation?.showGlobalMismatch || (barsValidation?.badRowsCount ?? 0) > 0 ? (
                  <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <div className="font-bold">Validación</div>
                    {barsValidation?.showGlobalMismatch ? (
                      <div>
                        La suma por vendedor no coincide con el total global.
                        <span className="ml-1">Δ Pagado: {money(barsValidation?.diffPag ?? 0)} | Δ Abonado: {money(barsValidation?.diffAbo ?? 0)}</span>
                      </div>
                    ) : null}
                    {(barsValidation?.badRowsCount ?? 0) > 0 ? (
                      <div>Hay {barsValidation?.badRowsCount} vendedor(es) con total inconsistente (pagado + abonado ≠ total).</div>
                    ) : null}
                  </div>
                ) : null}

                {vendedoresByPagado.length ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-sm bg-green-500" />
                        Pagado
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-sm bg-orange-500" />
                        Abonado
                      </span>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <div className="min-w-max">
                        <div className="relative h-56 rounded-md border border-slate-200 bg-white px-3 pt-3 pb-2">
                          <div className="absolute inset-x-3 top-3 bottom-12 pointer-events-none">
                            <div className="h-full flex flex-col justify-between">
                              <div className="border-t border-slate-100" />
                              <div className="border-t border-slate-100" />
                              <div className="border-t border-slate-100" />
                              <div className="border-t border-slate-100" />
                            </div>
                          </div>

                          <div className="h-full flex items-end gap-6">
                            {vendedoresByPagado.slice(0, 10).map((v, idx) => {
                              const denom = maxVendorY > 0 ? maxVendorY : 1;
                              const pagH = Math.max(0, Math.min(100, (v.pag / denom) * 100));
                              const aboH = Math.max(0, Math.min(100, (v.abo / denom) * 100));

                              const pagPct = v.total > 0 ? v.pag / v.total : 0;
                              const aboPct = v.total > 0 ? v.abo / v.total : 0;

                              const showPagLabel = pagH >= 18;
                              const showAboLabel = aboH >= 18;

                              return (
                                <div key={String(v.vendedor_id ?? idx)} className="w-[96px] shrink-0">
                                  <div className="h-[150px] flex items-end justify-center gap-2">
                                    <div className="relative w-8 rounded-t bg-green-500" style={{ height: `${pagH}%` }}>
                                      {showPagLabel ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="text-[10px] font-extrabold text-white">{pct(pagPct, 0)}</div>
                                        </div>
                                      ) : null}
                                    </div>
                                    <div className="relative w-8 rounded-t bg-orange-500" style={{ height: `${aboH}%` }}>
                                      {showAboLabel ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="text-[10px] font-extrabold text-white">{pct(aboPct, 0)}</div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div className="mt-2 text-center">
                                    <div className="text-[10px] font-semibold text-slate-900 truncate" title={v.nombre}>
                                      {v.nombre}
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-600">Total: {money(v.total)}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">No hay datos de vendedores para este sorteo.</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-xs text-slate-600">Sin datos para mostrar.</div>
        )}
      </div>
    </div>
  );
}

export function SorteosPage() {
  const { items, loading, error, isOffline, retry, invalidate } = useSorteosQuery();

  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("Sorteo creado correctamente.");

  const lastSorteoId = useMemo(() => {
    const ids = items.map((s) => Number(s.id_sorteo)).filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? Math.max(...ids) : null;
  }, [items]);

  const currentSorteoName = useMemo(() => {
    if (!items.length) return null;
    const current = lastSorteoId ? items.find((s) => Number(s.id_sorteo) === lastSorteoId) : null;
    const name = (current?.nombre ?? "").trim();
    return name || null;
  }, [items, lastSorteoId]);

  const currentSorteoId = lastSorteoId ?? SORTEO_ID;

  const [updatingEstadoId, setUpdatingEstadoId] = useState<number | null>(null);
  const [estadoError, setEstadoError] = useState<string | null>(null);

  async function updateEstadoSorteo(idSorteo: number, estado: EstadoSorteo) {
    setUpdatingEstadoId(idSorteo);
    setEstadoError(null);
    try {
      await apiPut(`/api/sorteos/${encodeURIComponent(String(idSorteo))}/estado`, { estado });
      invalidate();
      retry();
    } catch (e: any) {
      setEstadoError(String(e?.message ?? "Error actualizando estado"));
    } finally {
      setUpdatingEstadoId(null);
    }
  }

  async function createSorteo(payload: SorteoCreateIn) {
    setSubmitting(true);
    setCreateError(null);
    try {
      const out = await apiPost<SorteoCreateOut>("/api/sorteos", payload);
      setOpenCreate(false);
      setConfirmMsg(`Sorteo creado: ${out.nombre} (${out.estado})`);
      setShowConfirm(true);
      invalidate();
      retry();
    } catch (e: any) {
      const msg = String(e?.message ?? "Error creando sorteo");
      if (msg.includes("403")) {
        setCreateError("Solo admin puede crear sorteos.");
      } else {
        setCreateError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const currentSorteoEstadoValue: EstadoSorteo = (() => {
    const current = items.find((s) => Number(s.id_sorteo) === Number(currentSorteoId));
    const estado = String((current as any)?.estado || "").toUpperCase();
    if (estado === "REALIZADO" || estado === "CANCELADO" || estado === "ACTIVO") return estado as EstadoSorteo;
    return "ACTIVO";
  })();

  return (
    <div className="w-full flex flex-col sm:min-h-screen">
      <div className="pb-0 sm:flex-1 sm:pb-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{currentSorteoName ?? "Sorteos"}</div>
          </div>

          <div className="flex-none flex items-center justify-end gap-2">
            {currentSorteoId ? (
              <select
                value={currentSorteoEstadoValue}
                onChange={(e) => updateEstadoSorteo(Number(currentSorteoId), e.target.value as EstadoSorteo)}
                disabled={updatingEstadoId === Number(currentSorteoId)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="REALIZADO">REALIZADO</option>
                <option value="CANCELADO">CANCELAR</option>
              </select>
            ) : null}

            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              title="Crear Sorteo"
              aria-label="Crear Sorteo"
              className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              +
            </button>
          </div>
        </div>

        {isOffline && (
          <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Sin conexión. Revisa tu internet.
          </div>
        )}

        {error && !loading && (
          <div className="mb-2">
            <button
              type="button"
              onClick={retry}
              className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className="w-full rounded-lg border border-slate-200 bg-white">
            <div className="p-4">
              <div className="h-4 w-40 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-56 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-44 bg-slate-200 rounded" />
            </div>
          </div>
        ) : null}

        {currentSorteoId ? <DashboardCharts idSorteo={currentSorteoId} /> : null}

        <SorteoCreateModal
          open={openCreate}
          onClose={() => {
            if (!submitting) setOpenCreate(false);
          }}
          onSubmit={createSorteo}
          submitting={submitting}
          error={createError}
        />

        <ConfirmModal open={showConfirm} title="Guardado" message={confirmMsg} onClose={() => setShowConfirm(false)} />
      </div>
    </div>
  );
}
