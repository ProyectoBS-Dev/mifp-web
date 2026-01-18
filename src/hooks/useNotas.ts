import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface RA {
  id: string
  numero: number
  titulo: string
  pesoHoras: number
}

export interface PAC {
  id: string
  numero: number
  titulo: string
  tipo: 'interactiva' | 'desarrollo'
  raId: string
  nota: number | null
  pesoEnRA: number
}

export interface AsignaturaNotas {
  id: string
  asignaturaId: string
  nombre: string
  codigo: string
  ras: RA[]
  pacs: PAC[]
  notaExamen: number | null
  convocatoria: number
  tieneGD: boolean
}

export interface FCTData {
  id: string | null
  nota: number | null
  empresa: string | null
  fechaInicio: string | null
  fechaFin: string | null
  horasTotales: number
}

export interface NotasData {
  asignaturas: AsignaturaNotas[]
  fct: FCTData
  semestreActivo: {
    id: string
    nombre: string
  } | null
}

// Tipos internos para las queries
interface SemestreRow {
  id: string
  nombre: string
}

interface UserAsignaturaRow {
  id: string
  asignatura_id: string
  asignaturas: {
    id: string
    nombre: string
    codigo: string
  } | null
}

interface GDRow {
  id: string
  estado: string
}

interface RARow {
  id: string
  numero: number
  titulo: string
  peso_nota: number | null
}

interface PACRow {
  id: string
  numero: number
  numero_en_ra: number | null
  titulo: string
  tipo_pac: string
  ra_id: string | null
  peso_nota: number | null
}

interface UserPACRow {
  pac_id: string
  nota: number | null
}

interface ExamenRow {
  nota_examen: number | null
  convocatoria: number
}

interface FCTRow {
  id: string
  nota: number | null
  empresa: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  horas_totales: number
}

// ============================================
// HOOK PRINCIPAL: useNotas (Optimizado con RPC)
// ============================================

/**
 * Hook para obtener notas del usuario.
 * @param semestreId - ID del semestre (opcional, por defecto el activo)
 */
export function useNotas(semestreId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notas', semestreId ?? 'activo'],
    queryFn: async (): Promise<NotasData> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      // Usar RPC optimizada que hace todo en una query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('get_notas_completas', {
        p_user_id: user.id,
        p_semestre_id: semestreId ?? null
      })

      if (error) {
        console.error('Error en get_notas_completas:', error)
        throw error
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = data as any

      if (result?.error) {
        return {
          asignaturas: [],
          fct: { id: null, nota: null, empresa: null, fechaInicio: null, fechaFin: null, horasTotales: 400 },
          semestreActivo: null
        }
      }

      // Transformar respuesta de la RPC a formato esperado
      const asignaturas: AsignaturaNotas[] = (result.asignaturas || []).map((asig: RpcAsignatura) => ({
        id: asig.id,
        asignaturaId: asig.asignatura_id,
        nombre: asig.nombre,
        codigo: asig.codigo,
        tieneGD: asig.tiene_gd,
        ras: (asig.ras || []).map((ra: RpcRA) => ({
          id: ra.id,
          numero: ra.numero,
          titulo: ra.titulo,
          pesoHoras: ra.peso_nota || 0
        })),
        pacs: (asig.pacs || []).map((pac: RpcPAC) => ({
          id: pac.id,
          numero: pac.numero,
          titulo: pac.titulo,
          tipo: pac.tipo_pac as 'interactiva' | 'desarrollo',
          raId: pac.ra_id || '',
          nota: pac.nota,
          pesoEnRA: pac.peso_nota || 0
        })),
        notaExamen: asig.examen?.nota_examen ?? null,
        convocatoria: asig.examen?.convocatoria ?? 1
      }))

      const fct: FCTData = {
        id: result.fct?.id ?? null,
        nota: result.fct?.nota ?? null,
        empresa: result.fct?.empresa ?? null,
        fechaInicio: result.fct?.fecha_inicio ?? null,
        fechaFin: result.fct?.fecha_fin ?? null,
        horasTotales: result.fct?.horas_totales ?? 400
      }

      const semestreActivo = result.semestre ? {
        id: result.semestre.id,
        nombre: result.semestre.nombre
      } : null

      return {
        asignaturas,
        fct,
        semestreActivo
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Tipos para la respuesta de la RPC
interface RpcAsignatura {
  id: string
  asignatura_id: string
  nombre: string
  codigo: string
  tiene_gd: boolean
  ras: RpcRA[]
  pacs: RpcPAC[]
  examen: RpcExamen | null
}

interface RpcRA {
  id: string
  numero: number
  titulo: string
  peso_nota: number | null
}

interface RpcPAC {
  id: string
  numero: number
  titulo: string
  tipo_pac: string
  ra_id: string | null
  peso_nota: number | null
  nota: number | null
}

interface RpcExamen {
  nota_examen: number | null
  nota_final_calculada: number | null
  convocatoria: number
  aprobada: boolean | null
}

// ============================================
// MUTACIÓN: Guardar nota PAC
// ============================================

interface SavePACNotaParams {
  userAsignaturaId: string
  pacId: string
  nota: number | null
}

export function useSavePACNota() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userAsignaturaId, pacId, nota }: SavePACNotaParams) => {
      if (nota !== null && (nota < 0 || nota > 10)) {
        throw new Error('La nota debe estar entre 0 y 10')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('user_asignatura_pacs') as any)
        .upsert({
          user_asignatura_id: userAsignaturaId,
          pac_id: pacId,
          nota: nota !== null ? Math.round(nota * 100) / 100 : null,
          completada: nota !== null,
        }, {
          onConflict: 'user_asignatura_id,pac_id'
        })

      if (error) throw new Error('Error al guardar la nota de la PAC: ' + error.message)

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
    }
  })
}

