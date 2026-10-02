import { SCENARIO_OFFSETS, VITAL_KEYS, VITAL_META } from '../constants'
import { createMockPatients } from '../data/patients.mock'
import type { Patient, PatientAnalysis, ScenarioKey, VitalPoint, VitalSigns } from '../types'
import { deriveAlerts, deriveTimeline, suppressedPatients } from '../utils/alerts'
import { analyzePatient } from '../utils/clinical'
import { clamp } from '../utils/format'
import { noise } from '../utils/rng'

const LATENCY_MS = 650

/**
 * Capa de simulación: reemplaza al backend. Todas las lecturas pasan por aquí
 * para que la UI no conozca de dónde vienen los datos.
 */
export const mockEngine = {
  /** Simula la carga inicial (permite mostrar skeletons y estado de error). */
  getPatients(options: { fail?: boolean } = {}): Promise<Patient[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (options.fail) reject(new Error('No se pudieron cargar las lecturas de los pacientes.'))
        else resolve(createMockPatients())
      }, LATENCY_MS)
    })
  },

  getAnalysis: analyzePatient,

  analyzeAll(patients: Patient[], required: number): Record<string, PatientAnalysis> {
    const out: Record<string, PatientAnalysis> = {}
    for (const p of patients) out[p.id] = analyzePatient(p, required)
    return out
  },

  getAlerts: deriveAlerts,
  getSuppressed: suppressedPatients,
  getTimeline: deriveTimeline,
  getExplanation: (a: PatientAnalysis) => a.shap,
  getNews2: (a: PatientAnalysis) => a.news2,

  /** Genera una nueva medición suave hacia el objetivo del paciente (sin saltos bruscos). */
  generateMeasurement(patient: Patient, rng: () => number): VitalPoint {
    const last = patient.history[patient.history.length - 1]
    const next = { t: last.t + 1 } as VitalPoint
    for (const k of VITAL_KEYS) {
      const gap = patient.target[k] - last[k]
      const raw = last[k] + gap * 0.22 + noise(rng) * patient.baseline.stats[k].sd * 0.12
      const meta = VITAL_META[k]
      const v = clamp(raw, meta.min, meta.max)
      next[k] = meta.decimals ? Math.round(v * 10) / 10 : Math.round(v)
    }
    return next
  },

  /** Escenario de prueba: define hacia dónde evoluciona el paciente. */
  scenarioTarget(patient: Patient, scenario: ScenarioKey): VitalSigns {
    const off = SCENARIO_OFFSETS[scenario]
    const t = {} as VitalSigns
    for (const k of VITAL_KEYS) {
      const v = patient.baseline.stats[k].mean + off[k]
      t[k] = VITAL_META[k].decimals ? Math.round(v * 10) / 10 : Math.round(v)
    }
    return t
  },
}
