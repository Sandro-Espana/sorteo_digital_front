// src/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const SORTEO_ID = Number(process.env.NEXT_PUBLIC_SORTEO_ID ?? "1");
export const PRECIO_BOLETA = Number(process.env.NEXT_PUBLIC_PRECIO_BOLETA ?? "35000");

type ApiError = { detail?: string } | any;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });

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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
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
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
