import { create } from 'zustand'
import { DEMO_PATIENT_ID, MAX_HISTORY } from '@/constants'
import { mockEngine } from '@/mockEngine'
import type {
  AlertStatus,
  ClinicalDecision,
  DashboardStats,
  Patient,
  PatientAnalysis,
  RiskLevel,
  ScenarioKey,
} from '@/types'
import { createRng } from '@/utils/rng'
import { windowLabel, windowMinutes } from '@/utils/format'

export type LevelFilter = 'todos' | RiskLevel
export type SortKey = 'estado' | 'riesgo' | 'actualizacion'
export type DrawerTab = 'resumen' | 'vitales' | 'baseline' | 'explicabilidad' | 'comparacion' | 'historial' | 'notas'

export interface Toast {
  id: number
  kind: 'success' | 'info' | 'error' | 'critical'
  message: string
}

export interface Settings {
  theme: 'dark' | 'light'
  requiredWindows: 2 | 3
  showBaselineBand: boolean
  compactCards: boolean
  notifyCritical: boolean
  notifyElevated: boolean
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  requiredWindows: 3,
  showBaselineBand: true,
  compactCards: false,
  notifyCritical: true,
  notifyElevated: true,
  reduceMotion: false,
  highContrast: false,
  largeText: false,
}

interface AppState {
  authed: boolean
  status: 'loading' | 'ready' | 'error'
  errorMessage: string
  patients: Patient[]
  analyses: Record<string, PatientAnalysis>
  filter: { level: LevelFilter; query: string; sort: SortKey }
  selectedId: string | null
  drawerTab: DrawerTab
  searchOpen: boolean
  sim: { running: boolean; speed: 0.5 | 1 | 2; scenario: ScenarioKey }
  alertStatus: Record<string, AlertStatus>
  decisions: ClinicalDecision[]
  toasts: Toast[]
  settings: Settings
  updating: boolean
  sidebarCollapsed: boolean

  enterDemo: () => void
  load: (opts?: { fail?: boolean }) => Promise<void>
  tick: () => void
  toggleSim: () => void
  setSpeed: (s: 0.5 | 1 | 2) => void
  setScenario: (s: ScenarioKey) => void
  resetSim: () => void
  setFilter: (patch: Partial<AppState['filter']>) => void
  selectPatient: (id: string | null, tab?: DrawerTab) => void
  setDrawerTab: (tab: DrawerTab) => void
  setSearchOpen: (open: boolean) => void
  setAlertStatus: (id: string, status: AlertStatus) => void
  addDecision: (d: Omit<ClinicalDecision, 'id' | 'at'>) => void
  pushToast: (kind: Toast['kind'], message: string) => void
  dismissToast: (id: number) => void
  updateSettings: (patch: Partial<Settings>) => void
  toggleSidebar: () => void
}

let rng = createRng(2026)
let toastSeq = 1

