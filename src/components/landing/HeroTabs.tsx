'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Calendar,
  FileText,
  BarChart3,
  BookOpen,
  Sparkles,
} from 'lucide-react'

const tabs = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: GraduationCap,
    image: '/images/dashboard_preview.png',
    alt: 'Dashboard de MiFP'
  },
  { 
    id: 'pacs', 
    label: 'PACs', 
    icon: FileText,
    image: '/images/dashboard_preview.png',
    alt: 'Gestión de PACs'
  },
  { 
    id: 'calendario', 
    label: 'Calendario', 
    icon: Calendar,
    image: '/images/dashboard_preview.png', // TODO: Create calendario_preview.png
    alt: 'Calendario de eventos'
  },
  { 
    id: 'notas', 
    label: 'Notas', 
    icon: BarChart3,
    image: '/images/dashboard_preview.png', // Using asignaturas which shows grades
    alt: 'Seguimiento de notas'
  },
  { 
    id: 'recursos', 
    label: 'Recursos', 
    icon: BookOpen,
    image: '/images/dashboard_preview.png',
    alt: 'Recursos de estudio'
  },
]

export function HeroTabs() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0]

  return (
    <div className="mt-16 max-w-4xl mx-auto">
      {/* Dashboard Preview Image */}
      <div className="relative">
        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <Image
            src={activeTabData.image}
            alt={activeTabData.alt}
            width={1200}
            height={700}
            className="w-full transition-opacity duration-300"
            priority
          />
        </div>
        {/* Glow effect behind dashboard */}
        <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-vt-green/15 via-vt-blue/15 to-vt-purple/15 rounded-2xl blur-3xl opacity-40" />
      </div>
      
      {/* Tagline */}
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm mb-6">
          Navega entre las diferentes pestañas para ver las funcionalidades de MiFP <Sparkles className="inline h-4 w-4" />
        </p>
        
        {/* Tabs Navigation */}
        <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-slate-100 backdrop-blur-sm border border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
