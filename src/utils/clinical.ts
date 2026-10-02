import {
  BASELINE_FULL_HOURS,
  BASELINE_HIGH_HOURS,
  BASELINE_MEDIUM_HOURS,
  DEVIATION_Z_THRESHOLD,
  LEVEL_ORDER,
  MIN_DEVIANT_VITALS,
  PERSISTENCE_WINDOWS,
  POPULATION_PRIOR,
  PRIMARY_VITALS,
  RISK_SCALE,
  RISK_THRESHOLDS,
  SHAP_WEIGHTS,
  VITAL_KEYS,
  VITAL_META,
  WINDOW_MINUTES,
} from '../constants'
import type {
  Baseline,
  BaselineConfidence,
  BaselineDeviation,
  BaselineStat,
  Confidence,
  LeadTime,
  Patient,
  PatientAnalysis,
  RiskLevel,
  Severity,
  VitalKey,
  VitalPoint,
  VitalTrend,
} from '../types'
import { clamp } from './format'
import { buildShapFactors } from './explain'
import { computeNews2 } from './news2'

type StatMap = Record<VitalKey, BaselineStat>

/** Mezcla ponderada (bayesiana simple) entre prior poblacional y evidencia individual. */
export function effectiveBaseline(baseline: Baseline): StatMap {
  const w = clamp(baseline.hoursAccumulated / BASELINE_FULL_HOURS, 0, 1)
  const out = {} as StatMap
  for (const k of VITAL_KEYS) {
    const ind = baseline.stats[k]
    const pri = POPULATION_PRIOR[k]
    out[k] = { mean: w * ind.mean + (1 - w) * pri.mean, sd: w * ind.sd + (1 - w) * pri.sd }
  }
  return out
}

export function baselineConfidence(hours: number): BaselineConfidence {
  return hours >= BASELINE_HIGH_HOURS ? 'alta' : hours >= BASELINE_MEDIUM_HOURS ? 'media' : 'baja'
}

export const adverseZ = (key: VitalKey, value: number, stat: BaselineStat) =>
  (VITAL_META[key].adverse * (value - stat.mean)) / stat.sd

export const severityOf = (z: number): Severity =>
  z < 1 ? 'normal' : z < 2 ? 'leve' : z < 3 ? 'moderada' : 'alta'

export function levelFromScore(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critico) return 'critico'
  if (score >= RISK_THRESHOLDS.elevado) return 'elevado'
  if (score >= RISK_THRESHOLDS.evaluacion) return 'evaluacion'
  return 'estable'
}

export function computeDeviations(point: VitalPoint, eff: StatMap): Record<VitalKey, BaselineDeviation> {
  const out = {} as Record<VitalKey, BaselineDeviation>
  for (const k of VITAL_KEYS) {
    const base = eff[k].mean
    const z = adverseZ(k, point[k], eff[k])
    out[k] = {
      key: k,
      current: point[k],
      baseline: base,
      absolute: point[k] - base,
      percent: ((point[k] - base) / base) * 100,
      adverseZ: z,
      severity: severityOf(Math.max(0, z)),
    }
  }
  return out
}

export function isDeviantWindow(point: VitalPoint, eff: StatMap): boolean {
  const n = VITAL_KEYS.filter((k) => adverseZ(k, point[k], eff[k]) >= DEVIATION_Z_THRESHOLD).length
  return n >= MIN_DEVIANT_VITALS
}

const compositeZ = (point: VitalPoint, eff: StatMap) =>
  PRIMARY_VITALS.reduce((s, k) => s + Math.max(0, adverseZ(k, point[k], eff[k])), 0) / PRIMARY_VITALS.length

interface PointScore {
  contributions: Record<string, number>
  raw: number
  persistence: number
  windows: boolean[]
  score: number
  rawLevel: RiskLevel
  level: RiskLevel
  suppressed: boolean
}

function scoreAt(history: VitalPoint[], idx: number, eff: StatMap, required: number): PointScore {
  const p = history[idx]
  const z = (k: VitalKey) => Math.max(0, adverseZ(k, p[k], eff[k]))
  const si = p.hr / p.sbp
  const baseSi = eff.hr.mean / eff.sbp.mean
  const ref = history[Math.max(0, idx - 2)]
  const slope = idx > 0 ? (compositeZ(p, eff) - compositeZ(ref, eff)) / Math.max(1, idx - Math.max(0, idx - 2)) : 0
  const W = SHAP_WEIGHTS
  const contributions = {
    rr: W.rr * clamp(z('rr') / 4, 0, 1),
    spo2: W.spo2 * clamp(z('spo2') / 4, 0, 1),
    shock: W.shock * clamp((si - baseSi) / 0.4, 0, 1),
    hr: W.hr * clamp(z('hr') / 4, 0, 1),
    temp: W.temp * clamp(z('temp') / 4, 0, 1),
    trend: W.trend * clamp(slope, 0, 1),
  }
  const raw = Object.values(contributions).reduce((a, b) => a + b, 0)

  const windows: boolean[] = []
  for (let i = Math.max(0, idx - PERSISTENCE_WINDOWS + 1); i <= idx; i++) windows.push(isDeviantWindow(history[i], eff))
  while (windows.length < PERSISTENCE_WINDOWS) windows.unshift(false)
  let persistence = 0
  for (let i = windows.length - 1; i >= 0 && windows[i]; i--) persistence++

  const factor = 0.55 + (0.45 * persistence) / PERSISTENCE_WINDOWS
  const score = clamp((raw / RISK_SCALE) * 100 * factor, 0, 100)
  // Nivel que generaría un modelo sin filtro anti-fatiga (sin ponderar por persistencia).
  const rawLevel = levelFromScore(clamp((raw / RISK_SCALE) * 100, 0, 100))
  const sustained = persistence >= required
  const suppressed = !sustained && LEVEL_ORDER[rawLevel] >= LEVEL_ORDER.elevado
  const scored = levelFromScore(score)
  const level: RiskLevel = !sustained && LEVEL_ORDER[scored] > LEVEL_ORDER.evaluacion ? 'evaluacion' : scored
  return { contributions, raw, persistence, windows, score, rawLevel, level, suppressed }
}

