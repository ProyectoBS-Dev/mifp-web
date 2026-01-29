import { Newspaper, GraduationCap, FolderSearch, LayoutDashboard } from 'lucide-react'

export interface NavItem {
    href: string
    label: string
    icon: React.ReactNode
}

export const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/notas', label: 'Notas', icon: <GraduationCap className="h-4 w-4" /> },
    { href: '/recursos', label: 'Recursos', icon: <FolderSearch className="h-4 w-4" /> },
    { href: '/blog', label: 'Blog', icon: <Newspaper className="h-4 w-4" /> },
]
