import { useMemo } from 'react'
import { LEVEL_ORDER, VITAL_META } from '@/constants'
import { mockEngine } from '@/mockEngine'
import { computeStats, useAppStore, type SortKey } from '@/store/useAppStore'
import type { Alert, Patient, PatientAnalysis } from '@/types'
import { patientMatches } from '@/utils/search'

export function useStats() {
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  return useMemo(() => computeStats(patients, analyses), [patients, analyses])
}

export function useAlerts(): Alert[] {
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const required = useAppStore((s) => s.settings.requiredWindows)
  return useMemo(() => mockEngine.getAlerts(patients, analyses, required), [patients, analyses, required])
}

/** Momento más reciente del monitoreo (minutos del día): referencia para "hace N min". */
export function useNowMin(): number {
  const patients = useAppStore((s) => s.patients)
  return useMemo(() => patients.reduce((m, p) => Math.max(m, p.lastUpdateMin), 0), [patients])
}

const VITAL_SORT: Partial<Record<SortKey, 'hr' | 'spo2' | 'temp' | 'rr'>> = { hr: 'hr', spo2: 'spo2', temp: 'temp', rr: 'rr' }

/** Valor numérico por el que se ordena un paciente. */
function sortValue(p: Patient, a: PatientAnalysis, sort: SortKey): number {
  if (sort === 'riesgo') return LEVEL_ORDER[a.risk.level] * 1000 + a.risk.score
  if (sort === 'actualizacion') return p.lastUpdateMin
  const vital = VITAL_SORT[sort]
  return vital ? a.current[vital] : 0
}

export function useFilteredPatients() {
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const { level, query, sort, dir } = useAppStore((s) => s.filter)
  return useMemo(() => {
    const list = patients.filter((p) => {
      const a = analyses[p.id]
      if (!a) return false
      if (level !== 'todos' && a.risk.level !== level) return false
      return patientMatches(p, query)
    })
    const sign = dir === 'desc' ? -1 : 1
    return [...list].sort((x, y) => {
      const ax = analyses[x.id]
      const ay = analyses[y.id]
      const diff = sortValue(x, ax, sort) - sortValue(y, ay, sort)
      // Desempate estable: mayor riesgo primero.
      return diff !== 0 ? sign * diff : ay.risk.score - ax.risk.score
    })
  }, [patients, analyses, level, query, sort, dir])
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'riesgo', label: 'Nivel de riesgo' },
  { value: 'actualizacion', label: 'Última actualización' },
  { value: 'hr', label: VITAL_META.hr.label },
  { value: 'spo2', label: 'Saturación (SpO₂)' },
  { value: 'temp', label: VITAL_META.temp.label },
  { value: 'rr', label: VITAL_META.rr.label },
]
