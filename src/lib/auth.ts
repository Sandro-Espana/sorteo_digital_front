export type LoginResponse = {
  access_token?: string;
  token?: string;
  jwt?: string;
  token_type?: string;
};

const TOKEN_KEYS = ["token", "access_token", "jwt"] as const;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v && v.trim()) return v;
  }
  return null;
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  for (const k of TOKEN_KEYS) window.localStorage.removeItem(k);
}

function base64UrlDecodeToJson(input: string): any {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const json = atob(padded);
  return JSON.parse(json);
}

export function getJwtPayload(token: string): any | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return base64UrlDecodeToJson(parts[1] ?? "");
  } catch {
    return null;
  }
}

export function getUserLabelFromToken(token: string): string | null {
  const p = getJwtPayload(token);
  const candidates = [p?.name, p?.nombre, p?.username, p?.user, p?.email, p?.sub];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return null;
}

export function getJwtExpMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = base64UrlDecodeToJson(parts[1] ?? "");
    const exp = payload?.exp;
    if (typeof exp !== "number" || !Number.isFinite(exp)) return null;
    return exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewMs: number = 30_000): boolean {
  const expMs = getJwtExpMs(token);
  if (expMs == null) return false;
  return Date.now() + skewMs >= expMs;
}

export function extractTokenFromLoginResponse(body: unknown): string | null {
  const b = body as LoginResponse | null | undefined;
  const token = b?.access_token || b?.token || b?.jwt;
  if (typeof token === "string" && token.trim()) return token;
  return null;
}
