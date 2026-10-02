import type { Patient } from '@/types'

/** Minúsculas y sin tildes, para que "Núñez" y "nunez" coincidan. */
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

/**
 * Coincidencia de búsqueda sobre nombre, código, ID, habitación, cama y servicio.
 * Acepta consultas como "hab 103" o "cama 2" (coincidencia exacta del número).
 */
export function patientMatches(p: Patient, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  const bed = /^cama\s*(\d+)$/.exec(q)
  if (bed) return String(p.bed) === bed[1]
  const room = /^hab(?:itacion)?\.?\s*(\d+)$/.exec(q)
  if (room) return p.room === room[1]
  const haystack = normalize([p.fullName, p.code, p.id, p.hospitalId, p.room, p.specialty].join(' '))
  return q.split(/\s+/).every((term) => haystack.includes(term))
}
