import { motion } from 'motion/react'
import { Activity, Bell, FileBarChart, FlaskConical, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Users, type LucideIcon } from 'lucide-react'
import { navigate, type RouteId } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { useAlerts } from '@/hooks/useDerived'
import { Logo } from './Logo'

export const NAV: { id: RouteId; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'patients', label: 'Pacientes', icon: Users },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'analytics', label: 'Análisis', icon: FlaskConical },
  { id: 'reports', label: 'Reportes', icon: FileBarChart },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export function useActiveAlertCount() {
  const alerts = useAlerts()
  const status = useAppStore((s) => s.alertStatus)
  return alerts.filter((a) => a.level !== 'evaluacion' && (status[a.id] ?? 'nueva') === 'nueva').length
}

export function Sidebar({ route }: { route: RouteId }) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggle = useAppStore((s) => s.toggleSidebar)
  const count = useActiveAlertCount()
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 hidden shrink-0 flex-col border-r border-line bg-surface md:flex"
      aria-label="Navegación principal"
    >
      <div className="flex h-16 items-center px-[21px]"><Logo collapsed={collapsed} /></div>
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const active = route === n.id
          const Icon = n.icon
          return (
            <button key={n.id} onClick={() => navigate(n.id)} aria-current={active ? 'page' : undefined} title={collapsed ? n.label : undefined} className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${active ? 'text-ink' : 'text-muted hover:bg-surface-2/70 hover:text-ink'}`}>
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-line" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <span className="relative"><Icon size={18} aria-hidden />{n.id === 'alerts' && count > 0 && collapsed && <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-crit ring-2 ring-surface" />}</span>
              {!collapsed && <span className="relative flex-1 text-left">{n.label}</span>}
              {!collapsed && n.id === 'alerts' && count > 0 && <span className="tabular relative rounded-full bg-crit-soft px-2 py-0.5 text-[11px] font-semibold text-crit">{count}</span>}
            </button>
          )
        })}
      </nav>
      <div className="space-y-2 border-t border-line p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-[11.5px] text-accent"><Activity size={14} aria-hidden /> Entorno académico · Datos simulados</div>
        )}
        <button onClick={toggle} aria-label={collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-muted hover:bg-surface-2/70 hover:text-ink">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && 'Contraer'}
        </button>
      </div>
    </motion.aside>
  )
}

export function MobileNav({ route }: { route: RouteId }) {
  const count = useActiveAlertCount()
  return (
    <nav aria-label="Navegación principal" className="glass fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-line px-1 py-1.5 md:hidden">
      {NAV.map((n) => {
        const Icon = n.icon
        const active = route === n.id
        return (
          <button key={n.id} onClick={() => navigate(n.id)} aria-label={n.label} aria-current={active ? 'page' : undefined} className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] ${active ? 'text-accent' : 'text-muted'}`}>
            <Icon size={19} aria-hidden />
            {n.label.split(' ')[0]}
            {n.id === 'alerts' && count > 0 && <span className="absolute right-[28%] top-0.5 h-2 w-2 rounded-full bg-crit" />}
          </button>
        )
      })}
    </nav>
  )
}
