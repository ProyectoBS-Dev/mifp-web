'use client'

import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

/**
 * Toggle de tema estilo pill/cápsula
 * Ver referencia visual: docs/Screenshots/toggle_light.png y toggle_dark.png
 * 
 * LIGHT MODE: Knob a la IZQUIERDA con sol
 * DARK MODE: Knob a la DERECHA con luna
 */
export function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme()

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-vt-gray-light-4 border border-vt-gray-light-3">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm translate-x-1">
          <Sun className="h-4 w-4 text-vt-yellow" />
        </span>
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
        ${isDark
          ? 'bg-vt-gray-dark-3'
          : 'bg-vt-gray-light-4 border border-vt-gray-light-3'
        }
      `}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {/* Knob con icono */}
      <span
        className={`
          inline-flex h-6 w-6 items-center justify-center rounded-full
          bg-white shadow-sm transition-transform duration-200 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-1'}
        `}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-vt-gray-dark-2" />
        ) : (
          <Sun className="h-4 w-4 text-vt-yellow" />
        )}
      </span>
    </button>
  )
}
