import { useMemo } from 'react'
import { LEVEL_ORDER } from '@/constants'
import { mockEngine } from '@/mockEngine'
import { computeStats, useAppStore } from '@/store/useAppStore'
import type { Alert } from '@/types'

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

export function useFilteredPatients() {
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const { level, query, sort } = useAppStore((s) => s.filter)
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = patients.filter((p) => {
      const a = analyses[p.id]
      if (!a) return false
      if (level !== 'todos' && a.risk.level !== level) return false
      if (!q) return true
      return [p.code, p.hospitalId, p.room, `cama ${p.bed}`, `hab ${p.room}`, p.specialty].some((x) =>
        x.toLowerCase().includes(q),
      )
    })
    return [...list].sort((x, y) => {
      const ax = analyses[x.id]
      const ay = analyses[y.id]
      if (sort === 'riesgo') return ay.risk.score - ax.risk.score
      if (sort === 'actualizacion') return y.lastUpdateMin - x.lastUpdateMin || ay.risk.score - ax.risk.score
      return LEVEL_ORDER[ay.risk.level] - LEVEL_ORDER[ax.risk.level] || ay.risk.score - ax.risk.score
    })
  }, [patients, analyses, level, query, sort])
}
