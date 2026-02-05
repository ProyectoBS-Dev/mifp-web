'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SettingsSidebar, type SettingsSection } from './SettingsSidebar'
import { 
  SettingsAppearance, 
  SettingsNotifications, 
  SettingsSecurity, 
  SettingsDanger,
  SettingsSupport,
  SettingsFeedback
} from './sections'
import { HelpCircle, ExternalLink } from 'lucide-react'

interface SettingsPanelProps {
  userEmail: string
  userRole?: 'admin' | 'estudiante' | 'moderador' | 'editor'
}

export function SettingsPanel({ userEmail, userRole = 'estudiante' }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('apariencia')

  const renderSection = () => {
    switch (activeSection) {
      case 'apariencia':
        return <SettingsAppearance />
      case 'notificaciones':
        return <SettingsNotifications userRole={userRole} />
      case 'seguridad':
        return <SettingsSecurity />
      case 'peligro':
        return <SettingsDanger userEmail={userEmail} />
      case 'soporte':
        return <SettingsSupport />
      case 'feedback':
        return <SettingsFeedback />
      default:
        return <SettingsAppearance />
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar - hidden on mobile, shown on lg+ */}
      <div className="hidden lg:block">
        <SettingsSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      </div>

      {/* Mobile Config Navigation - ANTES del main content */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <MobileNavButton 
            active={activeSection === 'apariencia'}
            onClick={() => setActiveSection('apariencia')}
          >
            Apariencia
          </MobileNavButton>
          <MobileNavButton 
            active={activeSection === 'notificaciones'}
            onClick={() => setActiveSection('notificaciones')}
          >
            Notificaciones
          </MobileNavButton>
          <MobileNavButton 
            active={activeSection === 'seguridad'}
            onClick={() => setActiveSection('seguridad')}
          >
            Seguridad
          </MobileNavButton>
          <MobileNavButton 
            active={activeSection === 'peligro'}
            onClick={() => setActiveSection('peligro')}
            danger
          >
            Peligro
          </MobileNavButton>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 bg-muted/50 rounded-lg shadow-lg border-none">
        {renderSection()}
      </main>

      {/* Mobile Resources Navigation - DESPUÉS del main content */}
      <div className="lg:hidden order-last border-t pt-3">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <Link
            href="/home#faqs"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-muted hover:bg-muted/80 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Ayuda
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Link>
          <MobileNavButton 
            active={activeSection === 'soporte'}
            onClick={() => setActiveSection('soporte')}
          >
            Soporte
          </MobileNavButton>
          <MobileNavButton 
            active={activeSection === 'feedback'}
            onClick={() => setActiveSection('feedback')}
          >
            Feedback
          </MobileNavButton>
        </div>
      </div>
    </div>
  )
}

function MobileNavButton({ 
  children, 
  active, 
  onClick,
  danger 
}: { 
  children: React.ReactNode
  active: boolean
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
        ${active 
          ? danger 
            ? 'bg-destructive text-destructive-foreground' 
            : 'bg-primary text-primary-foreground'
          : danger
            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            : 'bg-muted hover:bg-muted/80'
        }
      `}
    >
      {children}
    </button>
  )
}
