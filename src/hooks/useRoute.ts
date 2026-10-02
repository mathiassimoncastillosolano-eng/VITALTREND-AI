import { useCallback, useMemo, useSyncExternalStore } from 'react'
import type { PatientTab } from '@/types'

export type RouteId = 'login' | 'dashboard' | 'patients' | 'patient' | 'alerts' | 'analytics' | 'reports' | 'settings'
const SIMPLE_ROUTES: RouteId[] = ['login', 'dashboard', 'patients', 'alerts', 'analytics', 'reports', 'settings']

export const PATIENT_TABS: { id: PatientTab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'vitales', label: 'Signos vitales' },
  { id: 'baseline', label: 'Línea base' },
  { id: 'explicabilidad', label: 'Explicabilidad' },
  { id: 'comparacion', label: 'Comparación NEWS2' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'evaluacion', label: 'Evaluación' },
]

export interface Location {
  route: RouteId
  patientId: string | null
  tab: PatientTab
}

function parse(hash: string): Location {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const head = parts[0] ?? ''
  if (head === 'patients' && parts[1]) {
    const tab = PATIENT_TABS.find((t) => t.id === parts[2])?.id ?? 'resumen'
    return { route: 'patient', patientId: decodeURIComponent(parts[1]), tab }
  }
  const route = SIMPLE_ROUTES.find((r) => r === head) ?? 'login'
  return { route, patientId: null, tab: 'resumen' }
}

/** Lista desde la que se abrió el paciente (para el enlace de regreso). */
let origin: 'dashboard' | 'patients' = 'dashboard'
export const getOrigin = () => origin

export function navigate(route: Exclude<RouteId, 'patient'>) {
  window.location.hash = `#/${route}`
}

export function patientHref(id: string, tab: PatientTab = 'resumen') {
  return `#/patients/${encodeURIComponent(id)}${tab === 'resumen' ? '' : `/${tab}`}`
}

export function openPatient(id: string, tab: PatientTab = 'resumen') {
  const current = parse(window.location.hash)
  if (current.route === 'dashboard' || current.route === 'patients') origin = current.route
  window.location.hash = patientHref(id, tab)
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const snapshot = () => window.location.hash

export function useLocation(): Location {
  const hash = useSyncExternalStore(subscribe, snapshot, () => '')
  return useMemo(() => parse(hash), [hash])
}

export function useRoute(): RouteId {
  return useLocation().route
}

export function useNavigate() {
  return useCallback((r: Exclude<RouteId, 'patient'>) => navigate(r), [])
}
