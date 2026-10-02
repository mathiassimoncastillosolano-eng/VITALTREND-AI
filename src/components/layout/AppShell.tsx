import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { WifiOff } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useGlobalHotkeys } from '@/hooks/useHotkeys'
import { useSimulation } from '@/hooks/useSimulation'
import type { RouteId } from '@/hooks/useRoute'
import { ToastHost } from '@/components/ui/Toast'
import { PatientDrawer } from '@/components/patients/PatientDrawer'
import { MobileNav, Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SearchPalette } from './SearchPalette'
import { SimulationPanel } from './SimulationPanel'
import { useOnline } from '@/hooks/useOnline'

export function AppShell({ route, children }: { route: RouteId; children: ReactNode }) {
  const selectedId = useAppStore((s) => s.selectedId)
  const patient = useAppStore((s) => s.patients.find((p) => p.id === s.selectedId))
  const analysis = useAppStore((s) => (s.selectedId ? s.analyses[s.selectedId] : undefined))
  const reduce = useAppStore((s) => s.settings.reduceMotion)
  const online = useOnline()
  useGlobalHotkeys()
  useSimulation()

  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'user'}>
      <div className="bg-ambient flex h-full">
        <Sidebar route={route} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {!online && (
            <div role="status" className="flex items-center justify-center gap-2 bg-warn-soft px-4 py-1.5 text-[12px] font-medium text-warn"><WifiOff size={13} aria-hidden /> Modo demostración: sin conexión, la simulación sigue funcionando.</div>
          )}
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 md:px-8 md:pb-10">{children}</main>
        </div>
        <MobileNav route={route} />
        <SimulationPanel />
        <SearchPalette />
        <AnimatePresence>{selectedId && patient && analysis && <PatientDrawer key="drawer" patient={patient} analysis={analysis} />}</AnimatePresence>
        <ToastHost />
      </div>
    </MotionConfig>
  )
}

/** Sincroniza preferencias de accesibilidad y tema con el elemento <html>. */
export function useApplySettings() {
  const s = useAppStore((st) => st.settings)
  useEffect(() => {
    const el = document.documentElement
    el.dataset.theme = s.theme
    el.dataset.contrast = s.highContrast ? 'high' : 'normal'
    el.dataset.text = s.largeText ? 'large' : 'normal'
    el.dataset.reduceMotion = String(s.reduceMotion)
  }, [s.theme, s.highContrast, s.largeText, s.reduceMotion])
}
