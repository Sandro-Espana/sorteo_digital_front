"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, fetchWithTimeout } from "@/lib/api";
import { extractTokenFromLoginResponse } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";
import { ConfirmModal } from "@/components/ConfirmModal";

type FrontState = "IDLE" | "LOADING" | "SUCCESS" | "ERROR";

function isValidEmail(input: string) {
  const v = input.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function LoginPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<FrontState>("IDLE");
  const [error, setError] = useState<string | null>(null);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState("Error de autenticación");
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const canSubmit = useMemo(() => {
    return isValidEmail(username) && password.length > 0 && state !== "LOADING";
  }, [username, password, state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const u = username.trim();
    const p = password;

    if (!isValidEmail(u)) {
      setState("ERROR");
      setError("Debes ingresar un correo válido.");
      setErrorModalTitle("Usuario inválido");
      setErrorModalMessage("Debes ingresar un correo válido (por ejemplo: admin@correo.com).");
      setErrorModalOpen(true);
      return;
    }

    if (!p) {
      setState("ERROR");
      setError("Ingresa la contraseña.");
      setErrorModalTitle("Contraseña requerida");
      setErrorModalMessage("Ingresa tu contraseña para continuar.");
      setErrorModalOpen(true);
      return;
    }

    try {
      setState("LOADING");
      setError(null);

      const res = await fetchWithTimeout(`${API_BASE_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const body: any = await res.json();
          detail = body?.detail ?? body?.message ?? "";
        } catch {
          detail = "";
        }
        const rawMsg = (detail || "").toLowerCase();
        const isUserMissing = res.status === 404 || rawMsg.includes("no existe") || rawMsg.includes("not found") || rawMsg.includes("no encontrado");
        const isWrongPassword =
          res.status === 401 || rawMsg.includes("contraseña") || rawMsg.includes("password") || rawMsg.includes("invalid") || rawMsg.includes("incorrect");

        if (isUserMissing) {
          throw new Error("El usuario no está creado o no existe.");
        }

        if (isWrongPassword) {
          throw new Error("La contraseña es incorrecta.");
        }

        throw new Error(detail || `Credenciales inválidas (HTTP ${res.status}).`);
      }

      const body = (await res.json()) as unknown;
      const token = extractTokenFromLoginResponse(body);
      if (!token) {
        throw new Error("El backend no devolvió token. Revisa la respuesta de /api/login.");
      }

      await loginWithToken(token);
      setState("SUCCESS");
      router.replace("/dashboard");
    } catch (err: any) {
      setState("ERROR");
      const msg = String(err?.message ?? "Error de autenticación");
      setError(msg);
      setErrorModalTitle("Error de autenticación");
      setErrorModalMessage(msg);
      setErrorModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001235] via-[#0A2C63] to-[#001a4a] flex items-center justify-center px-4 py-10">
      <ConfirmModal
        open={errorModalOpen}
        title={errorModalTitle}
        message={errorModalMessage}
        onClose={() => setErrorModalOpen(false)}
      />

      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: "1.5px black",
                  textShadow: "0 2px 4px rgba(0,0,0,0.18)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Times New Roman', Georgia, serif",
                }}
              >
                Inversiones Gasca
              </div>
              <div className="mt-2 text-xs text-slate-600">Inicia sesión para continuar</div>
            </div>
          </div>

          <form onSubmit={submit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Usuario</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="admin@correo.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="w-full h-10 rounded-lg border border-slate-300 px-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                "w-full rounded-lg px-4 py-3 text-sm font-black transition-colors",
                canSubmit
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              {state === "LOADING" ? "Autenticando..." : "Ingresar"}
            </button>

            <div className="text-[11px] text-slate-500 text-center">
              Nunca guardamos tu contraseña.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