export const useAppStore = create<AppState>((set, get) => ({
  authed: false,
  status: 'loading',
  errorMessage: '',
  patients: [],
  analyses: {},
  filter: { level: 'todos', query: '', sort: 'estado' },
  selectedId: null,
  drawerTab: 'resumen',
  searchOpen: false,
  sim: { running: false, speed: 1, scenario: 'elevado' },
  alertStatus: {},
  decisions: [],
  toasts: [],
  settings: DEFAULT_SETTINGS,
  updating: false,
  sidebarCollapsed: false,

  enterDemo: () => set({ authed: true }),

  load: async (opts) => {
    set({ status: 'loading' })
    try {
      const patients = await mockEngine.getPatients(opts)
      rng = createRng(2026)
      set({
        patients,
        analyses: mockEngine.analyzeAll(patients, get().settings.requiredWindows),
        status: 'ready',
        errorMessage: '',
      })
    } catch (e) {
      set({ status: 'error', errorMessage: e instanceof Error ? e.message : 'Error desconocido' })
    }
  },

  tick: () => {
    const { patients, analyses: prev, settings, alertStatus } = get()
    if (!patients.length) return
    const next = patients.map((p) => {
      const point = mockEngine.generateMeasurement(p, rng)
      return {
        ...p,
        history: [...p.history, point].slice(-MAX_HISTORY),
        lastUpdateMin: windowMinutes(point.t),
      }
    })
    const analyses = mockEngine.analyzeAll(next, settings.requiredWindows)
    const newToasts: Toast[] = []
    const status = { ...alertStatus }
    for (const p of next) {
      const a = analyses[p.id]
      const was = prev[p.id]
      if (a.alertActive && !was?.alertActive) {
        const critical = a.risk.level === 'critico'
        if ((critical && settings.notifyCritical) || (!critical && settings.notifyElevated)) {
          newToasts.push({
            id: toastSeq++,
            kind: critical ? 'critical' : 'info',
            message: critical
              ? `${p.code}: paciente requiere evaluación prioritaria.`
              : `${p.code}: desviación sostenida confirmada (riesgo elevado).`,
          })
        }
      }
      if (a.risk.level !== was?.risk.level) delete status[`${p.id}:${was?.risk.level}`]
    }
    set((s) => ({
      patients: next,
      analyses,
      alertStatus: status,
      toasts: [...s.toasts, ...newToasts].slice(-4),
    }))
  },

  toggleSim: () => set((s) => ({ sim: { ...s.sim, running: !s.sim.running } })),
  setSpeed: (speed) => set((s) => ({ sim: { ...s.sim, speed } })),

  setScenario: (scenario) => {
    const { patients, settings } = get()
    const next = patients.map((p) =>
      p.id === DEMO_PATIENT_ID ? { ...p, target: mockEngine.scenarioTarget(p, scenario) } : p,
    )
    set((s) => ({
      patients: next,
      analyses: mockEngine.analyzeAll(next, settings.requiredWindows),
      sim: { ...s.sim, scenario, running: true },
    }))
  },

  resetSim: () => {
    const { settings } = get()
    void mockEngine.getPatients().then((patients) => {
      rng = createRng(2026)
      set((s) => ({
        patients,
        analyses: mockEngine.analyzeAll(patients, settings.requiredWindows),
        sim: { ...s.sim, running: false, scenario: 'elevado' },
        alertStatus: {},
        decisions: [],
      }))
      get().pushToast('info', 'Simulación reiniciada.')
    })
  },

  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  selectPatient: (id, tab) => set((s) => ({ selectedId: id, drawerTab: tab ?? (id ? s.drawerTab : 'resumen'), searchOpen: false })),
  setDrawerTab: (drawerTab) => set({ drawerTab }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setAlertStatus: (id, status) => set((s) => ({ alertStatus: { ...s.alertStatus, [id]: status } })),

  addDecision: (d) =>
    set((s) => {
      const p = s.patients.find((x) => x.id === d.patientId)
      const t = p ? p.history[p.history.length - 1].t : 0
      return {
        decisions: [{ ...d, id: `d${Date.now()}-${s.decisions.length}`, at: windowLabel(t) }, ...s.decisions],
      }
    }),

  pushToast: (kind, message) => set((s) => ({ toasts: [...s.toasts, { id: toastSeq++, kind, message }].slice(-4) })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch }
    set({ settings })
    if (patch.requiredWindows !== undefined) {
      set({ analyses: mockEngine.analyzeAll(get().patients, settings.requiredWindows) })
    }
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))

export function computeStats(patients: Patient[], analyses: Record<string, PatientAnalysis>): DashboardStats {
  const s: DashboardStats = { total: patients.length, estable: 0, evaluacion: 0, elevado: 0, critico: 0, atRisk: 0, highOrCritical: 0 }
  for (const p of patients) {
    const lvl = analyses[p.id]?.risk.level
    if (lvl) s[lvl]++
  }
  s.atRisk = s.evaluacion + s.elevado + s.critico
  s.highOrCritical = s.elevado + s.critico
  return s
}
