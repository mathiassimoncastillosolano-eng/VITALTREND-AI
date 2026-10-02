import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { AlertStatus, DecisionType } from '@/types'

const MESSAGES: Record<DecisionType, string> = {
  revisada: 'Alerta revisada correctamente.',
  evaluacion: 'Evaluación solicitada (simulado).',
  descartada: 'Alerta descartada (simulado).',
  registrada: 'Decisión clínica registrada (simulado).',
}

const STATUS: Record<DecisionType, AlertStatus> = {
  revisada: 'revisada',
  evaluacion: 'evaluacion',
  descartada: 'descartada',
  registrada: 'revisada',
}

/** Acciones clínicas simuladas: solo actualizan el estado del frontend (sin backend). */
export function useClinicalActions() {
  const setAlertStatus = useAppStore((s) => s.setAlertStatus)
  const addDecision = useAppStore((s) => s.addDecision)
  const pushToast = useAppStore((s) => s.pushToast)
  return useCallback(
    (patientId: string, alertId: string | null, type: DecisionType, note = '') => {
      if (alertId) setAlertStatus(alertId, STATUS[type])
      addDecision({ patientId, type, note })
      pushToast('success', MESSAGES[type])
    },
    [setAlertStatus, addDecision, pushToast],
  )
}