// ============================================
// MUTACIÓN: Guardar nota Examen
// ============================================

interface SaveExamenNotaParams {
  userAsignaturaId: string
  nota: number | null
  convocatoria?: number
}

export function useSaveExamenNota() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userAsignaturaId, nota, convocatoria = 1 }: SaveExamenNotaParams) => {
      if (convocatoria < 1 || convocatoria > 4) {
        throw new Error('Convocatoria inválida (1-4)')
      }

      if (nota !== null && (nota < 0 || nota > 10)) {
        throw new Error('La nota debe estar entre 0 y 10')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('user_notas_examen') as any)
        .upsert({
          user_asignatura_id: userAsignaturaId,
          nota_examen: nota !== null ? Math.round(nota * 100) / 100 : null,
          convocatoria,
        }, {
          onConflict: 'user_asignatura_id,convocatoria'
        })

      if (error) throw new Error('Error al guardar la nota del examen: ' + error.message)

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
    }
  })
}

// ============================================
// MUTACIÓN: Guardar nota FCT
// ============================================

interface SaveFCTNotaParams {
  nota: number | null
  empresa?: string | null
}

export function useSaveFCTNota() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ nota, empresa }: SaveFCTNotaParams) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      if (nota !== null && (nota < 0 || nota > 10)) {
        throw new Error('La nota debe estar entre 0 y 10')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('user_fct') as any)
        .upsert({
          user_id: user.id,
          nota: nota !== null ? Math.round(nota * 100) / 100 : null,
          empresa: empresa ?? null,
        }, {
          onConflict: 'user_id'
        })

      if (error) throw new Error('Error al guardar la nota de FCT: ' + error.message)

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] })
    }
  })
}

// ============================================
// FUNCIONES DE CÁLCULO (Client-side)
// ============================================

/**
 * Calcula la media ponderada de las PACs de un RA
 */
export function calcularMediaPACsRA(pacs: PAC[]): { media: number | null; completado: number } {
  const pacsConNota = pacs.filter(p => p.nota !== null)
  if (pacsConNota.length === 0) return { media: null, completado: 0 }

  let sumaPonderada = 0
  let sumaPesos = 0

  pacsConNota.forEach(pac => {
    sumaPonderada += pac.nota! * pac.pesoEnRA
    sumaPesos += pac.pesoEnRA
  })

  const totalPeso = pacs.reduce((acc, p) => acc + p.pesoEnRA, 0)
  const completado = totalPeso > 0 ? (sumaPesos / totalPeso) * 100 : 0

  return {
    media: sumaPesos > 0 ? sumaPonderada / sumaPesos : null,
    completado: Math.round(completado)
  }
}

/**
 * Calcula la nota de un RA
 * Fórmula ILERNA: Nota_RA = (Media_PACs × 40%) + (Examen × 60%)
 */
export function calcularNotaRA(
  pacs: PAC[],
  notaExamen: number | null
): {
  notaRA: number | null
  mediaEC: number | null
  aprobado: boolean
  examenAprobado: boolean
  completado: number
} {
  const { media: mediaEC, completado } = calcularMediaPACsRA(pacs)

  if (notaExamen === null) {
    return {
      notaRA: mediaEC !== null ? mediaEC * 0.4 : null,
      mediaEC,
      aprobado: false,
      examenAprobado: false,
      completado
    }
  }

  const examenAprobado = notaExamen >= 5

  if (!examenAprobado) {
    return {
      notaRA: notaExamen,
      mediaEC,
      aprobado: false,
      examenAprobado: false,
      completado
    }
  }

  const ecPonderada = (mediaEC ?? 0) * 0.4
  const examenPonderado = notaExamen * 0.6
  const notaRA = ecPonderada + examenPonderado

  return {
    notaRA,
    mediaEC,
    aprobado: notaRA >= 5,
    examenAprobado: true,
    completado
  }
}

/**
 * Calcula la nota final del módulo
 * Fórmula: Media ponderada RAs por horas (90%) + FCT (10%)
 */
export function calcularNotaModulo(
  ras: RA[],
  notasRAs: Map<string, number>,
  notaFCT: number | null
): {
  notaSinFCT: number | null
  notaConFCT: number | null
  todosRAsAprobados: boolean
} {
  let sumaPonderada = 0
  let sumaPesos = 0
  let todosAprobados = true

  ras.forEach(ra => {
    const notaRA = notasRAs.get(ra.id)
    if (notaRA !== undefined && notaRA !== null) {
      sumaPonderada += notaRA * ra.pesoHoras
      sumaPesos += ra.pesoHoras
      if (notaRA < 5) todosAprobados = false
    } else {
      todosAprobados = false
    }
  })

  if (sumaPesos === 0) {
    return { notaSinFCT: null, notaConFCT: null, todosRAsAprobados: false }
  }

  const mediaRAs = sumaPonderada / sumaPesos

  const notaConFCT = notaFCT !== null
    ? (mediaRAs * 0.9) + (notaFCT * 0.1)
    : null

  return {
    notaSinFCT: mediaRAs,
    notaConFCT,
    todosRAsAprobados: todosAprobados
  }
}
