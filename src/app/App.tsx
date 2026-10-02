import { useEffect, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { pageVariants } from '@/animations/variants'
import { navigate, useRoute, type RouteId } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { AppShell, useApplySettings } from '@/components/layout/AppShell'
import Alerts from '@/pages/Alerts'
import Analytics from '@/pages/Analytics'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Patients from '@/pages/Patients'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'

const PAGES: Record<Exclude<RouteId, 'login'>, ComponentType> = {
  dashboard: Dashboard,
  patients: Patients,
  alerts: Alerts,
  analytics: Analytics,
  reports: Reports,
  settings: Settings,
}

export function App() {
  const route = useRoute()
  const authed = useAppStore((s) => s.authed)
  const load = useAppStore((s) => s.load)
  useApplySettings()

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!authed && route !== 'login') navigate('login')
    if (authed && route === 'login') navigate('dashboard')
  }, [authed, route])

  if (!authed || route === 'login') return <Login />
  const Page = PAGES[route]
  return (
    <AppShell route={route}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={route} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Page />
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
