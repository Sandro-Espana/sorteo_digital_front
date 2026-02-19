"use client";

import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { PublicNavbar } from "@/components/PublicNavbar";

export function AppNavbar({ compact = false }: { compact?: boolean }) {
  const { userLogged } = useAuth();
  if (userLogged) return <Navbar compact={compact} />;
  return <PublicNavbar />;
}
