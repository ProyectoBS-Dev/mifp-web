'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUnreadCount, useNotifications } from '@/hooks/useNotifications'
import { NotificationCenter } from './NotificationCenter'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = useUnreadCount()
  const { data: _notifications } = useNotifications()
  const prevCountRef = useRef(unreadCount)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  
  // Detectar cuando llega una nueva notificación para mostrar animación
  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setHasNewNotification(true)
      // Quitar la animación después de 3 segundos
      const timer = setTimeout(() => setHasNewNotification(false), 3000)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = unreadCount
  }, [unreadCount])
  
  // Resetear indicador de nuevas al abrir el popover
  useEffect(() => {
    if (isOpen) {
      setHasNewNotification(false)
    }
  }, [isOpen])
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            'relative',
            hasNewNotification && 'animate-wiggle'
          )}
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
        >
          <Bell className={cn(
            'h-5 w-5 transition-colors',
            hasNewNotification && 'text-primary'
          )} />
          
          {/* Badge con contador */}
          {unreadCount > 0 && (
            <span 
              className={cn(
                'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full',
                'bg-destructive text-destructive-foreground',
                'text-[10px] font-medium',
                'flex items-center justify-center',
                'transition-transform',
                hasNewNotification && 'animate-bounce'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          
          {/* Indicador pulse cuando hay nuevas */}
          {hasNewNotification && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive animate-ping opacity-75" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="p-0 w-auto"
      >
        <NotificationCenter onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

