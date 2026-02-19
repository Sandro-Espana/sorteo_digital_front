"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCarteleraQuery } from "@/lib/useCarteleraQuery";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function CarteleraCarousel() {
  const { data, loading, error, isOffline, retry } = useCarteleraQuery();
  const fotos = data?.fotos ?? [];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pause, setPause] = useState(false);

  const autoplayMs = 5000;

  const slideCount = fotos.length;

  const canRenderCarousel = !loading && !error && slideCount > 0;

  const safeActiveIdx = useMemo(() => {
    if (slideCount <= 0) return 0;
    return clamp(activeIdx, 0, slideCount - 1);
  }, [activeIdx, slideCount]);

  useEffect(() => {
    if (!canRenderCarousel) return;
    const el = trackRef.current;
    if (!el) return;

    const handleScroll = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      const idx = Math.round(el.scrollLeft / w);
      setActiveIdx(clamp(idx, 0, slideCount - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [canRenderCarousel, slideCount]);

  useEffect(() => {
    if (!canRenderCarousel) return;
    if (pause) return;
    if (slideCount <= 1) return;

    const t = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slideCount);
    }, autoplayMs);

    return () => window.clearInterval(t);
  }, [canRenderCarousel, pause, slideCount]);

  useEffect(() => {
    if (!canRenderCarousel) return;
    const el = trackRef.current;
    if (!el) return;

    const w = el.clientWidth;
    el.scrollTo({ left: w * safeActiveIdx, behavior: "smooth" });
  }, [canRenderCarousel, safeActiveIdx]);

  return (
    <section className="w-full">
      <div
        className="bg-gradient-to-r from-blue-600 to-blue-700 min-h-[360px] sm:min-h-[400px] flex items-center justify-center"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        <div className="w-full max-w-6xl px-4">
          {isOffline ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Sin conexión. Revisa tu internet.
            </div>
          ) : null}

          {error ? (
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={retry}
                className="h-9 rounded-md bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800"
              >
                Reintentar
              </button>
              <div className="text-xs text-white/80">{error}</div>
            </div>
          ) : null}

          {loading ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur">
                <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white/90 animate-spin" />
              </div>
              <div className="mt-4 text-xl font-medium text-white/80">Cargando cartelera...</div>
            </div>
          ) : null}

          {!loading && !error && slideCount === 0 ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur">
                <svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-medium text-white/80">Espacio reservado para cartelera visual</h2>
              <p className="mt-2 text-sm text-white/60">Próximamente: Fotos de entrega de premios</p>
            </div>
          ) : null}

          {canRenderCarousel ? (
            <div className="w-full">
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-[0_18px_50px_rgba(0,0,0,0.35)] overflow-hidden">
                <div
                  ref={trackRef}
                  className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
                  style={{ scrollbarWidth: "none" } as any}
                >
                  {fotos.map((f) => (
                    <div key={f.id} className="relative w-full shrink-0 snap-start">
                      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[360px] bg-slate-900/25">
                        <img
                          src={f.url_imagen}
                          alt={String(f.titulo ?? "Entrega de premios")}
                          className="absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="text-white font-extrabold text-lg leading-tight">
                            {f.titulo ? f.titulo : "Entrega de premios"}
                          </div>
                          {f.descripcion ? <div className="mt-1 text-xs text-white/80">{f.descripcion}</div> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {slideCount > 1 ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-black/20">
                    <div className="text-[11px] text-white/80">
                      {safeActiveIdx + 1} / {slideCount}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: slideCount }).map((_, idx) => (
                        <button
                          key={String(idx)}
                          type="button"
                          onClick={() => setActiveIdx(idx)}
                          className={
                            "h-2 rounded-full transition-all " + (idx === safeActiveIdx ? "w-6 bg-white/90" : "w-2 bg-white/40 hover:bg-white/60")
                          }
                          aria-label={`Ir a imagen ${idx + 1}`}
                          title={`Imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
