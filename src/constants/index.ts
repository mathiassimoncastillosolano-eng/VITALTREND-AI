import type { RiskLevel, ScenarioKey, VitalKey, VitalSigns } from '../types'

export const VITAL_KEYS: VitalKey[] = ['hr', 'rr', 'spo2', 'temp', 'sbp']
export const PRIMARY_VITALS: VitalKey[] = ['hr', 'rr', 'spo2', 'temp']
/** Signos que se muestran en tarjetas y en la vista clínica (incluye presión arterial). */
export const DISPLAY_VITALS: VitalKey[] = ['hr', 'rr', 'spo2', 'temp', 'sbp']

export const VITAL_META: Record<
  VitalKey,
  { label: string; short: string; unit: string; decimals: number; adverse: 1 | -1; min: number; max: number }
> = {
  hr: { label: 'Frecuencia cardíaca', short: 'FC', unit: 'bpm', decimals: 0, adverse: 1, min: 35, max: 190 },
  rr: { label: 'Frecuencia respiratoria', short: 'FR', unit: 'rpm', decimals: 0, adverse: 1, min: 6, max: 45 },
  spo2: { label: 'Saturación de oxígeno', short: 'SpO₂', unit: '%', decimals: 0, adverse: -1, min: 70, max: 100 },
  temp: { label: 'Temperatura', short: 'T°', unit: '°C', decimals: 1, adverse: 1, min: 34, max: 41.5 },
  sbp: { label: 'Presión arterial sistólica', short: 'PAS', unit: 'mmHg', decimals: 0, adverse: -1, min: 60, max: 200 },
}

/** Prior poblacional usado en el arranque en frío (cold start). */
export const POPULATION_PRIOR: Record<VitalKey, { mean: number; sd: number }> = {
  hr: { mean: 76, sd: 12 },
  rr: { mean: 16, sd: 3 },
  spo2: { mean: 97, sd: 2 },
  temp: { mean: 36.8, sd: 0.4 },
  sbp: { mean: 120, sd: 14 },
}

export const BASELINE_FULL_HOURS = 24
export const BASELINE_MEDIUM_HOURS = 6
export const BASELINE_HIGH_HOURS = 16

export const HISTORY_WINDOWS = 24
export const MAX_HISTORY = 36
export const CLOCK_END_MIN = 10 * 60 + 42
export const WINDOW_MINUTES = 60
export const PERSISTENCE_WINDOWS = 3
export const DEVIATION_Z_THRESHOLD = 2
export const MIN_DEVIANT_VITALS = 2
export const NEWS2_ALERT_THRESHOLD = 5

export const RISK_SCALE = 1.3
export const RISK_THRESHOLDS = { evaluacion: 25, elevado: 50, critico: 75 } as const

export const LEVEL_ORDER: Record<RiskLevel, number> = { estable: 0, evaluacion: 1, elevado: 2, critico: 3 }

export const LEVEL_META: Record<RiskLevel, { label: string; short: string; tone: string }> = {
  estable: { label: 'Estable', short: 'Estable', tone: 'ok' },
  evaluacion: { label: 'En observación', short: 'Observación', tone: 'warn' },
  elevado: { label: 'Riesgo elevado', short: 'Elevado', tone: 'high' },
  critico: { label: 'Crítico', short: 'Crítico', tone: 'crit' },
}

export const SCENARIO_META: Record<ScenarioKey, { label: string; description: string }> = {
  estable: { label: 'Estable', description: 'Signos cercanos a su línea base.' },
  deterioro: { label: 'Deterioro', description: 'Desviación moderada, persistencia en construcción.' },
  elevado: { label: 'Riesgo elevado', description: 'Desviación alta y sostenida; NEWS2 aún bajo.' },
  critico: { label: 'Crítico', description: 'Deterioro evidente en varios signos.' },
}
export const SCENARIO_TARGET_NAME = 'Paciente 03'

/** Desplazamientos absolutos respecto a la línea base para cada escenario de prueba. */
export const SCENARIO_OFFSETS: Record<ScenarioKey, VitalSigns> = {
  estable: { hr: 0, rr: 0, spo2: 0, temp: 0, sbp: 0 },
  deterioro: { hr: 14, rr: 4, spo2: -2, temp: 0.8, sbp: -6 },
  elevado: { hr: 22, rr: 6, spo2: -3, temp: 1.5, sbp: -10 },
  critico: { hr: 46, rr: 14, spo2: -12, temp: 2.6, sbp: -32 },
}

export const SHAP_WEIGHTS = { rr: 0.3, spo2: 0.28, shock: 0.18, hr: 0.12, temp: 0.12, trend: 0.1 } as const

export const DEMO_PATIENT_ID = 'p03'
export const SIM_TICK_MS = 3500
export const SIM_SPEEDS = [0.5, 1, 2] as const

export const DISCLAIMER =
  'VitalTrend AI es una herramienta experimental de apoyo a la priorización. No diagnostica, no sustituye el juicio clínico y no ha sido validada prospectivamente.'

/** Color de cada signo en gráficos y monitor (coherente en toda la aplicación). */
export const VITAL_COLOR: Record<VitalKey, string> = {
  hr: '#34d3aa',
  rr: '#f3b84a',
  spo2: '#5bc8ff',
  temp: '#f97f50',
  sbp: '#b69cff',
}