function confidenceOf(hours: number, persistence: number, score: number): Confidence {
  const w = clamp(hours / BASELINE_FULL_HOURS, 0, 1)
  const value = clamp(0.4 + 0.3 * w + (0.08 * persistence) / PERSISTENCE_WINDOWS + 0.08 * Math.min(1, score / 60), 0, 0.95)
  const label = value < 0.5 ? 'Baja' : value < 0.65 ? 'Media' : value < 0.8 ? 'Media-alta' : 'Alta'
  return { value, label }
}

function horizonOf(level: RiskLevel): [number, number] | null {
  if (level === 'critico') return [1, 3]
  if (level === 'elevado') return [4, 6]
  if (level === 'evaluacion') return [8, 12]
  return null
}

function trendOf(history: VitalPoint[], key: VitalKey, sd: number): VitalTrend {
  const n = history.length
  const a = history[Math.max(0, n - 3)][key]
  const slope = (history[n - 1][key] - a) / Math.max(1, Math.min(2, n - 1))
  const direction = Math.abs(slope) < 0.15 * sd ? 'estable' : slope > 0 ? 'sube' : 'baja'
  return { key, slope, direction }
}

/** Inicio de la racha de alerta que llega hasta la última ventana, o null si no hay alerta vigente. */
function runStart(flags: boolean[], offset: number): number | null {
  const n = flags.length
  if (!n || !flags[n - 1]) return null
  let i = n - 1
  while (i > 0 && flags[i - 1]) i--
  return offset + i
}

export function analyzePatient(patient: Patient, required: number): PatientAnalysis {
  const { history, baseline } = patient
  const eff = effectiveBaseline(baseline)
  const n = history.length
  const idx = n - 1
  const current = history[idx]
  const cur = scoreAt(history, idx, eff, required)
  const news2 = computeNews2(current, patient.onOxygen, patient.consciousness)

  const vtFlags: boolean[] = []
  const n2Flags: boolean[] = []
  for (let i = 0; i < n; i++) {
    const s = scoreAt(history, i, eff, required)
    vtFlags.push(s.persistence >= required && LEVEL_ORDER[s.level] >= LEVEL_ORDER.elevado)
    n2Flags.push(computeNews2(history[i], patient.onOxygen, patient.consciousness).alerting)
  }
  const offset = history[0].t
  const vtT = runStart(vtFlags, offset)
  const n2T = runStart(n2Flags, offset)
  const leadTime: LeadTime = {
    vitalTrendAlertT: vtT,
    news2AlertT: n2T,
    hours: vtT !== null && n2T !== null ? Math.max(0, ((n2T - vtT) * WINDOW_MINUTES) / 60) : null,
  }

  const deviations = computeDeviations(current, eff)
  const trends = {} as Record<VitalKey, VitalTrend>
  for (const k of VITAL_KEYS) trends[k] = trendOf(history, k, eff[k].sd)

  const sustained = cur.persistence >= required
  const hours = baseline.hoursAccumulated
  const shap = buildShapFactors(cur.contributions, { deviations, persistence: cur.persistence, eff, current })

  return {
    patientId: patient.id,
    current,
    previous: n > 1 ? history[n - 2] : null,
    deviations,
    trends,
    windows: cur.windows,
    persistence: cur.persistence,
    sustained,
    shockIndex: current.hr / current.sbp,
    baselineShockIndex: eff.hr.mean / eff.sbp.mean,
    baselineConfidence: baselineConfidence(hours),
    baselineBuilding: hours < BASELINE_MEDIUM_HOURS,
    risk: {
      score: cur.score,
      level: cur.level,
      rawLevel: cur.rawLevel,
      suppressedByPersistence: cur.suppressed,
      horizon: horizonOf(cur.level),
      confidence: confidenceOf(hours, cur.persistence, cur.score),
    },
    shap,
    news2,
    leadTime,
    alertActive: sustained && LEVEL_ORDER[cur.level] >= LEVEL_ORDER.elevado,
    deviationPercentMax: Math.max(...PRIMARY_VITALS.map((k) => Math.abs(deviations[k].percent))),
  }
}

/** Nivel de riesgo en cada ventana histórica (para la línea de tiempo del paciente). */
export function levelSeries(patient: Patient, required: number): { t: number; level: RiskLevel; persistence: number; score: number }[] {
  const eff = effectiveBaseline(patient.baseline)
  return patient.history.map((p, i) => {
    const s = scoreAt(patient.history, i, eff, required)
    return { t: p.t, level: s.level, persistence: s.persistence, score: s.score }
  })
}
