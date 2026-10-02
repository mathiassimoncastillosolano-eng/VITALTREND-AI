import { CLOCK_END_MIN, HISTORY_WINDOWS, VITAL_META, WINDOW_MINUTES } from '../constants'
import type { VitalKey } from '../types'

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function formatMinutes(totalMin: number): string {
  const m = ((Math.round(totalMin) % 1440) + 1440) % 1440
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/** Hora simulada asociada a la ventana `t` (la última ventana inicial = 10:42). */
export function windowMinutes(t: number): number {
  return CLOCK_END_MIN + (t - (HISTORY_WINDOWS - 1)) * WINDOW_MINUTES
}

export function windowLabel(t: number): string {
  return formatMinutes(windowMinutes(t))
}

export function formatVital(key: VitalKey, value: number): string {
  return value.toFixed(VITAL_META[key].decimals)
}

export function formatSigned(value: number, decimals = 0): string {
  const s = value.toFixed(decimals)
  return value > 0 ? `+${s}` : s
}

export function formatHours(h: number): string {
  return `${h.toFixed(h % 1 === 0 ? 0 : 1)} h`
}

/** "ahora", "hace 4 min" o "hace 1 h 5 min" respecto al último momento de monitoreo. */
export function formatAgo(nowMin: number, thenMin: number): string {
  const diff = Math.max(0, Math.round(nowMin - thenMin))
  if (diff < 1) return 'ahora'
  if (diff < 60) return `hace ${diff} min`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m ? `hace ${h} h ${m} min` : `hace ${h} h`
}

/** "Teresa Gómez": primer nombre y primer apellido. */
export function shortName(fullName: string): string {
  const t = fullName.split(/\s+/)
  return t.length <= 2 ? fullName : `${t[0]} ${t[t.length - 2]}`
}

export function sexLabel(sex: 'F' | 'M'): string {
  return sex === 'F' ? 'Femenino' : 'Masculino'
}
