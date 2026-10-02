import { NEWS2_ALERT_THRESHOLD } from '../constants'
import type { Consciousness, News2Assessment, News2Parameter, VitalSigns } from '../types'

const rrScore = (v: number) => (v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : 3)
const spo2Score = (v: number) => (v <= 91 ? 3 : v <= 93 ? 2 : v <= 95 ? 1 : 0)
const sbpScore = (v: number) => (v <= 90 ? 3 : v <= 100 ? 2 : v <= 110 ? 1 : v <= 219 ? 0 : 3)
const hrScore = (v: number) => (v <= 40 ? 3 : v <= 50 ? 1 : v <= 90 ? 0 : v <= 110 ? 1 : v <= 130 ? 2 : 3)
const tempScore = (v: number) => (v <= 35 ? 3 : v <= 36 ? 1 : v <= 38 ? 0 : v <= 39 ? 1 : 2)

/** NEWS2 (escala 1 de SpO₂) calculado en el frontend a partir de los signos simulados. */
export function computeNews2(
  v: VitalSigns,
  onOxygen: boolean,
  consciousness: Consciousness,
): News2Assessment {
  const parameters: News2Parameter[] = [
    { key: 'rr', label: 'Frecuencia respiratoria', value: `${v.rr} rpm`, score: rrScore(v.rr) },
    { key: 'spo2', label: 'SpO₂ (escala 1)', value: `${v.spo2} %`, score: spo2Score(v.spo2) },
    { key: 'o2', label: 'Oxígeno suplementario', value: onOxygen ? 'Sí' : 'Aire ambiente', score: onOxygen ? 2 : 0 },
    { key: 'sbp', label: 'Presión sistólica', value: `${v.sbp} mmHg`, score: sbpScore(v.sbp) },
    { key: 'hr', label: 'Frecuencia cardíaca', value: `${v.hr} bpm`, score: hrScore(v.hr) },
    { key: 'cns', label: 'Conciencia', value: consciousness === 'A' ? 'Alerta' : 'Alteración (CVPU)', score: consciousness === 'A' ? 0 : 3 },
    { key: 'temp', label: 'Temperatura', value: `${v.temp.toFixed(1)} °C`, score: tempScore(v.temp) },
  ]
  const total = parameters.reduce((s, p) => s + p.score, 0)
  const hasRedFlag = parameters.some((p) => p.score === 3)
  const band: News2Assessment['band'] =
    total >= 7 ? 'Alto' : total >= 5 ? 'Medio' : hasRedFlag ? 'Bajo-medio' : 'Bajo'
  return { total, parameters, hasRedFlag, band, alerting: total >= NEWS2_ALERT_THRESHOLD }
}
