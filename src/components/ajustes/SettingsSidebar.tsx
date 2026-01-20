'use client'

import { cn } from '@/lib/utils'
import { Palette, Bell, Shield, Trash2 } from 'lucide-react'

export type SettingsSection = 'apariencia' | 'notificaciones' | 'seguridad' | 'peligro'

interface SettingsSidebarProps {
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

const sidebarItems: { id: SettingsSection; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'peligro', label: 'Zona de peligro', icon: Trash2, danger: true },
]

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <aside className="w-64 shrink-0">
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                isActive
                  ? 'bg-muted font-medium border-l-2 border-primary ml-[-2px]'
                  : 'hover:bg-muted/50',
                item.danger && !isActive && 'text-destructive',
                item.danger && isActive && 'text-destructive bg-destructive/10 border-destructive'
              )}
            >
              <Icon className={cn('h-4 w-4', item.danger && 'text-destructive')} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
