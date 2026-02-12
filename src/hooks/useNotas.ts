import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TIPOS
// ============================================

export interface RA {
  id: string
  numero: number
  codigo: string | null
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
  notaFinalCalculada: number | null
  convocatoria: number
  tieneGD: boolean
  /** true solo cuando tieneGD Y el semestre es el activo.
   *  Cuando false, se usa notaFinalCalculada directamente. */
  usarCalculoPACs: boolean
  aprobada: boolean
}

export interface FCTData {
  id: string | null
  nota: number | null
  empresa: string | null
  fechaInicio: string | null
  fechaFin: string | null
  horasTotales: number
}

/**
 * Tipos para la respuesta de la RPC get_notas_completas
 */
interface RpcResponse {
  error?: string
  asignaturas?: RpcAsignatura[]
  fct?: {
    id: string
    nota: number | null
    empresa: string | null
    fecha_inicio: string | null
    fecha_fin: string | null
    horas_totales: number
  }
  semestre?: {
    id: string
    nombre: string
    activo?: boolean
  }
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
      const { data, error } = await supabase.rpc('get_notas_completas', {
        p_user_id: user.id,
        p_semestre_id: semestreId ?? (null as unknown as undefined)
      })

      if (error) {
        console.error('Error en get_notas_completas:', error)
        throw error
      }

      // Cast a tipo específico desde Json
      const result = data as unknown as RpcResponse

      if (result?.error) {
        return {
          asignaturas: [],
          fct: { id: null, nota: null, empresa: null, fechaInicio: null, fechaFin: null, horasTotales: 400 },
          semestreActivo: null
        }
      }

      // Determinar si el semestre consultado es el activo
      const esSemestreActivo = result?.semestre?.activo ?? false

