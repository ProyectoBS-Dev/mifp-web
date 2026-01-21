'use client'

import { useState } from 'react'
import { 
  Coins, 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  Shield, 
  Smartphone,
  MessageSquare,
  ChevronDown,
  Settings,
  BarChart3,
  FolderOpen,
  Layout,
  MessageCircle,
  Scale,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}

const faqs: FAQItem[] = [
  {
    id: '1',
    question: '¿Es gratis?',
    answer: 'Sí, MiFP es completamente gratis. Es un proyecto creado por estudiantes de FP de Grado Superior de iLERNA Online y para estudiantes de FP.',
    icon: Coins,
    iconColor: 'text-vt-green',
    iconBg: 'bg-vt-green/10'
  },
  {
    id: '2',
    question: '¿Solo funciona para ILERNA?',
    answer: 'Actualmente está optimizado para estudiantes de ILERNA Online, con el sistema de evaluación específico (PACs, VTs, exámenes). Aunque puede adaptarse a otros centros.',
    icon: GraduationCap,
    iconColor: 'text-vt-blue',
    iconBg: 'bg-vt-blue/10'
  },
  {
    id: '3',
    question: '¿Qué grados están disponibles?',
    answer: 'Actualmente soportamos DAM (Desarrollo de Aplicaciones Multiplataforma) y DAW (Desarrollo de Aplicaciones Web), con todas sus asignaturas.',
    icon: BookOpen,
    iconColor: 'text-vt-purple',
    iconBg: 'bg-vt-purple/10'
  },
  {
    id: '4',
    question: '¿Cómo calcula las notas?',
    answer: 'Utilizamos el sistema oficial de evaluación de ILERNA: PACs (interactivas y desarrollo), Videotutorías y Examen Final, con los pesos correspondientes de cada Resultado de Aprendizaje (RA).',
    icon: Calculator,
    iconColor: 'text-vt-yellow',
    iconBg: 'bg-vt-yellow/10'
  },
  {
    id: '5',
    question: '¿Mis datos están seguros?',
    answer: 'Sí, utilizamos Supabase con encriptación y Row Level Security (RLS). Tus datos son privados y solo tú puedes acceder a ellos.',
    icon: Shield,
    iconColor: 'text-vt-red',
    iconBg: 'bg-vt-red/10'
  },
  {
    id: '6',
    question: '¿Puedo usarlo en móvil?',
    answer: 'Sí, MiFP es completamente responsive y funciona perfectamente en móviles y tablets. Puedes acceder desde cualquier dispositivo con conexión a internet.',
    icon: Smartphone,
    iconColor: 'text-vt-blue',
    iconBg: 'bg-vt-blue/10'
  },
  {
    id: '7',
    question: '¿Cómo contacto con soporte?',
    answer: 'Puedes contactarnos a través de nuestro formulario de contacto, por email, o abriendo un issue en nuestro repositorio de GitHub.',
    icon: MessageSquare,
    iconColor: 'text-vt-green',
    iconBg: 'bg-vt-green/10'
  }
]

// Quick links for the visual grid
const quickLinks = [
  { icon: Settings, label: 'Ajustes', href: '/ajustes', color: 'text-vt-purple' },
  { icon: Layout, label: 'Dashboard', href: '/dashboard', color: 'text-vt-green' },
  { icon: BarChart3, label: 'Notas', href: '/notas', color: 'text-vt-yellow' },
  { icon: FolderOpen, label: 'Recursos', href: '/recursos', color: 'text-vt-blue' },
  { icon: MessageCircle, label: 'Feedback', href: '/ajustes', color: 'text-vt-green' },
  { icon: Scale, label: 'Legal', href: '/terminos', color: 'text-muted-foreground' },
]

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vt-green to-vt-blue mb-6">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Todo lo que necesitas saber sobre MiFP
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left - Accordion */}
          <div className="space-y-3">
            {faqs.map((faq) => {
              const Icon = faq.icon
              const isOpen = openId === faq.id
              
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'border rounded-xl transition-all duration-200',
                    isOpen 
                      ? 'bg-card border-vt-green/30 shadow-sm' 
                      : 'bg-card/50 border-border hover:border-muted-foreground/30'
                  )}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-lg shrink-0',
                        faq.iconBg
                      )}>
                        <Icon className={cn('w-4 h-4', faq.iconColor)} />
                      </span>
                      <span className="font-medium">{faq.question}</span>
                    </div>
                    <ChevronDown 
                      className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )} 
                    />
                  </button>
                  
                  <div className={cn(
                    'overflow-hidden transition-all duration-200',
                    isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  )}>
                    <p className="px-5 pb-4 pl-[60px] text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right - Visual Grid */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-vt-green/20 via-vt-blue/20 to-vt-purple/20 blur-3xl rounded-full scale-150" />
              
              {/* Icons grid with links */}
              <div className="relative grid grid-cols-3 gap-4 p-8">
                {quickLinks.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border shadow-lg hover:shadow-xl hover:scale-105 hover:border-vt-green/50 transition-all duration-200 group"
                    >
                      <Icon className={cn('w-8 h-8 mb-2 transition-colors', item.color, 'group-hover:text-vt-green')} />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
