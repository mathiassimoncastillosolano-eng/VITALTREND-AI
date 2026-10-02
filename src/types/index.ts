export type VitalKey = 'hr' | 'rr' | 'spo2' | 'temp' | 'sbp'
export type VitalSigns = Record<VitalKey, number>

export type RiskLevel = 'estable' | 'evaluacion' | 'elevado' | 'critico'
export type Severity = 'normal' | 'leve' | 'moderada' | 'alta'
export type ConfidenceLabel = 'Baja' | 'Media' | 'Media-alta' | 'Alta'
export type BaselineConfidence = 'baja' | 'media' | 'alta'
export type ScenarioKey = 'estable' | 'deterioro' | 'elevado' | 'critico'
export type Consciousness = 'A' | 'CVPU'

/** Una medición (ventana horaria). `t` es el índice absoluto de ventana. */
export interface VitalPoint extends VitalSigns {
  t: number
}

export interface BaselineStat {
  mean: number
  sd: number
}

export interface Baseline {
  stats: Record<VitalKey, BaselineStat>
  hoursAccumulated: number
}

export type PatientTab = 'resumen' | 'vitales' | 'baseline' | 'explicabilidad' | 'comparacion' | 'eventos' | 'evaluacion'

export interface Patient {
  id: string
  code: string
  fullName: string
  sex: 'F' | 'M'
  hospitalId: string
  /** Motivo de ingreso y días de hospitalización (contexto clínico). */
  admissionReason: string
  admittedDays: number
  /** Paciente con monitorización ECG continua. */
  ecgMonitored: boolean
  /** Ritmo de base: sinusal o irregular (fibrilación auricular). */
  rhythm: 'sinusal' | 'irregular'
  room: string
  bed: number
  specialty: string
  age: number
  hue: number
  baseline: Baseline
  history: VitalPoint[]
  /** Valores hacia los que tiende la simulación en vivo. */
  target: VitalSigns
  onOxygen: boolean
  consciousness: Consciousness
  note?: string
  /** Minutos del día (reloj simulado) de la última actualización. */
  lastUpdateMin: number
}

export interface VitalTrend {
  key: VitalKey
  slope: number
  direction: 'sube' | 'baja' | 'estable'
}

export interface BaselineDeviation {
  key: VitalKey
  current: number
  baseline: number
  absolute: number
  percent: number
  /** z-score orientado al sentido adverso (positivo = peor). */
  adverseZ: number
  severity: Severity
}

export interface ShapFactor {
  key: string
  title: string
  text: string
  value: number
}

export interface News2Parameter {
  key: string
  label: string
  value: string
  score: number
}

export interface News2Assessment {
  total: number
  parameters: News2Parameter[]
  hasRedFlag: boolean
  band: 'Bajo' | 'Bajo-medio' | 'Medio' | 'Alto'
  alerting: boolean
}

export interface Confidence {
  value: number
  label: ConfidenceLabel
}

export interface LeadTime {
  vitalTrendAlertT: number | null
  news2AlertT: number | null
  /** Horas de anticipación observadas; null si no aplica. */
  hours: number | null
}

export interface RiskAssessment {
  score: number
  level: RiskLevel
  /** Nivel antes de aplicar el filtro anti-fatiga. */
  rawLevel: RiskLevel
  suppressedByPersistence: boolean
  horizon: [number, number] | null
  confidence: Confidence
}

export interface PatientAnalysis {
  patientId: string
  current: VitalPoint
  previous: VitalPoint | null
  deviations: Record<VitalKey, BaselineDeviation>
  trends: Record<VitalKey, VitalTrend>
  windows: boolean[]
  persistence: number
  sustained: boolean
  shockIndex: number
  baselineShockIndex: number
  baselineConfidence: BaselineConfidence
  baselineBuilding: boolean
  risk: RiskAssessment
  shap: ShapFactor[]
  news2: News2Assessment
  leadTime: LeadTime
  alertActive: boolean
  deviationPercentMax: number
}

export type AlertStatus = 'nueva' | 'revisada' | 'evaluacion' | 'descartada'

export interface Alert {
  id: string
  patientId: string
  level: RiskLevel
  t: number
  factor: string
  persistence: number
  required: number
}

export interface TimelineEvent {
  id: string
  t: number
  level: RiskLevel
  title: string
  detail: string
}

export type DecisionType = 'revisada' | 'evaluacion' | 'descartada' | 'registrada'

export interface ClinicalDecision {
  id: string
  patientId: string
  type: DecisionType
  note: string
  at: string
}

export interface DashboardStats {
  total: number
  estable: number
  evaluacion: number
  elevado: number
  critico: number
  atRisk: number
  highOrCritical: number
}

export interface ScenarioMetrics {
  id: string
  name: string
  short: string
  auroc: number
  auprc: number
  falseAlarmRate: number
  leadTimeH: number
  sensitivity: number
}
