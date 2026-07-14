'use client'

import { CollapsibleSidebar } from '@/components/ui/collapsible-sidebar'
import { AdminSidebarContent } from './AdminSidebarContent'
import { Menu } from 'lucide-react'

/**
 * Sidebar móvil para el área de administración.
 * Usa CollapsibleSidebar con AdminSidebarContent.
 * Fecha: 14/07/2026
 */
export function AdminMobileSidebar() {
  return (
    <div className="md:hidden">
      <CollapsibleSidebar icon={Menu} label="Menú" description="Navegación de administración">
        <AdminSidebarContent />
      </CollapsibleSidebar>
    </div>
  )
}
