import { Navbar } from "@/components/Navbar";

export default function CareteraPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Caretera</h1>
          <p className="mt-2 text-slate-600">Registra y consulta los pagos parciales realizados por los clientes</p>
        </div>

        {/* Placeholder para el contenido de Caretera */}
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Caretera</h2>
            <p className="text-slate-600">Esta sección está en desarrollo. Pronto podrás registrar y consultar los pagos parciales de los clientes.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">📊 Registro de Pagos</h3>
                <p className="text-sm text-slate-600">Añade nuevos pagos parciales de los clientes</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">📈 Consultas</h3>
                <p className="text-sm text-slate-600">Visualiza el historial de pagos por cliente</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-2">📋 Reportes</h3>
                <p className="text-sm text-slate-600">Genera reportes de pagos y saldos pendientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
