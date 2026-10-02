import type { ScenarioMetrics } from '../types'

/** Métricas ilustrativas (SIMULADAS) de los cuatro escenarios del diseño experimental. */
export const scenarioMetrics: ScenarioMetrics[] = [
  { id: 'news2', name: 'NEWS2', short: 'NEWS2', auroc: 0.74, auprc: 0.11, falseAlarmRate: 0.34, leadTimeH: 2.0, sensitivity: 0.58 },
  { id: 'ml', name: 'ML sin línea base', short: 'ML', auroc: 0.86, auprc: 0.27, falseAlarmRate: 0.22, leadTimeH: 3.4, sensitivity: 0.74 },
  { id: 'ml-baseline', name: 'ML + línea base', short: 'ML + LB', auroc: 0.89, auprc: 0.33, falseAlarmRate: 0.19, leadTimeH: 4.6, sensitivity: 0.79 },
  { id: 'full', name: 'ML + línea base + anti-fatiga', short: 'Completo', auroc: 0.89, auprc: 0.34, falseAlarmRate: 0.08, leadTimeH: 4.2, sensitivity: 0.77 },
]

export const METRIC_DEFS = [
  { key: 'auroc', label: 'AUROC', term: 'AUROC', higherIsBetter: true, format: (v: number) => v.toFixed(2) },
  { key: 'auprc', label: 'AUPRC', term: 'AUPRC', higherIsBetter: true, format: (v: number) => v.toFixed(2) },
  { key: 'falseAlarmRate', label: 'False Alarm Rate', term: 'Falsas alarmas', higherIsBetter: false, format: (v: number) => `${Math.round(v * 100)} %` },
  { key: 'leadTimeH', label: 'Lead time', term: 'Lead time', higherIsBetter: true, format: (v: number) => `${v.toFixed(1)} h` },
  { key: 'sensitivity', label: 'Sensibilidad (esp. 90 %)', term: 'Sensibilidad', higherIsBetter: true, format: (v: number) => `${Math.round(v * 100)} %` },
] as const

export type MetricKey = (typeof METRIC_DEFS)[number]['key']

/** Alertas por día en una semana simulada: NEWS2 vs modelo sin filtro vs modelo con anti-fatiga. */
export const weeklyAlerts = [
  { day: 'Lun', news2: 41, sinFiltro: 33, conFiltro: 14 },
  { day: 'Mar', news2: 38, sinFiltro: 30, conFiltro: 12 },
  { day: 'Mié', news2: 45, sinFiltro: 36, conFiltro: 15 },
  { day: 'Jue', news2: 36, sinFiltro: 29, conFiltro: 11 },
  { day: 'Vie', news2: 43, sinFiltro: 35, conFiltro: 13 },
  { day: 'Sáb', news2: 29, sinFiltro: 24, conFiltro: 9 },
  { day: 'Dom', news2: 27, sinFiltro: 22, conFiltro: 8 },
]

/** Evolución simulada del número de pacientes por nivel en las últimas 12 ventanas. */
export const riskEvolution = [
  { h: '-11 h', estable: 11, evaluacion: 3, elevado: 1, critico: 1 },
  { h: '-10 h', estable: 11, evaluacion: 3, elevado: 1, critico: 1 },
  { h: '-9 h', estable: 10, evaluacion: 4, elevado: 1, critico: 1 },
  { h: '-8 h', estable: 10, evaluacion: 4, elevado: 1, critico: 1 },
  { h: '-7 h', estable: 10, evaluacion: 4, elevado: 1, critico: 1 },
  { h: '-6 h', estable: 9, evaluacion: 5, elevado: 1, critico: 1 },
  { h: '-5 h', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
  { h: '-4 h', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
  { h: '-3 h', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
  { h: '-2 h', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
  { h: '-1 h', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
  { h: 'Ahora', estable: 9, evaluacion: 4, elevado: 2, critico: 1 },
]

export const falseAlarmDistribution = [
  { name: 'Confirmadas por persistencia', value: 38 },
  { name: 'Filtradas por anti-fatiga', value: 54 },
  { name: 'Descartadas tras revisión', value: 8 },
]
