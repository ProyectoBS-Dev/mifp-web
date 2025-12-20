import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | MiFP',
  description: 'Tu panel de control personalizado',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control
        </p>
      </div>
      
      {/* Placeholder para el grid de widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget placeholder 1 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">📊 Estadísticas</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Tu progreso académico aparecerá aquí
          </p>
        </div>
        
        {/* Widget placeholder 2 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">📅 Próximas PACs</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Fechas importantes de entregas
          </p>
        </div>
        
        {/* Widget placeholder 3 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">🎥 Próximas VTs</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Videoconferencias programadas
          </p>
        </div>
        
        {/* Widget placeholder 4 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">📚 Recursos</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Material de estudio recomendado
          </p>
        </div>
        
        {/* Widget placeholder 5 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">📝 Notas rápidas</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Tus notas personales
          </p>
        </div>
        
        {/* Widget placeholder 6 */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">📰 Novedades</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Últimas noticias del campus
          </p>
        </div>
      </div>
    </div>
  )
}
