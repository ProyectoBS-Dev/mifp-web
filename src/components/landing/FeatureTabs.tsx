'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Calendar,
  FileText,
  BookOpen,
  BarChart3,
} from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
  { id: 'pacs', label: 'PACs', icon: FileText },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'notas', label: 'Notas', icon: BarChart3 },
  { id: 'recursos', label: 'Recursos', icon: BookOpen },
]

interface FeatureTabsProps {
  onTabChange?: (tabId: string) => void
}

export function FeatureTabs({ onTabChange }: FeatureTabsProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 dark:bg-slate-800/50 backdrop-blur-sm border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                isActive
                  ? 'bg-background dark:bg-slate-700 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