      // Transformar respuesta de la RPC a formato esperado
      const asignaturas: AsignaturaNotas[] = (result?.asignaturas || []).map((asig: RpcAsignatura) => {
        // Calcular peso equitativo si peso_nota es null
        const numRAs = (asig.ras || []).length || 1
        const pesoEquitativo = Math.round(100 / numRAs)

        return {
          id: asig.id,
          asignaturaId: asig.asignatura_id,
          nombre: asig.nombre,
          codigo: asig.codigo,
          tieneGD: asig.tiene_gd,
          // Solo usar cálculo PACs cuando la GD está validada Y el semestre es el activo
          usarCalculoPACs: asig.tiene_gd && esSemestreActivo,
          ras: (asig.ras || []).map((ra: RpcRA) => ({
            id: ra.id,
            numero: ra.numero,
            codigo: ra.codigo ?? null,
            titulo: ra.titulo,
            pesoHoras: ra.peso_nota ?? pesoEquitativo  // Peso equitativo si es null
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
          notaFinalCalculada: asig.examen?.nota_final_calculada ?? null,
          convocatoria: asig.examen?.convocatoria ?? 1,
          aprobada: asig.examen?.aprobada ?? false
        }
      })

      const fct: FCTData = {
        id: result?.fct?.id ?? null,
        nota: result?.fct?.nota ?? null,
        empresa: result?.fct?.empresa ?? null,
        fechaInicio: result?.fct?.fecha_inicio ?? null,
        fechaFin: result?.fct?.fecha_fin ?? null,
        horasTotales: result?.fct?.horas_totales ?? 400
      }

      const semestreActivo = result?.semestre ? {
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
  codigo: string | null
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

      const { error } = await supabase.from('user_asignatura_pacs')
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
      queryClient.invalidateQueries({ queryKey: ['grade-progress'] })
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

      const { error } = await supabase.from('user_notas_examen')
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
      queryClient.invalidateQueries({ queryKey: ['grade-progress'] })
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

      const { error } = await supabase.from('user_fct')
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
      queryClient.invalidateQueries({ queryKey: ['grade-progress'] })
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
 * Fórmula FP Online: Nota_RA = (Media_PACs × 40%) + (Examen × 60%)
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

// ============================================
// TIPO: EstadoAsignatura (centralizado)
// ============================================

export type EstadoAsignatura = 'sin_notas' | 'en_progreso' | 'aprobada' | 'suspensa'

// ============================================
// FUNCIÓN: calcularDatosAsignatura
// Calcula nota, estado y progreso de una asignatura.
// Centraliza la lógica para sidebar, dashboard, mobile, etc.
// ============================================

export interface AsignaturaCalculadaResult {
  notaModulo: number | null
  estado: EstadoAsignatura
  rasCompletados: number
  rasTotal: number
}

/**
 * Calcula los datos de visualización de una asignatura.
 *
 * - Si `usarCalculoPACs` es true (GD validada + semestre activo),
 *   calcula la nota desde PACs + examen usando la fórmula ILERNA.
 * - En caso contrario, usa `notaFinalCalculada` directamente.
 *
 * @param asig       - datos de la asignatura
 * @param fctNota    - nota FCT del usuario (para media con FCT)
 * @returns datos calculados para sidebar/dashboard
 */
export function calcularDatosAsignatura(
  asig: AsignaturaNotas,
  fctNota: number | null
): AsignaturaCalculadaResult {
  // ------------------------------------------------------------------
  // CASO 1: Usar notaFinalCalculada directamente
  // (semestre inactivo O asignatura sin GD)
  // ------------------------------------------------------------------
  if (!asig.usarCalculoPACs) {
    const notaFinal = asig.notaFinalCalculada

    let estado: EstadoAsignatura = 'sin_notas'
    if (notaFinal !== null) {
      estado = notaFinal >= 5 ? 'aprobada' : 'suspensa'
    }

    return {
      notaModulo: notaFinal,
      estado,
      rasCompletados: 0,
      rasTotal: 0
    }
  }

  // ------------------------------------------------------------------
  // CASO 2: Calcular desde PACs + examen (semestre activo con GD)
  // ------------------------------------------------------------------
  const notasMap = new Map<string, number>()
  let todosRAsAprobados = true
  let rasCompletados = 0

  asig.ras.forEach(ra => {
    const pacsDelRA = asig.pacs.filter(p => p.raId === ra.id)
    const resultado = calcularNotaRA(pacsDelRA, asig.notaExamen)
    if (resultado.notaRA !== null) {
      notasMap.set(ra.id, resultado.notaRA)
      if (resultado.notaRA < 5) {
        todosRAsAprobados = false
      } else {
        rasCompletados++
      }
    } else {
      todosRAsAprobados = false
    }
  })

  const notaModuloResult = calcularNotaModulo(asig.ras, notasMap, fctNota)
  const notaModulo = notaModuloResult.notaSinFCT

  // Determinar estado
  const tieneNotaPAC = asig.pacs.some(p => p.nota !== null)
  const tieneExamen = asig.notaExamen !== null

  let estado: EstadoAsignatura = 'sin_notas'

  if (!tieneNotaPAC && !tieneExamen) {
    estado = 'sin_notas'
  } else if (!tieneExamen) {
    estado = 'en_progreso'
  } else if (asig.notaFinalCalculada !== null) {
    estado = asig.notaFinalCalculada >= 5 ? 'aprobada' : 'suspensa'
  } else if (notaModulo !== null) {
    const examenAprobado = asig.notaExamen! >= 5
    estado = (examenAprobado && notaModulo >= 5) ? 'aprobada' : 'suspensa'
  } else {
    estado = 'en_progreso'
  }

  return {
    notaModulo,
    estado,
    rasCompletados,
    rasTotal: asig.ras.length
  }
}

/**
 * Tipo auxiliar para las estadísticas agregadas de un semestre.
 */
export interface StatsAsignaturas {
  media: number | null
  aprobadas: number
  suspensas: number
  pendientes: number
  total: number
}

/**
 * Calcula las estadísticas agregadas y datos de visualización
 * de todas las asignaturas de un semestre.
 */
export function calcularDatosSemestre(
  asignaturas: AsignaturaNotas[],
  fctNota: number | null
): {
  asignaturasCalculadas: { id: string; nombre: string; codigo: string; estado: EstadoAsignatura; notaModulo: number | null; rasCompletados: number; rasTotal: number }[]
  stats: StatsAsignaturas
} {
  let aprobadas = 0
  let suspensas = 0
  let pendientes = 0
  let sumaNotas = 0
  let countNotas = 0
  const total = asignaturas.length

  const asignaturasCalculadas = asignaturas.map(asig => {
    const calc = calcularDatosAsignatura(asig, fctNota)

    // Actualizar estadísticas
    if (calc.notaModulo !== null) {
      sumaNotas += calc.notaModulo
      countNotas++
      if (calc.estado === 'aprobada') {
        aprobadas++
      } else {
        suspensas++
      }
    } else {
      pendientes++
    }

    return {
      id: asig.id,
      nombre: asig.nombre,
      codigo: asig.codigo,
      estado: calc.estado,
      notaModulo: calc.notaModulo,
      rasCompletados: calc.rasCompletados,
      rasTotal: calc.rasTotal
    }
  })

  return {
    asignaturasCalculadas,
    stats: {
      media: countNotas > 0 ? sumaNotas / countNotas : null,
      aprobadas,
      suspensas,
      pendientes,
      total
    }
  }
}
