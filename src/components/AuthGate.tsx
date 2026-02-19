"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, userLogged } = useAuth();

  const isPublicRoute = useMemo(() => {
    if (pathname === "/login") return true;
    if (pathname === "/") return true;
    if (pathname === "/ganadores") return true;
    if (pathname === "/sobre-nosotros") return true;
    return false;
  }, [pathname]);

  useEffect(() => {
    if (isPublicRoute) return;
    if (status === "checking") return;
    if (!userLogged) router.replace("/login");
  }, [isPublicRoute, router, status, userLogged]);

  if (!isPublicRoute && status === "checking") return null;
  return <>{children}</>;
}
