'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Palette, Bell, Shield, Trash2, HelpCircle, Mail, MessageSquare, ExternalLink } from 'lucide-react'

export type SettingsSection = 'apariencia' | 'notificaciones' | 'seguridad' | 'peligro' | 'soporte' | 'feedback'

interface SettingsSidebarProps {
  activeSection: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}

const configItems: { id: SettingsSection; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'peligro', label: 'Zona de peligro', icon: Trash2, danger: true },
]

const resourceItems: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: 'soporte', label: 'Soporte', icon: Mail },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
]

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <aside className="w-64 shrink-0">
      {/* Configuración section */}
      <nav className="space-y-1">
        {configItems.map((item) => {
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

      {/* Divider with label */}
      <div className="my-4 pt-4 border-t border-border">
        <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Recursos
        </p>
      </div>

      {/* Resources section */}
      <nav className="space-y-1">
        {/* Ayuda - External link */}
        <Link
          href="/home#faqs"
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="h-4 w-4" />
            <span>Ayuda</span>
          </div>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </Link>

        {/* Soporte & Feedback - Internal sections */}
        {resourceItems.map((item) => {
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
                  : 'hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Legal links footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-xs text-muted-foreground">
          <Link href="/recursos" className="hover:text-foreground transition-colors">
            Recursos
          </Link>
          <span>·</span>
          <Link href="/terminos" className="hover:text-foreground transition-colors">
            Términos
          </Link>
          <span>·</span>
          <Link href="/privacidad" className="hover:text-foreground transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </aside>
  )
}
