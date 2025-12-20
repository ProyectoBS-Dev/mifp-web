import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Ajustes | MiFP',
  description: 'Configura tu cuenta',
}

export default function AjustesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta y preferencias
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle>🎨 Apariencia</CardTitle>
            <CardDescription>Personaliza el aspecto de la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              El tema se puede cambiar usando el toggle en la barra de navegación.
              <br />
              Próximamente: más opciones de personalización.
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>🔔 Notificaciones</CardTitle>
            <CardDescription>Gestiona cómo recibes las notificaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Próximamente podrás configurar tus preferencias de notificaciones
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Cuenta</CardTitle>
            <CardDescription>Gestiona tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Próximamente: cambiar contraseña, exportar datos, eliminar cuenta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
