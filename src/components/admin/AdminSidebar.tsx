'use client'

import { AdminSidebarContent } from './AdminSidebarContent'

/**
 * Wrapper del sidebar de admin para desktop.
 * Renderiza AdminSidebarContent con clases de visibilidad desktop-only.
 */
export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      <AdminSidebarContent />
    </aside>
  )
}
