'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navItems } from './navItems'

/**
 * Componente de navegación reutilizable para usuarios autenticados.
 * Muestra los links: Dashboard | Notas | Blog
 */
export function UserNav() {
    const pathname = usePathname()

    return (
        <>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
        </>
    )
}
