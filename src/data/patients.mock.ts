import { CLOCK_END_MIN, HISTORY_WINDOWS } from '../constants'
import type { Consciousness, Patient, VitalKey, VitalPoint, VitalSigns } from '../types'
import { createRng, noise } from '../utils/rng'

interface Profile {
  n: number
  name: string
  sex: 'F' | 'M'
  reason: string
  days: number
  ecg?: boolean
  irregular?: boolean
  id?: string
  hospitalId?: string
  room: string
  bed: number
  specialty: string
  age: number
  hours: number
  base: VitalSigns
  target: VitalSigns
  /** Ventana en la que empieza el deterioro; >= HISTORY_WINDOWS significa sin deterioro. */
  onset: number
  /** Exponente de la curva de deterioro (<1 = rápido al inicio, >1 = lento al inicio). */
  curve?: number
  sd?: Partial<VitalSigns>
  oxygen?: boolean
  cns?: Consciousness
  note?: string
  staleMin?: number
}

const DEFAULT_SD: VitalSigns = { hr: 6, rr: 1.5, spo2: 1, temp: 0.25, sbp: 7 }
const KEYS: VitalKey[] = ['hr', 'rr', 'spo2', 'temp', 'sbp']
const NO_ONSET = 99

const v = (hr: number, rr: number, spo2: number, temp: number, sbp: number): VitalSigns => ({ hr, rr, spo2, temp, sbp })

const PROFILES: Profile[] = [
  { n: 1, name: 'Rosa Elena Quispe Huamán', sex: 'F', reason: 'Pancreatitis aguda leve', days: 3, room: '101', bed: 1, specialty: 'Medicina Interna', age: 54, hours: 40, base: v(72, 14, 98, 36.6, 124), target: v(73, 14, 98, 36.6, 123), onset: NO_ONSET, staleMin: 4 },
  { n: 2, name: 'Carlos Alberto Mendoza Rivas', sex: 'M', reason: 'Postoperatorio de colecistectomía', days: 1, room: '101', bed: 2, specialty: 'Cirugía General', age: 47, hours: 31, base: v(78, 15, 97, 36.7, 118), target: v(79, 15, 97, 36.7, 119), onset: NO_ONSET, staleMin: 9 },
  // Escenario 3 — riesgo elevado . NEWS2 = 3.
  { n: 3, name: 'Javier Ernesto Salazar Ortiz', sex: 'M', reason: 'Neumonía adquirida en la comunidad', days: 4, ecg: true, id: 'p03', hospitalId: 'H-00789', room: '103', bed: 3, specialty: 'Medicina Interna', age: 61, hours: 18, base: v(74, 14, 98, 36.6, 122), target: v(96, 20, 95, 38.1, 112), onset: 14, curve: 0.55, staleMin: 0 },
  { n: 4, name: 'Marta Lucía Valdivia Cruz', sex: 'F', reason: 'Exacerbación de asma', days: 2, room: '102', bed: 1, specialty: 'Neumología', age: 66, hours: 52, base: v(70, 16, 96, 36.5, 130), target: v(71, 16, 96, 36.6, 129), onset: NO_ONSET, staleMin: 12 },
  // Escenario 2 — deterioro temprano (persistencia 2/3, NEWS2 bajo).
  { n: 5, name: 'Diego Armando Flores Paredes', sex: 'M', reason: 'Postoperatorio de laparotomía', days: 2, room: '104', bed: 2, specialty: 'Cirugía General', age: 58, hours: 22, base: v(72, 14, 98, 36.7, 121), target: v(88, 18, 96, 37.4, 116), onset: 21, curve: 0.45, staleMin: 2 },
  { n: 6, name: 'Julio César Ramos Torres', sex: 'M', reason: 'Insuficiencia cardíaca crónica', days: 5, ecg: true, room: '104', bed: 1, specialty: 'Cardiología', age: 72, hours: 36, base: v(66, 15, 97, 36.5, 135), target: v(67, 15, 97, 36.5, 134), onset: NO_ONSET, staleMin: 6 },
  // Escenario 4 — crítico.
  { n: 7, name: 'Teresa del Pilar Gómez Lazo', sex: 'F', reason: 'Sepsis de foco urinario', days: 3, ecg: true, room: '106', bed: 1, specialty: 'Medicina Interna', age: 69, hours: 26, base: v(78, 15, 97, 36.7, 118), target: v(124, 29, 86, 39.2, 88), onset: 7, staleMin: 0 },
  // Pico transitorio: filtrado por el mecanismo anti-fatiga (1/3).
  { n: 8, name: 'Andrés Felipe Cárdenas Silva', sex: 'M', reason: 'Fractura de fémur, postoperatorio', days: 2, room: '105', bed: 3, specialty: 'Traumatología', age: 39, hours: 20, base: v(76, 14, 98, 36.6, 120), target: v(104, 19, 96, 37.4, 118), onset: 23, staleMin: 3 },
  // Paciente con EPOC: SpO₂ habitual 91 % (NEWS2 marca banda roja; su línea base individual no).
  { n: 9, name: 'Héctor Manuel Vargas Ponce', sex: 'M', reason: 'EPOC, control en hospitalización', days: 6, room: '107', bed: 2, specialty: 'Neumología', age: 71, hours: 44, base: v(80, 18, 91, 36.6, 128), target: v(81, 18, 91, 36.6, 127), onset: NO_ONSET, sd: { spo2: 0.9, rr: 1.6 }, note: 'Paciente con EPOC crónico: SpO₂ habitual de 91 %.', staleMin: 7 },
  { n: 10, name: 'Gloria Isabel Chávez Reyes', sex: 'F', reason: 'Fibrilación auricular en control', days: 3, ecg: true, irregular: true, room: '107', bed: 1, specialty: 'Cardiología', age: 63, hours: 28, base: v(68, 14, 97, 36.5, 126), target: v(69, 14, 97, 36.5, 125), onset: NO_ONSET, staleMin: 15 },
  // Riesgo elevado con NEWS2 también en alerta (concordancia).
  { n: 11, name: 'Fernando Luis Aguirre Sánchez', sex: 'M', reason: 'Neumonía con derrame pleural', days: 4, ecg: true, room: '108', bed: 1, specialty: 'Medicina Interna', age: 74, hours: 30, base: v(76, 15, 97, 36.7, 124), target: v(100, 21, 94, 38.2, 108), onset: 15, staleMin: 1 },
  // Cold start: solo 2 h de datos propios.
  { n: 12, name: 'Camila Andrea Rojas Medina', sex: 'F', reason: 'Postoperatorio de hernioplastía', days: 1, room: '109', bed: 2, specialty: 'Cirugía General', age: 45, hours: 2, base: v(80, 15, 97, 36.8, 118), target: v(86, 16, 97, 36.9, 116), onset: 21, staleMin: 5 },
  { n: 13, name: 'Patricia Mercedes Núñez Ayala', sex: 'F', reason: 'Neutropenia posquimioterapia', days: 7, room: '110', bed: 1, specialty: 'Oncología', age: 59, hours: 34, base: v(74, 14, 97, 36.6, 120), target: v(90, 17, 95, 37.5, 116), onset: 17, staleMin: 8 },
  { n: 14, name: 'Luis Miguel Ccori Mamani', sex: 'M', reason: 'Fractura de tibia, postoperatorio', days: 3, room: '110', bed: 2, specialty: 'Traumatología', age: 33, hours: 48, base: v(70, 14, 99, 36.6, 118), target: v(71, 14, 99, 36.6, 118), onset: NO_ONSET, staleMin: 11 },
  { n: 15, name: 'Elena Beatriz Zavala Montoya', sex: 'F', reason: 'Celulitis de miembro inferior', days: 2, room: '111', bed: 1, specialty: 'Medicina Interna', age: 56, hours: 27, base: v(75, 15, 98, 36.7, 122), target: v(76, 15, 98, 36.7, 121), onset: NO_ONSET, staleMin: 18 },
  { n: 16, name: 'Ricardo Alonso Benites Calle', sex: 'M', reason: 'Enfermedad renal crónica descompensada', days: 5, ecg: true, room: '112', bed: 3, specialty: 'Nefrología', age: 64, hours: 25, base: v(73, 15, 97, 36.6, 132), target: v(86, 18, 95, 37.4, 120), onset: 19, staleMin: 14 },
]

