'use client'

import { Palette, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Apariencia
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza el aspecto de la aplicación
        </p>
      </div>

      {/* Theme selector - compact pills */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Tema</Label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              theme === 'light' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Sun className="h-4 w-4" />
            Claro
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              theme === 'dark' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Moon className="h-4 w-4" />
            Oscuro
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
              theme === 'system' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Monitor className="h-4 w-4" />
            Sistema
          </button>
        </div>
      </div>
    </div>
  )
}
