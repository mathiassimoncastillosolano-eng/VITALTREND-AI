import type { RiskLevel, Severity } from '../types'

/** Relaciona la severidad de una desviación con la paleta de estados. */
export function severityLevel(s: Severity): RiskLevel {
  return s === 'alta' ? 'critico' : s === 'moderada' ? 'elevado' : s === 'leve' ? 'evaluacion' : 'estable'
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  normal: 'Dentro de su rango',
  leve: 'Desviación leve',
  moderada: 'Desviación moderada',
  alta: 'Desviación alta',
}