const ease = (i: number, onset: number, last: number, curve: number) =>
  i < onset ? 0 : Math.pow((i - onset + 1) / (last - onset + 1), curve)

function roundVital(key: VitalKey, value: number): number {
  return key === 'temp' ? Math.round(value * 10) / 10 : Math.round(value)
}

function buildHistory(profile: Profile): VitalPoint[] {
  const rng = createRng(profile.n * 7919)
  const sd = { ...DEFAULT_SD, ...profile.sd }
  const last = HISTORY_WINDOWS - 1
  const out: VitalPoint[] = []
  for (let i = 0; i < HISTORY_WINDOWS; i++) {
    const point = { t: i } as VitalPoint
    for (const k of KEYS) {
      if (i === last) {
        point[k] = profile.target[k]
        continue
      }
      const drift = (profile.target[k] - profile.base[k]) * ease(i, profile.onset, last, profile.curve ?? 1.4)
      point[k] = roundVital(k, profile.base[k] + drift + noise(rng) * sd[k] * 0.45)
    }
    out.push(point)
  }
  return out
}

function toPatient(p: Profile): Patient {
  const sd = { ...DEFAULT_SD, ...p.sd }
  const idStr = String(p.n).padStart(2, '0')
  return {
    id: p.id ?? `p${idStr}`,
    code: `Paciente ${idStr}`,
    fullName: p.name,
    sex: p.sex,
    admissionReason: p.reason,
    admittedDays: p.days,
    ecgMonitored: p.ecg ?? false,
    rhythm: p.irregular ? 'irregular' : 'sinusal',
    hospitalId: p.hospitalId ?? `H-00${300 + p.n * 37}`,
    room: p.room,
    bed: p.bed,
    specialty: p.specialty,
    age: p.age,
    hue: (p.n * 47) % 360,
    baseline: {
      hoursAccumulated: p.hours,
      stats: Object.fromEntries(KEYS.map((k) => [k, { mean: p.base[k], sd: sd[k] }])) as Patient['baseline']['stats'],
    },
    history: buildHistory(p),
    target: { ...p.target },
    onOxygen: p.oxygen ?? false,
    consciousness: p.cns ?? 'A',
    note: p.note,
    lastUpdateMin: CLOCK_END_MIN - (p.staleMin ?? 0),
  }
}

/** Genera una copia nueva del conjunto de pacientes simulados (determinista). */
export function createMockPatients(): Patient[] {
  return PROFILES.map(toPatient)
}

export const mockPatients: Patient[] = createMockPatients()
