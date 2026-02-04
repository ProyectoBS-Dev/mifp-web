'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Calendar,
  FileText,
  Sparkles,
  LayoutDashboard,
  FolderSearch,
} from 'lucide-react'

const tabs = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    image: '/images/dashboard_tab_preview.webp',
    alt: 'Dashboard de MiFP'
  },
  { 
    id: 'pacs', 
    label: 'PACs/VTs', 
    icon: FileText,
    image: '/images/pacs_vts_tab_preview.webp',
    alt: 'Gestión de PACs'
  },
  { 
    id: 'calendario', 
    label: 'Calendario', 
    icon: Calendar,
    image: '/images/calendario_tab_preview.webp',
    alt: 'Calendario de eventos'
  },
  { 
    id: 'notas', 
    label: 'Notas', 
    icon: GraduationCap,
    image: '/images/notas_tab_preview.webp',
    alt: 'Seguimiento de notas'
  },
  { 
    id: 'recursos', 
    label: 'Recursos', 
    icon: FolderSearch,
    image: '/images/recursos_tab_preview.webp',
    alt: 'Recursos de estudio'
  },
]

export function HeroTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
      {/* Dashboard Preview Image */}
      <div className="relative">
        <div className="relative rounded-xl overflow-hidden">
          <Image
            src={activeTabData.image}
            alt={activeTabData.alt}
            width={900}
            height={350}
            className="w-full transition-opacity duration-300"
            priority
          />
        </div>
        {/* Glow effect behind dashboard */}
        <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-vt-green/15 via-vt-blue/15 to-vt-purple/15 rounded-2xl blur-3xl opacity-40" />
      </div>
      
      {/* Tagline */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-xs xs:text-sm mb-4 sm:mb-6">
          Navega entre las diferentes pestañas para ver las funcionalidades de MiFP <Sparkles className="inline h-4 w-4" />
        </p>
        
        {/* Tabs Navigation */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-muted/50 backdrop-blur-sm border border-border min-w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-background text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                )}
              >
                <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4 shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            )
          })}
          </div>
        </div>
      </div>
    </div>
  )
}
