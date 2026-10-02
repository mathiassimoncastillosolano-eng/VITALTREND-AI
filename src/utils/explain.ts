import { VITAL_META } from '../constants'
import type { BaselineDeviation, BaselineStat, ShapFactor, VitalKey, VitalPoint } from '../types'

interface ExplainContext {
  deviations: Record<VitalKey, BaselineDeviation>
  persistence: number
  eff: Record<VitalKey, BaselineStat>
  current: VitalPoint
}

const f = (k: VitalKey, v: number) => v.toFixed(VITAL_META[k].decimals)

/** Traduce contribuciones tipo SHAP a lenguaje clínico (sin nombres técnicos de variables). */
export function buildShapFactors(contrib: Record<string, number>, ctx: ExplainContext): ShapFactor[] {
  const { deviations: d, persistence: p, current: c } = ctx
  const win = p >= 2 ? `durante las últimas ${p} ventanas` : 'en la ventana actual'
  const hab = (k: VitalKey) => `${f(k, d[k].baseline)} ${VITAL_META[k].unit}`

  const factors: ShapFactor[] = [
    {
      key: 'rr',
      title: 'Frecuencia respiratoria sostenida',
      text: `La frecuencia respiratoria aumentó ${p >= 2 ? 'de forma sostenida ' : ''}${win}: ${f('rr', c.rr)} rpm frente a ${hab('rr')} habituales de este paciente.`,
      value: contrib.rr,
    },
    {
      key: 'spo2',
      title: 'SpO₂ respecto a la línea base',
      text: `El descenso de SpO₂ respecto a la línea base (${f('spo2', c.spo2)} % vs. ${hab('spo2')}) está contribuyendo ${contrib.spo2 > 0.15 ? 'significativamente ' : ''}al riesgo.`,
      value: contrib.spo2,
    },
    {
      key: 'shock',
      title: 'Shock Index',
      text: `La relación FC/PAS es ${(c.hr / c.sbp).toFixed(2)}, por encima de lo habitual para este paciente; sugiere mayor carga hemodinámica.`,
      value: contrib.shock,
    },
    {
      key: 'hr',
      title: 'Frecuencia cardíaca',
      text: `La frecuencia cardíaca (${f('hr', c.hr)} bpm) se mantiene por encima de su rango individual (${hab('hr')} habituales).`,
      value: contrib.hr,
    },
    {
      key: 'temp',
      title: 'Temperatura',
      text: `La temperatura (${f('temp', c.temp)} °C) está elevada respecto a su valor habitual (${hab('temp')}).`,
      value: contrib.temp,
    },
    {
      key: 'trend',
      title: 'Tendencia reciente',
      text: 'El conjunto de signos vitales se está alejando de su línea base en las ventanas más recientes.',
      value: contrib.trend,
    },
  ]
  return factors.sort((a, b) => b.value - a.value)
}
