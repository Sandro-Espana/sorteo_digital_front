"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Ganadores", href: "/ganadores" },
  { name: "Conocenos", href: "/sobre-nosotros" },
  { name: "Acceder", href: "/login" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-gradient-to-b from-[#001235] via-[#0A2C63] to-[#001a4a] shadow-sm relative z-50">
      <div className="relative flex items-center justify-center min-h-[120px] py-1">
        <div className="pointer-events-none absolute inset-0 md:hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-white/10 to-black/8" />
        </div>

        <div className="absolute left-0 top-0 h-full items-center px-4 hidden md:flex">
          <Link href="/ganadores" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo Inversiones Gasca"
              className="h-32 w-auto object-contain [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.35))]"
            />
            <div className="flex flex-col">
              <div
                className="whitespace-nowrap font-semibold"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: "1.2px black",
                  textShadow: "0 2px 4px rgba(0,0,0,0.30)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontSize: "clamp(20px, 2.2vw, 26px)",
                  lineHeight: "1",
                }}
              >
                Sorteos Gasca
              </div>
              <div
                className="whitespace-nowrap text-white/65"
                style={{
                  fontFamily: "var(--font-script)",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  fontSize: "clamp(12px, 1.4vw, 14px)",
                  lineHeight: "1",
                }}
              >
                Haciendo felices ganadores
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center md:hidden">
          <div
            className="whitespace-nowrap font-semibold -mb-1"
            style={{
              backgroundImage: "linear-gradient(to bottom, #E31E24 0%, #E31E24 40%, #F9ED32 90%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextStroke: "1.2px black",
              textShadow: "0 2px 4px rgba(0,0,0,0.30)",
              letterSpacing: "-0.02em",
              fontFamily: "'Times New Roman', Georgia, serif",
              fontSize: "clamp(22px, 4.2vw, 32px)",
              lineHeight: "1",
            }}
          >
            Sorteos Gasca
          </div>

          <div className="py-0">
            <img
              src="/logo.png"
              alt="Logo Inversiones Gasca"
              className="h-24 w-auto object-contain [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.35))]"
            />
          </div>

          <div
            className="whitespace-nowrap text-white/65 -mt-1"
            style={{
              fontFamily: "var(--font-script)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              fontSize: "clamp(14px, 3.2vw, 18px)",
              lineHeight: "1",
            }}
          >
            Haciendo felices ganadores
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full flex items-start pt-2 pr-2 pl-1 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="w-11 h-11 rounded-full bg-white/10 text-yellow-100/95 hover:text-yellow-100 hover:bg-white/15 transition-colors flex items-center justify-center"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

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
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
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
                    onClick={() => setIsMobileMenuOpen(false)}
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
