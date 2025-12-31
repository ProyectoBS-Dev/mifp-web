'use client'

import { useState } from 'react'
import { Bell, Loader2, Play, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ApiResponse {
  success: boolean
  timestamp: string
  total_generated: number
  results: {
    pac_reminders: {
      pac_24h: number
      pac_48h: number
      total: number
    }
    vt_reminders: {
      vt_reminders: number
    }
  }
  error?: string
}

export function AdminToolsCard() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastResult, setLastResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateNotifications = async () => {
    setIsGenerating(true)
    setError(null)
    setLastResult(null)

    try {
      const response = await fetch('/api/cron/notifications', {
        method: 'POST',
      })

      const data: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar notificaciones')
      }

      setLastResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  const totalGenerated = lastResult?.total_generated || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛠️ Herramientas de Admin
        </CardTitle>
        <CardDescription>
          Acciones de mantenimiento y gestión del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generar Notificaciones */}
        <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Generar Notificaciones</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ejecuta los generadores de notificaciones manualmente:
              </p>
              <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                <li>PACs próximas a vencer (24h/48h)</li>
                <li>VTs en la próxima hora</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 Las noticias del blog generan notificaciones automáticamente al publicarlas.
              </p>
              
              {/* Resultado de última ejecución */}
              {lastResult && lastResult.success && (
                <div className="mt-3 p-2 rounded bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {totalGenerated} notificaciones generadas
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      • PACs 24h: {lastResult.results?.pac_reminders?.pac_24h || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • PACs 48h: {lastResult.results?.pac_reminders?.pac_48h || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • VTs próxima hora: {lastResult.results?.vt_reminders?.vt_reminders || 0}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(lastResult.timestamp).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
              
              {/* Error */}
              {error && (
                <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleGenerateNotifications}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Ejecutar
              </>
            )}
          </Button>
        </div>

        {/* Limpiar notificaciones antiguas */}
        <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/30 opacity-60">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Trash2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                Limpiar Notificaciones Antiguas
                <Badge variant="secondary" className="text-xs">Próximamente</Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Elimina notificaciones leídas de más de 30 días
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" disabled>
            Limpiar
          </Button>
        </div>

        {/* Info sobre automatización */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 <strong>Tip:</strong> En producción, estas tareas se ejecutarán automáticamente 
            cada 30 minutos mediante Vercel Cron o pg_cron.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

