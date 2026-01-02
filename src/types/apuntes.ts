// types/apuntes.ts

export interface Apunte {
  id: string
  titulo?: string
  contenido: string
  color: string
  orden: number
  pinned?: boolean
  archived?: boolean
  created_at: string
  updated_at: string
}

export const coloresDisponibles = [
  { name: 'Amarillo', hex: '#FBBF24', emoji: '🟡' },
  { name: 'Azul', hex: '#3B82F6', emoji: '🔵' },
  { name: 'Verde', hex: '#22C55E', emoji: '🟢' },
  { name: 'Morado', hex: '#A855F7', emoji: '🟣' },
  { name: 'Rojo', hex: '#EF4444', emoji: '🔴' },
  { name: 'Naranja', hex: '#F97316', emoji: '🟠' },
]
