"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { raffleInfo, fetchRaffleData } from "@/lib/raffle";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Galeria", href: "/galeria" },
  { name: "Puestos", href: "/puestos" },
  { name: "Cartera", href: "/cartera" },
  { name: "Gastos", href: "/gastos" },
  { name: "Conferencias", href: "/conferencias" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cargar los datos dinámicos desde la base de datos
  useEffect(() => {
    fetchRaffleData();
  }, []);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-b from-[#001235] via-[#0A2C63] to-[#001a4a] shadow-sm relative z-50">
      <div className="relative h-40 pt-2 md:h-36 md:pt-4">
        <div className="pointer-events-none absolute inset-0 md:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-white/10 to-black/8" />
        </div>

        {/* Logo y Título - CENTRADO EXACTO AL GRID */}
        <div className="absolute left-1/2 top-[54%] md:top-[56%] transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="relative flex flex-col items-center">
            <div className="hidden md:block text-center">
              <h1
                className="mt-12 md:mt-0 text-xl md:text-4xl font-bold whitespace-nowrap leading-none"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: "1.5px black",
                  textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Times New Roman', Georgia, serif",
                }}
              >
                Inversiones Gasca
              </h1>
            </div>

            <div className="relative mt-0 md:mt-0">
              <div className="pointer-events-none absolute left-1/2 top-[-4px] -translate-x-1/2 md:hidden z-10">
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

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 md:h-28 md:w-28 rounded-full blur-2xl bg-white/10" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 md:h-28 md:w-28 rounded-full blur-xl bg-sky-400/14" />
              <img
                src="/logo.png"
                alt="Logo Inversiones Gasca"
                className="relative mt-6 h-36 md:mt-0 md:h-28 w-auto object-contain [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.28))]"
              />
            </div>
          </Link>
        </div>

        {/* Mobile menu button - IZQUIERDA */}
        <div className="absolute right-0 top-0 h-full flex items-start pt-12 pr-2 pl-1 md:hidden">
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
        <div className="absolute left-0 top-0 h-full flex items-center px-4 hidden md:flex">
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
              {navItems.map((item) => {
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
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
