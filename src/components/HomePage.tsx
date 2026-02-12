"use client";

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Vacío para uso futuro (cartelera visual) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur">
            <svg className="w-12 h-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-medium text-white/80">
            Espacio reservado para cartelera visual
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Próximamente: Fotos de entrega de premios
          </p>
        </div>
      </div>
    </div>
  );
}
