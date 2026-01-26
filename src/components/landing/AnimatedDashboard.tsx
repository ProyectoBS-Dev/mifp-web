'use client'

import { FileText, Link2, Headphones, CheckCircle2 } from 'lucide-react'

export function AnimatedDashboard() {

  return (
    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border bg-background/95 backdrop-blur-sm shadow-2xl">
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes progressFill {
          from {
            width: 0;
          }
          to {
            width: var(--progress-width);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(66, 184, 131, 0.4);
          }
          50% {
            box-shadow: 0 0 16px rgba(66, 184, 131, 0.6);
          }
        }
        
        .animate-slide-right { animation: slideInRight 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideInUp 0.5s ease-out forwards; }
        .animate-fade-scale { animation: fadeInScale 0.5s ease-out forwards; }
        .animate-progress { animation: progressFill 1s ease-out forwards; }
        .animate-pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
        
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-250 { animation-delay: 0.25s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; }
        .delay-700 { animation-delay: 0.7s; opacity: 0; }
        .delay-800 { animation-delay: 0.8s; opacity: 0; }
      `}</style>

      {/* Decorative glow */}
      <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-vt-green/20 via-vt-blue/20 to-vt-blue-light/20 rounded-2xl blur-2xl opacity-60" />

      {/* Top Navigation */}
      <div className="px-4 py-3 border-b bg-background/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold bg-gradient-to-r from-vt-green to-vt-blue bg-clip-text text-transparent animate-fade-scale">MiFP</span>
          <div className="flex items-center gap-1 text-xs">
            <button className="px-2 py-1 rounded-lg bg-gradient-to-br from-vt-green/10 to-vt-blue/10 text-vt-green font-medium border border-vt-green/20 animate-slide-right delay-100">Dashboard</button>
            <button className="px-2 py-1 rounded hover:bg-muted/50 text-muted-foreground animate-slide-right delay-200">Notas</button>
            <button className="px-2 py-1 rounded hover:bg-muted/50 text-muted-foreground animate-slide-right delay-250">Recursos</button>
            <button className="px-2 py-1 rounded hover:bg-muted/50 text-muted-foreground animate-slide-right delay-300">Blog</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vt-green/10 text-vt-green text-xs font-medium animate-fade-scale delay-400 animate-pulse-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vt-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vt-green"></span>
            </span>
            En tiempo real
          </div>
          <div className="w-6 h-6 rounded-full bg-vt-blue/30 animate-fade-scale delay-500"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 overflow-hidden">
        {/* Title */}
        <div className="mb-3 animate-slide-up delay-300">
          <h2 className="text-base font-bold">Dashboard</h2>
          <p className="text-xs text-muted-foreground">Tu centro de control personalizado. Arrastra y redimensiona los widgets.</p>
        </div>

        {/* Alert Banner */}
        <div className="mb-3 p-2.5 rounded-lg bg-gradient-to-r from-vt-yellow/10 to-vt-yellow-dark/10 border border-vt-yellow-dark/20 backdrop-blur-sm animate-slide-up delay-400">
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-5 h-5 rounded-lg bg-vt-yellow/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-vt-yellow-dark" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-vt-yellow-dark">Faltan datos de 2 asignaturas</p>
              <p className="text-[10px] text-muted-foreground">Horario personal para la empleabilidad I, Sostenibilidad aplicada al sistema productivo</p>
            </div>
            <button className="text-xs px-2 py-1 rounded-lg bg-vt-green/10 text-vt-green hover:bg-vt-green/20 transition-colors font-medium shrink-0">Subir GD</button>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-3 gap-2">
          
          {/* Calendario Widget */}
          <div className="p-2.5 rounded-xl border bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow animate-slide-up delay-500">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-vt-blue/20 to-vt-blue-light/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-vt-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold">Calendario</span>
            </div>
            <div className="text-center mb-1">
              <div className="text-[10px] font-medium text-muted-foreground mb-1">Enero 2026</div>
              <div className="grid grid-cols-7 gap-0.5 text-[8px] text-muted-foreground mb-1">
                <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-[8px]">
                {[...Array(31)].map((_, i) => (
                  <div key={i} className={`p-0.5 rounded ${i === 23 ? 'bg-vt-green text-white font-bold' : ''}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Próximas PACs */}
          <div className="p-2.5 rounded-xl border bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow animate-slide-up delay-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-vt-green/20 to-vt-green/10 flex items-center justify-center">
                  <svg className="w-3 h-3 text-vt-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold">Próximas PACs</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-vt-green/30 text-slate-500 font-semibold whitespace-nowrap">5</span>
            </div>
            <div className="space-y-1.5">
              <div className="p-1.5 rounded bg-vt-green/5 border border-vt-green/10">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-medium">PAC 2 - DAD</span>
                  <span className="text-[8px] text-vt-red">30 ene</span>
                </div>
                <p className="text-[8px] text-muted-foreground mb-1">Organizador opcional y las funciones productivas</p>
                <button className="text-[8px] text-primary hover:underline">Ver todas (48)</button>
              </div>
              <div className="flex items-center justify-center py-1">
                <svg className="w-4 h-4 text-vt-green animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Próximas VTs */}
          <div className="p-2.5 rounded-xl border bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow animate-slide-up delay-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-vt-blue/20 to-vt-blue-light/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-vt-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] font-semibold">Próximas VTs</span>
              </div>
              <button className="text-[8px] text-vt-blue hover:underline font-medium">Ver todas</button>
            </div>
            <div className="space-y-1.5">
              <div className="text-[9px]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">50/50 vistas</span>
                  <span className="text-vt-green font-bold">100%</span>
                </div>
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-vt-green to-vt-blue rounded-full animate-progress delay-800" 
                    style={{'--progress-width': '100%'} as React.CSSProperties}
                  ></div>
                </div>
                <p className="text-[8px] text-muted-foreground mt-1">3 pendientes</p>
              </div>
              <div className="p-1.5 rounded bg-vt-green/5 border border-vt-green/10">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-vt-green" />
                  <p className="text-[8px] text-muted-foreground">¡Todas las VTs vistas!</p>
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">60 VTs completadas</p>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div className="p-2.5 rounded-xl border bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow animate-slide-up delay-600">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-vt-purple/20 to-vt-purple/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-vt-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold">Recursos</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px]">
                <FileText className="w-3 h-3 text-vt-purple" />
                <span>3 PDFs (3)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <Link2 className="w-3 h-3 text-vt-blue" />
                <span>8 Enlaces (4)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px]">
                <Headphones className="w-3 h-3 text-vt-green" />
                <span>4 Podcasts (1)</span>
              </div>
              <button className="text-[8px] text-primary hover:underline mt-1">Buscar otros</button>
            </div>
          </div>

          {/* Notas rápidas */}
          <div className="col-span-2 p-2.5 rounded-xl border bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow animate-slide-up delay-800">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-vt-yellow/20 to-vt-yellow-dark/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-vt-yellow-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold">Notas rápidas</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 rounded bg-vt-yellow/5 border border-vt-yellow-dark/10">
                <p className="text-[9px] font-medium mb-0.5">Recordatorio PAC</p>
                <p className="text-[8px] text-muted-foreground">Enviar antes del viernes...</p>
              </div>
              <div className="p-1.5 rounded bg-vt-blue/5 border border-vt-blue/10">
                <p className="text-[9px] font-medium mb-0.5">Ideas proyecto</p>
                <p className="text-[8px] text-muted-foreground">Revisar arquitectura...</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
