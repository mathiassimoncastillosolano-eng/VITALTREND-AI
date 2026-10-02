import { createRng } from './rng'

const gauss = (x: number, mu: number, sigma: number, amp: number) => amp * Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma))

/** Complejo PQRST en segundos respecto al pico R. `withP` = false simula ausencia de onda P. */
export function ecgComplex(dt: number, withP = true): number {
  return (
    (withP ? gauss(dt, -0.17, 0.028, 0.13) : 0) -
    gauss(dt, -0.032, 0.01, 0.12) +
    gauss(dt, 0, 0.011, 1) -
    gauss(dt, 0.03, 0.012, 0.24) +
    gauss(dt, 0.24, 0.05, 0.3)
  )
}

/** Pulso fotopletismográfico: ascenso rápido y muesca dicrótica (fase 0..1 desde el latido). */
export function plethPulse(phase: number): number {
  return gauss(phase, 0.2, 0.085, 1) + gauss(phase, 0.5, 0.075, 0.3)
}

export type Signal = (t: number) => number

/** ECG sintético. Ritmo irregular: intervalos RR variables y sin onda P (aspecto de fibrilación auricular). */
export function makeEcgSignal(hr: number, irregular: boolean, seed = 11): Signal {
  const period = 60 / Math.max(30, hr)
  if (!irregular) {
    return (t) => {
      const k0 = Math.round(t / period)
      let v = 0
      for (let k = k0 - 1; k <= k0 + 1; k++) v += ecgComplex(t - k * period)
      return v
    }
  }
  const rng = createRng(seed)
  const peaks: number[] = [0]
  const extend = (until: number) => {
    while (peaks[peaks.length - 1] < until) peaks.push(peaks[peaks.length - 1] + period * (0.62 + rng() * 0.76))
  }
  return (t) => {
    extend(t + 3)
    let lo = 0
    let hi = peaks.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (peaks[mid] <= t) lo = mid
      else hi = mid - 1
    }
    let v = 0.03 * Math.sin(t * 38) + 0.02 * Math.sin(t * 61 + 1)
    for (let k = Math.max(0, lo - 1); k <= Math.min(peaks.length - 1, lo + 2); k++) v += ecgComplex(t - peaks[k], false)
    return v
  }
}

export function makePlethSignal(hr: number): Signal {
  const period = 60 / Math.max(30, hr)
  return (t) => plethPulse((((t - 0.08) % period) + period) % period / period)
}

export function makeRespSignal(rr: number): Signal {
  const period = 60 / Math.max(4, rr)
  return (t) => Math.sin((2 * Math.PI * t) / period) * 0.5 + 0.5
}

/** Rótulo de ritmo a partir de la frecuencia y la regularidad. */
export function rhythmLabel(hr: number, irregular: boolean): string {
  if (irregular) return hr > 100 ? 'Fibrilación auricular, respuesta rápida' : 'Fibrilación auricular'
  if (hr > 100) return 'Taquicardia sinusal'
  if (hr < 50) return 'Bradicardia sinusal'
  return 'Ritmo sinusal'
}
