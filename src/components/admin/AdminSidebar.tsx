'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  Video,
  Package,
  Newspaper,
  Calendar,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  disabled?: boolean
}

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/guias-didacticas', label: 'Guías Didácticas', icon: FileText },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/vts', label: 'Videotutorías', icon: Video },
  { href: '/admin/recursos', label: 'Recursos', icon: Package },
  { href: '/admin/semestres', label: 'Semestres', icon: Calendar },
  { href: '#', label: 'Asignaturas', icon: BookOpen, disabled: true },
  { href: '#', label: 'Usuarios', icon: Users, disabled: true },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href) && item.href !== '#'

          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  Próx.
                </span>
              </span>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
