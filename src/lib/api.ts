// src/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const SORTEO_ID = Number(process.env.NEXT_PUBLIC_SORTEO_ID ?? "1");
export const PRECIO_BOLETA = Number(process.env.NEXT_PUBLIC_PRECIO_BOLETA ?? "35000");

type ApiError = { detail?: string } | any;

const DEFAULT_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? "10000");

export async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));
  try {
    return await fetch(input, { ...(init ?? {}), signal: controller.signal });
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error("Tiempo de espera agotado. Revisa que el backend esté encendido (puerto 8000). ");
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("jwt")
  );
}

function authHeaders(): Record<string, string> | undefined {
  const token = getToken();
  if (!token) return undefined;
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    cache: "no-store",
    credentials: "include",
    headers: authHeaders(),
  });

  if (!res.ok) {
    let body: ApiError = {};
    try {
      body = await res.json();
    } catch {}
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPut<T>(path: string, payload: unknown): Promise<T> {
  const url = path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(authHeaders() ?? {}) },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let body: ApiError = {};
    try {
      body = await res.json();
    } catch {}
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPostFormData<T>(path: string, form: FormData): Promise<T> {
  const url = path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    credentials: "include",
    headers: { ...(authHeaders() ?? {}) },
    body: form,
  });

  if (!res.ok) {
    let body: ApiError = {};
    try {
      body = await res.json();
    } catch {}
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(authHeaders() ?? {}) },
  });

  if (!res.ok) {
    let body: ApiError = {};
    try {
      body = await res.json();
    } catch {}
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }

  // Algunos DELETE devuelven vacío
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const url = path.startsWith("/api/") ? path : `${API_BASE_URL}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(authHeaders() ?? {}) },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let body: ApiError = {};
    try {
      body = await res.json();
    } catch {}
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
