'use client'

import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

/**
 * Toggle de tema minimalista - solo icono
 * 
 * LIGHT MODE: Icono de sol
 * DARK MODE: Icono de luna
 */
export function ThemeToggle() {
  const { isDark, toggleTheme, mounted } = useTheme()

  // Evitar hydration mismatch
  if (!mounted) {
    return (
      <div className="h-9 w-9 flex items-center justify-center">
        <Sun className="h-5 w-5 text-foreground" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full flex items-center justify-center
                 text-foreground
                 hover:bg-accent hover:text-accent-foreground
                 transition-colors duration-200 ease-in-out
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary 
                 focus-visible:ring-offset-2"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {isDark ? (
        <Moon className="h-5 w-5 transition-all duration-300 ease-in-out" />
      ) : (
        <Sun className="h-5 w-5 transition-all duration-300 ease-in-out" />
      )}
    </button>
  )
}
