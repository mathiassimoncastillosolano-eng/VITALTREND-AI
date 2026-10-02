import { LEVEL_ORDER, PERSISTENCE_WINDOWS, VITAL_META } from '../constants'
import type { Alert, Patient, PatientAnalysis, RiskLevel, TimelineEvent } from '../types'
import { levelSeries } from './clinical'

export function deriveAlerts(
  patients: Patient[],
  analyses: Record<string, PatientAnalysis>,
  required: number,
): Alert[] {
  const out: Alert[] = []
  for (const p of patients) {
    const a = analyses[p.id]
    if (!a || LEVEL_ORDER[a.risk.level] < LEVEL_ORDER.evaluacion) continue
    out.push({
      id: `${p.id}:${a.risk.level}`,
      patientId: p.id,
      level: a.risk.level,
      t: a.current.t - Math.max(0, a.persistence - 1),
      factor: a.shap[0]?.title ?? 'Desviación respecto a la línea base',
      persistence: a.persistence,
      required,
    })
  }
  return out.sort((x, y) => LEVEL_ORDER[y.level] - LEVEL_ORDER[x.level] || y.t - x.t)
}

/** Pacientes cuya alerta habría sido emitida sin filtro anti-fatiga. */
export function suppressedPatients(patients: Patient[], analyses: Record<string, PatientAnalysis>): Patient[] {
  return patients.filter((p) => analyses[p.id]?.risk.suppressedByPersistence)
}

const LEVEL_TITLE: Record<RiskLevel, string> = {
  estable: 'Estable',
  evaluacion: 'Requiere evaluación',
  elevado: 'Riesgo elevado',
  critico: 'Crítico: evaluación prioritaria',
}

/** Línea de tiempo derivada de la serie histórica del paciente (mismos datos que gráficos y cards). */
export function deriveTimeline(patient: Patient, analysis: PatientAnalysis, required: number): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const series = levelSeries(patient, required)
  const pts = patient.history

  for (let i = 1; i < series.length; i++) {
    if (LEVEL_ORDER[series[i].level] > LEVEL_ORDER[series[i - 1].level]) {
      events.push({
        id: `lvl-${series[i].t}`,
        t: series[i].t,
        level: series[i].level,
        title: LEVEL_TITLE[series[i].level],
        detail: `Nivel de riesgo actualizado. Persistencia ${series[i].persistence}/${PERSISTENCE_WINDOWS} ventanas.`,
      })
    }
    if (series[i].persistence === required && series[i - 1].persistence < required) {
      events.push({
        id: `pers-${series[i].t}`,
        t: series[i].t,
        level: series[i].level,
        title: 'Desviación sostenida confirmada',
        detail: `El filtro anti-fatiga confirmó ${required}/${PERSISTENCE_WINDOWS} ventanas consecutivas con desviación.`,
      })
    }
  }

  // Primer momento de la racha actual de desviación por signo vital.
  for (const k of ['rr', 'spo2', 'hr', 'temp', 'sbp'] as const) {
    const dev = analysis.deviations[k]
    if (dev.adverseZ < 2) continue
    const stat = patient.baseline.stats[k]
    let start = pts.length - 1
    while (start > 0 && (VITAL_META[k].adverse * (pts[start - 1][k] - stat.mean)) / stat.sd >= 2) start--
    events.push({
      id: `vital-${k}`,
      t: pts[start].t,
      level: 'evaluacion',
      title: `${VITAL_META[k].short} ${VITAL_META[k].adverse === 1 ? 'elevada' : 'descendió'} respecto a línea base`,
      detail: `${VITAL_META[k].label}: ${pts[start][k].toFixed(VITAL_META[k].decimals)} ${VITAL_META[k].unit} al inicio de la desviación; ahora ${dev.current.toFixed(VITAL_META[k].decimals)} ${VITAL_META[k].unit}.`,
    })
  }
  return events.sort((a, b) => b.t - a.t || LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level])
}
