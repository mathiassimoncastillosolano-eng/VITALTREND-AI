import { Bell, Command, Moon, Radio, Sun } from 'lucide-react'
import { navigate } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { LogoMark } from './Logo'
import { useActiveAlertCount } from './Sidebar'

export function Topbar() {
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const theme = useAppStore((s) => s.settings.theme)
  const update = useAppStore((s) => s.updateSettings)
  const running = useAppStore((s) => s.sim.running)
  const toggleSim = useAppStore((s) => s.toggleSim)
  const updating = useAppStore((s) => s.updating)
  const count = useActiveAlertCount()
  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line px-4 md:px-6">
      <div className="md:hidden"><LogoMark size={30} /></div>
      <button onClick={() => setSearchOpen(true)} className="flex h-10 flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 text-left text-[13px] text-muted transition hover:border-accent/40 md:max-w-md" aria-label="Buscar paciente (Ctrl + K)">
        <span aria-hidden>⌕</span>
        <span className="flex-1 truncate">Buscar paciente, ID, habitación o cama</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10.5px] sm:flex"><Command size={10} /> K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-accent lg:inline-flex">Demo mode · Datos simulados</span>
        <Tooltip content={running ? 'Pausar monitoreo en vivo' : 'Iniciar monitoreo en vivo'} side="bottom">
          <button onClick={toggleSim} aria-pressed={running} className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[12.5px] font-medium transition ${running ? 'border-ok/40 bg-ok-soft text-ok' : 'border-line bg-surface text-muted hover:text-ink'}`}>
            <Radio size={14} className={running ? 'animate-pulse' : ''} aria-hidden />
            <span className="hidden sm:inline">{updating ? 'Actualizando...' : running ? 'En vivo' : 'Monitoreo en vivo'}</span>
          </button>
        </Tooltip>
        <Tooltip content="Alertas activas" side="bottom">
          <button onClick={() => navigate('alerts')} aria-label={`Alertas activas: ${count}`} className="relative grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted hover:text-ink">
            <Bell size={16} />
            {count > 0 && <span className="tabular absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-crit px-1 text-[10px] font-bold text-white">{count}</span>}
          </button>
        </Tooltip>
        <Tooltip content={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'} side="bottom">
          <button onClick={() => update({ theme: theme === 'dark' ? 'light' : 'dark' })} aria-label="Cambiar tema" className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted hover:text-ink">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>
        <div className="hidden items-center gap-2.5 border-l border-line pl-3 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-ok text-[12px] font-bold text-white">DM</div>
          <div className="leading-tight"><div className="text-[12.5px] font-semibold">Usuario demo</div><div className="text-[11px] text-muted">Profesional sanitario (simulado)</div></div>
        </div>
      </div>
    </header>
  )
}
