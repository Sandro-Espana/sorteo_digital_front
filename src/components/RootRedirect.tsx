"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function RootRedirect() {
  const router = useRouter();
  const { status, userLogged } = useAuth();

  useEffect(() => {
    if (status === "checking") return;
    if (userLogged) router.replace("/dashboard");
    else router.replace("/ganadores");
  }, [router, status, userLogged]);

  return null;
}
