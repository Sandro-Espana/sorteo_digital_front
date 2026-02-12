import { Navbar } from "@/components/Navbar";

export default function ConferenciasPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Conferencias de Socios</h1>
          <p className="mt-2 text-slate-600">Registra y visualiza los acuerdos de los socios durante cada plan de premios</p>
        </div>

        {/* Placeholder para el contenido de Conferencias */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Conferencias de Socios</h2>
            <p className="text-slate-600">Esta sección está en desarrollo. Pronto podrás gestionar los acuerdos de los socios.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">🤝 Registro de Acuerdos</h3>
                <p className="text-sm text-slate-600">Documenta los acuerdos tomados en cada conferencia</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">📅 Historial</h3>
                <p className="text-sm text-slate-600">Consulta el historial de conferencias y decisiones</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">📋 Actas</h3>
                <p className="text-sm text-slate-600">Genera actas y resúmenes de las reuniones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
