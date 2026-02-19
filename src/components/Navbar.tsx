"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { raffleInfo, fetchRaffleData } from "@/lib/raffle";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiGet, apiPost } from "@/lib/api";

const navItems = [
  { name: "Galeria", href: "/galeria" },
  { name: "Sorteos", href: "/sorteos" },
  { name: "Puestos", href: "/puestos" },
  { name: "Cartera", href: "/cartera" },
  { name: "Gastos", href: "/gastos" },
  { name: "Productividad", href: "/productividad" },
  { name: "Socios", href: "/conferencias" },
];

const meses = [
  { n: 1, label: "Enero" },
  { n: 2, label: "Febrero" },
  { n: 3, label: "Marzo" },
  { n: 4, label: "Abril" },
  { n: 5, label: "Mayo" },
  { n: 6, label: "Junio" },
  { n: 7, label: "Julio" },
  { n: 8, label: "Agosto" },
  { n: 9, label: "Septiembre" },
  { n: 10, label: "Octubre" },
  { n: 11, label: "Noviembre" },
  { n: 12, label: "Diciembre" },
];

export function Navbar({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductividadOpen, setIsProductividadOpen] = useState(false);
  const { logout, userName } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isHorarioOpen, setIsHorarioOpen] = useState(false);

  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    fecha_vencimiento: "",
    id_usuario_asignado: "",
  });

  const [horarioSubmitting, setHorarioSubmitting] = useState(false);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [horarioSuccess, setHorarioSuccess] = useState<string | null>(null);
  const [horarioForm, setHorarioForm] = useState({
    hora: "",
    lugar: "",
  });

  const compactMode = compact || pathname === "/sorteos";

  // Cargar los datos dinámicos desde la base de datos
  useEffect(() => {
    fetchRaffleData();
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProductividadOpen(false);
    setIsAccountOpen(false);
    setIsTasksOpen(false);
    setIsHorarioOpen(false);
    setTasksError(null);
    setTaskSuccess(null);
    setHorarioError(null);
    setHorarioSuccess(null);
    setCreateTaskOpen(false);
  }, [pathname]);

  async function loadTasks() {
    try {
      setTasksLoading(true);
      setTasksError(null);
      const res = await apiGet<{ tareas?: any[] }>("/api/tareas");
      setTasks(Array.isArray(res?.tareas) ? res.tareas : []);
    } catch (e: any) {
      setTasksError(e?.message ?? "Error cargando tareas");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    if (!isTasksOpen) return;
    loadTasks();
  }, [isTasksOpen]);

  const canCreateTask = useMemo(() => {
    const t = taskForm.titulo.trim();
    return t.length > 0 && t.length <= 20 && !taskSubmitting;
  }, [taskForm.titulo, taskSubmitting]);

  async function onCreateTask() {
    if (!canCreateTask) return;
    try {
      setTaskSubmitting(true);
      setTasksError(null);
      setTaskSuccess(null);

      const titulo = taskForm.titulo.trim();
      const payload: any = {
        titulo,
        descripcion: taskForm.descripcion.trim() ? taskForm.descripcion.trim() : undefined,
        prioridad: taskForm.prioridad || "MEDIA",
        fecha_vencimiento: taskForm.fecha_vencimiento
          ? new Date(taskForm.fecha_vencimiento).toISOString()
          : undefined,
        id_usuario_asignado: taskForm.id_usuario_asignado.trim()
          ? Number(taskForm.id_usuario_asignado.trim())
          : undefined,
      };

      await apiPost("/api/tareas", payload);
      setTaskSuccess("Tarea creada.");
      setTaskForm({ titulo: "", descripcion: "", prioridad: "MEDIA", fecha_vencimiento: "", id_usuario_asignado: "" });
      setCreateTaskOpen(false);
      await loadTasks();
    } catch (e: any) {
      setTasksError(e?.message ?? "Error creando tarea");
    } finally {
      setTaskSubmitting(false);
    }
  }

  const canCreateHorario = useMemo(() => {
    return horarioForm.hora.trim().length > 0 && horarioForm.lugar.trim().length > 0 && !horarioSubmitting;
  }, [horarioForm.hora, horarioForm.lugar, horarioSubmitting]);

  const todayDate = useMemo(() => {
    const d = new Date();
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  }, []);

  async function onCreateHorario() {
    if (!canCreateHorario) return;
    try {
      setHorarioSubmitting(true);
      setHorarioError(null);
      setHorarioSuccess(null);

      const horaRaw = horarioForm.hora.trim();
      const hora = horaRaw.length === 5 ? `${horaRaw}:00` : horaRaw;

      const payload: any = {
        hora,
        lugar: horarioForm.lugar.trim(),
      };

      await apiPost("/api/horarios", payload);
      setHorarioSuccess("Horario registrado.");
      setHorarioForm({ hora: "", lugar: "" });
    } catch (e: any) {
      setHorarioError(e?.message ?? "Error registrando horario");
    } finally {
      setHorarioSubmitting(false);
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-b from-[#001235] via-[#0A2C63] to-[#001a4a] shadow-sm relative z-50">
      <div className={compactMode ? "relative h-16 pt-2" : "relative h-40 pt-2 md:h-36 md:pt-4"}>
        <div className="pointer-events-none absolute inset-0 md:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-white/10 to-black/8" />
        </div>

        {compactMode ? (
          <div className="absolute inset-0 flex items-end justify-center px-14 pb-3">
            <div
              className="text-center whitespace-nowrap font-bold"
              style={{
                backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "1.2px black",
                textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                letterSpacing: "-0.02em",
                fontFamily: "'Times New Roman', Georgia, serif",
                fontSize: "clamp(22px, 5.4vw, 30px)",
                lineHeight: "1",
              }}
            >
              Inversiones Gasca
            </div>
          </div>
        ) : (
          <>
            <div className="absolute left-1/2 top-[54%] transform -translate-x-1/2 -translate-y-1/2 md:hidden">
              <Link href="/dashboard" className="relative flex flex-col items-center">
                <div className="relative mt-0">
                  <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 z-10">
                    <div
                      className="text-center whitespace-nowrap font-bold"
                      style={{
                        backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        WebkitTextStroke: "1.5px black",
                        textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Times New Roman', Georgia, serif",
                        fontSize: "clamp(42px, 8.2vw, 50px)",
                        lineHeight: "1",
                      }}
                    >
                      Inversiones Gasca
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute left-1/2 top-[99%] -translate-x-1/2 z-10 whitespace-nowrap text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                    style={{
                      fontFamily: "var(--font-script)",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      fontSize: "clamp(24px, 4.8vw, 28px)",
                      lineHeight: "1",
                    }}
                  >
                    Haciendo felices ganadores
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full blur-2xl bg-white/10" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full blur-xl bg-sky-400/14" />
                  <img
                    src="/logo.png"
                    alt="Logo Inversiones Gasca"
                    className="relative mt-6 h-36 w-auto object-contain [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.28))]"
                  />
                </div>
              </Link>
            </div>

            <div className="absolute left-0 top-0 h-full hidden md:flex items-center px-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Logo Inversiones Gasca"
                  className="h-32 w-auto object-contain [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.35))]"
                />
                <div className="flex flex-col">
                  <div
                    className="whitespace-nowrap font-bold leading-none"
                    style={{
                      backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      WebkitTextStroke: "1.5px black",
                      textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                      letterSpacing: "-0.02em",
                      fontFamily: "'Times New Roman', Georgia, serif",
                      fontSize: "clamp(22px, 2.2vw, 34px)",
                    }}
                  >
                    Inversiones Gasca
                  </div>
                  <div
                    className="whitespace-nowrap text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                    style={{
                      fontFamily: "var(--font-script)",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      fontSize: "clamp(14px, 1.4vw, 18px)",
                      lineHeight: "1",
                    }}
                  >
                    Haciendo felices ganadores
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* Mobile menu button - IZQUIERDA */}
        <div className={compactMode ? "absolute right-0 top-0 h-full flex items-start pt-1 pr-2 pl-1" : "absolute right-0 top-0 h-full flex items-start pt-12 pr-2 pl-1 md:hidden"}>
          <button 
            onClick={toggleMobileMenu}
            className="w-11 h-11 rounded-full bg-white/10 text-yellow-100/95 hover:text-yellow-100 hover:bg-white/15 transition-colors flex items-center justify-center"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation - OCULTO en móvil */}
        <div className="absolute right-0 top-0 h-full flex items-center px-4 hidden md:flex">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-200"
                      : "text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setIsTasksOpen(true)}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
            >
              Tareas
            </button>

            <button
              type="button"
              onClick={() => setIsHorarioOpen(true)}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
            >
              Horario
            </button>

            <button
              type="button"
              onClick={() => setIsAccountOpen((v) => !v)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isAccountOpen
                  ? "bg-white/10 text-yellow-100"
                  : "text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
              }`}
            >
              {userName ? userName : "Acceder"}
            </button>

            {isAccountOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAccountOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl overflow-hidden">
                  {userName ? (
                    <div className="px-4 py-3 text-sm font-bold text-white/90 border-b border-white/10 truncate">
                      {userName}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-200 hover:bg-white/10"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay semi-transparente */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Menú lateral */}
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-black/95 shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col p-4 space-y-2">
              {navItems
                .filter((i) => i.name !== "Productividad")
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-yellow-500/20 text-yellow-200"
                          : "text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.name}
                    </Link>
                  );
                })}

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsTasksOpen(true);
                }}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
              >
                Tareas
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsHorarioOpen(true);
                }}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
              >
                Horario
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setIsAccountOpen(true);
                }}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
              >
                {userName ? userName : "Acceder"}
              </button>

              {isAccountOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={() => {
                      setIsAccountOpen(false);
                      closeMobileMenu();
                    }}
                  />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 text-sm font-bold text-white/90 truncate">{userName ? userName : "Cuenta"}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        closeMobileMenu();
                        logout();
                      }}
                      className="w-full text-left px-4 py-4 text-sm font-semibold text-red-200 hover:bg-white/10"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setIsProductividadOpen((v) => !v)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  pathname.startsWith("/productividad")
                    ? "bg-yellow-500/20 text-yellow-200"
                    : "text-yellow-100/80 hover:text-yellow-100 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>Productividad</span>
                  <span className="text-yellow-100/70">{isProductividadOpen ? "–" : "+"}</span>
                </div>
              </button>

              {isProductividadOpen && (
                <div className="pl-3 space-y-1">
                  {meses.map((m) => (
                    <Link
                      key={m.n}
                      href={`/productividad/${new Date().getFullYear()}/${m.n}`}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === `/productividad/${new Date().getFullYear()}/${m.n}`
                          ? "bg-white/10 text-yellow-100"
                          : "text-yellow-100/75 hover:text-yellow-100 hover:bg-white/10"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {isTasksOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsTasksOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
              <div className="text-sm font-bold text-white/90">Tareas</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadTasks()}
                  className="h-9 px-3 rounded-md text-xs font-bold text-yellow-100/90 hover:text-yellow-100 hover:bg-white/10"
                >
                  Recargar
                </button>
                <button
                  type="button"
                  onClick={() => setIsTasksOpen(false)}
                  className="h-9 px-3 rounded-md text-xs font-bold text-yellow-100/90 hover:text-yellow-100 hover:bg-white/10"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-3">
              {tasksError ? (
                <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
                  {tasksError}
                </div>
              ) : null}

              {taskSuccess ? (
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-100">
                  {taskSuccess}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-white/70">Asignadas a ti</div>
                <button
                  type="button"
                  onClick={() => setCreateTaskOpen((v) => !v)}
                  className="h-9 px-3 rounded-md text-xs font-bold bg-yellow-500/20 text-yellow-100 hover:bg-yellow-500/25"
                >
                  Crear tarea
                </button>
              </div>

              {createTaskOpen ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      value={taskForm.titulo}
                      onChange={(e) => setTaskForm((p) => ({ ...p, titulo: e.target.value }))}
                      placeholder="Título (máx 20)"
                      maxLength={20}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                    />
                    <textarea
                      value={taskForm.descripcion}
                      onChange={(e) => setTaskForm((p) => ({ ...p, descripcion: e.target.value }))}
                      placeholder="Descripción (opcional)"
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none min-h-[72px]"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={taskForm.prioridad}
                        onChange={(e) => setTaskForm((p) => ({ ...p, prioridad: e.target.value }))}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                      >
                        <option value="BAJA">BAJA</option>
                        <option value="MEDIA">MEDIA</option>
                        <option value="ALTA">ALTA</option>
                        <option value="URGENTE">URGENTE</option>
                      </select>

                      <input
                        value={taskForm.id_usuario_asignado}
                        onChange={(e) => setTaskForm((p) => ({ ...p, id_usuario_asignado: e.target.value }))}
                        placeholder="ID usuario (opcional)"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>

                    <input
                      type="datetime-local"
                      value={taskForm.fecha_vencimiento}
                      onChange={(e) => setTaskForm((p) => ({ ...p, fecha_vencimiento: e.target.value }))}
                      className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateTaskOpen(false)}
                      className="h-9 px-3 rounded-md text-xs font-bold text-white/80 hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateTask()}
                      disabled={!canCreateTask}
                      className={`h-9 px-3 rounded-md text-xs font-bold ${
                        canCreateTask
                          ? "bg-white text-slate-900 hover:bg-slate-100"
                          : "bg-white/10 text-white/40 cursor-not-allowed"
                      }`}
                    >
                      {taskSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="max-h-[44vh] overflow-auto rounded-xl border border-white/10">
                {tasksLoading ? (
                  <div className="px-3 py-3 text-sm text-white/70">Cargando...</div>
                ) : tasks.length ? (
                  <div className="divide-y divide-white/10">
                    {tasks.map((t: any) => (
                      <div key={String(t?.id_tarea)} className="px-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-semibold text-white/90 truncate">{t?.titulo}</div>
                          <div className="text-[11px] text-white/60 shrink-0">#{t?.id_tarea}</div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">{t?.estado}</span>
                          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">{t?.prioridad}</span>
                          {t?.fecha_vencimiento ? (
                            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Vence: {String(t.fecha_vencimiento).slice(0, 10)}</span>
                          ) : null}
                        </div>
                        {t?.descripcion ? (
                          <div className="mt-1 text-xs text-white/75 line-clamp-2">{t.descripcion}</div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-sm text-white/70">Sin tareas.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {isHorarioOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsHorarioOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
              <div className="text-sm font-bold text-white/90">Horario</div>
              <button
                type="button"
                onClick={() => setIsHorarioOpen(false)}
                className="h-9 px-3 rounded-md text-xs font-bold text-yellow-100/90 hover:text-yellow-100 hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              {horarioError ? (
                <div className="rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-100">
                  {horarioError}
                </div>
              ) : null}

              {horarioSuccess ? (
                <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-100">
                  {horarioSuccess}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-2">
                <input
                  type="date"
                  value={todayDate}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white/70 outline-none"
                />
                <input
                  type="time"
                  value={horarioForm.hora}
                  onChange={(e) => setHorarioForm((p) => ({ ...p, hora: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                />
                <input
                  value={horarioForm.lugar}
                  onChange={(e) => setHorarioForm((p) => ({ ...p, lugar: e.target.value }))}
                  placeholder="Lugar de trabajo"
                  maxLength={200}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHorarioOpen(false)}
                  className="h-9 px-3 rounded-md text-xs font-bold text-white/80 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => onCreateHorario()}
                  disabled={!canCreateHorario}
                  className={`h-9 px-3 rounded-md text-xs font-bold ${
                    canCreateHorario
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {horarioSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
