import { Home, BookOpen, Newspaper, Package } from 'lucide-react'

export interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
}

export const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
    { href: '/notas', label: 'Notas', icon: <BookOpen className="h-4 w-4" /> },
    { href: '/recursos', label: 'Recursos', icon: <Package className="h-4 w-4" /> },
    { href: '/blog', label: 'Blog', icon: <Newspaper className="h-4 w-4" /> },
]
