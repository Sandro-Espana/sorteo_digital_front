"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, fetchWithTimeout } from "@/lib/api";
import { clearToken, getToken, isTokenExpired, setToken } from "@/lib/auth";

export type AuthStatus = "checking" | "logged_in" | "logged_out";

type AuthContextValue = {
  status: AuthStatus;
  userLogged: boolean;
  userName: string | null;
  refresh: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function validateToken(token: string): Promise<{ ok: boolean; userName: string | null }> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/auth/validate`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) return { ok: false, userName: null };
  try {
    const body: any = await res.json();
    const ok = body?.valid === true;
    const nameCandidate = body?.user?.nombre ?? null;
    const userName = typeof nameCandidate === "string" && nameCandidate.trim() ? nameCandidate.trim() : null;
    return { ok, userName };
  } catch {
    return { ok: true, userName: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [userName, setUserName] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setStatus("logged_out");
      setUserName(null);
      return;
    }

    if (isTokenExpired(token)) {
      clearToken();
      setStatus("logged_out");
      setUserName(null);
      return;
    }

    try {
      setStatus("checking");
      const v = await validateToken(token);
      if (!v.ok) {
        clearToken();
        setStatus("logged_out");
        setUserName(null);
        return;
      }
      setStatus("logged_in");
      setUserName(v.userName);
    } catch {
      clearToken();
      setStatus("logged_out");
      setUserName(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setStatus("logged_out");
    setUserName(null);
    if (typeof window !== "undefined") window.location.assign("/ganadores");
  }, []);

  const loginWithToken = useCallback(async (token: string) => {
    setToken(token);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      userLogged: status === "logged_in",
      userName,
      refresh,
      loginWithToken,
      logout,
    };
  }, [loginWithToken, logout, refresh, status, userName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
