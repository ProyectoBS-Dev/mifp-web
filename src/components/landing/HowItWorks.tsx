'use client'

import { UserPlus, GraduationCap, Rocket } from 'lucide-react'

interface StepProps {
  number: number
  title: string
  description: string
  icon: React.ElementType
  color: string
}

const steps: StepProps[] = [
  {
    number: 1,
    title: 'Crea tu cuenta',
    description: 'Regístrate con tu email o usa Google/GitHub para empezar',
    icon: UserPlus,
    color: 'vt-green'
  },
  {
    number: 2,
    title: 'Selecciona tu grado',
    description: 'Elige DAM o DAW y las asignaturas que estás cursando',
    icon: GraduationCap,
    color: 'vt-blue'
  },
  {
    number: 3,
    title: '¡Listo!',
    description: 'Comienza a organizar tus estudios desde tu dashboard',
    icon: Rocket,
    color: 'vt-purple'
  }
]

function StepCardNew({ step }: { step: StepProps }) {
  const Icon = step.icon
  
  return (
    <div className="relative flex flex-col items-center">
      {/* Card - altura fija */}
      <div className="group relative w-full">
        {/* Glow effect on hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-vt-green to-vt-blue rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        
        <div className="relative rounded-2xl border bg-card p-6 h-[200px] flex flex-col items-center hover:border-vt-green/50 hover:shadow-lg hover:shadow-vt-green/10 hover:-translate-y-1 transition-all duration-300">
          {/* Number badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-vt-green to-vt-blue text-white font-bold text-sm shadow-lg">
              {step.number}
            </div>
          </div>
          
          {/* Icon */}
          <div className="flex justify-center mb-4 mt-2">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${step.color}/10`}>
              <Icon className={`w-7 h-7 text-${step.color}`} />
            </div>
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold text-center mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground text-center flex-1">{step.description}</p>
        </div>
      </div>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto container-landing relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comienza en 3 simples pasos
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Configura tu cuenta y empieza a organizar tus estudios en minutos
          </p>
        </div>

        {/* Steps with connecting lines */}
        <div className="relative max-w-4xl mx-auto">
          {/* Línea horizontal de fondo (desktop only) */}
          <div className="hidden md:block absolute top-[100px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-vt-green/40 via-vt-blue/40 to-vt-purple/40" />
          
          {/* Step cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 items-start">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <StepCardNew step={step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

