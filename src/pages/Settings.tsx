import type { ReactNode } from 'react'
import { Accessibility, Bell, Database, Gauge, Info, Monitor, SlidersHorizontal } from 'lucide-react'
import { DISCLAIMER, RISK_THRESHOLDS, SCENARIO_META, SCENARIO_TARGET_NAME, SIM_SPEEDS } from '@/constants'
import { useAppStore, type Settings as S } from '@/store/useAppStore'
import type { ScenarioKey } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2.5">
      <span><span className="block text-[13.5px] font-medium">{label}</span>{description && <span className="block text-[12px] text-muted">{description}</span>}</span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-surface-2 ring-1 ring-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

function Section({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
  return <Card title={<span className="flex items-center gap-2"><span className="text-accent">{icon}</span>{title}</span>} subtitle={subtitle}><div className="divide-y divide-line">{children}</div></Card>
}

export default function Settings() {
  const s = useAppStore((st) => st.settings)
  const update = useAppStore((st) => st.updateSettings)
  const sim = useAppStore((st) => st.sim)
  const setSpeed = useAppStore((st) => st.setSpeed)
  const push = useAppStore((st) => st.pushToast)
  const setScenario = useAppStore((st) => st.setScenario)
  const resetSim = useAppStore((st) => st.resetSim)
  const set = <K extends keyof S>(k: K) => (v: S[K]) => update({ [k]: v } as Partial<S>)

  return (
    <div>
      <PageHeader title="Configuración" subtitle="Apariencia, monitoreo, alertas y accesibilidad." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section icon={<Monitor size={16} />} title="Preferencias de interfaz" subtitle="Apariencia y densidad">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-[13.5px] font-medium">Tema</span>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Tema">
              {(['dark', 'light'] as const).map((t) => <button key={t} role="radio" aria-checked={s.theme === t} onClick={() => update({ theme: t })} className={`rounded-md px-3 py-1 text-[12.5px] font-medium ${s.theme === t ? 'bg-surface text-ink shadow-card' : 'text-muted'}`}>{t === 'dark' ? 'Oscuro' : 'Claro'}</button>)}
            </div>
          </div>
          <Toggle label="Mostrar rango individual en gráficos" description="Banda ±2 DE alrededor de la línea base." checked={s.showBaselineBand} onChange={set('showBaselineBand')} />
          <Toggle label="Tarjetas compactas" description="Reduce el espaciado en listados." checked={s.compactCards} onChange={set('compactCards')} />
        </Section>

        <Section icon={<Gauge size={16} />} title="Monitoreo en vivo" subtitle="Frecuencia con la que llegan nuevas lecturas">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-[13.5px] font-medium">Velocidad</span>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Velocidad de actualización">
              {SIM_SPEEDS.map((v) => <button key={v} role="radio" aria-checked={sim.speed === v} onClick={() => setSpeed(v)} className={`rounded-md px-3 py-1 text-[12.5px] font-medium ${sim.speed === v ? 'bg-surface text-ink shadow-card' : 'text-muted'}`}>{v}x</button>)}
            </div>
          </div>
          <p className="py-2.5 text-[12.5px] text-muted">Cada actualización agrega una ventana horaria de lecturas a todos los pacientes. Activa o pausa el monitoreo en vivo desde la barra superior.</p>
        </Section>

        <Section icon={<SlidersHorizontal size={16} />} title="Umbrales visuales" subtitle="Persistencia requerida y umbrales de cada nivel">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <span><span className="block text-[13.5px] font-medium">Persistencia requerida</span><span className="block text-[12px] text-muted">Ventanas consecutivas para confirmar una alerta.</span></span>
            <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Ventanas requeridas">
              {([2, 3] as const).map((n) => <button key={n} role="radio" aria-checked={s.requiredWindows === n} onClick={() => update({ requiredWindows: n })} className={`rounded-md px-3 py-1 text-[12.5px] font-medium ${s.requiredWindows === n ? 'bg-surface text-ink shadow-card' : 'text-muted'}`}>{n}/3</button>)}
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 py-3 text-center text-[12px]">
            <div className="rounded-lg bg-warn-soft p-2"><dt className="text-muted">Observación</dt><dd className="tabular text-[15px] font-semibold text-warn">≥ {RISK_THRESHOLDS.evaluacion}</dd></div>
            <div className="rounded-lg bg-high-soft p-2"><dt className="text-muted">Elevado</dt><dd className="tabular text-[15px] font-semibold text-high">≥ {RISK_THRESHOLDS.elevado}</dd></div>
            <div className="rounded-lg bg-crit-soft p-2"><dt className="text-muted">Crítico</dt><dd className="tabular text-[15px] font-semibold text-crit">≥ {RISK_THRESHOLDS.critico}</dd></div>
          </dl>
        </Section>

        <Section icon={<Bell size={16} />} title="Notificaciones" subtitle="Avisos dentro de la aplicación">
          <Toggle label="Avisar pacientes críticos" checked={s.notifyCritical} onChange={set('notifyCritical')} />
          <Toggle label="Avisar riesgo elevado confirmado" checked={s.notifyElevated} onChange={set('notifyElevated')} />
          <div className="py-2.5"><Button size="sm" onClick={() => push('info', 'Notificación de prueba: así se verá un aviso en pantalla.')}>Probar notificación</Button></div>
        </Section>

        <Section icon={<Accessibility size={16} />} title="Accesibilidad" subtitle="Ajustes de legibilidad y movimiento">
          <Toggle label="Reducir movimiento" description="Elimina animaciones no esenciales y pulsos (también respeta la preferencia del sistema)." checked={s.reduceMotion} onChange={set('reduceMotion')} />
          <Toggle label="Alto contraste" description="Refuerza bordes y texto secundario." checked={s.highContrast} onChange={set('highContrast')} />
          <Toggle label="Texto grande" checked={s.largeText} onChange={set('largeText')} />
        </Section>

        <Section icon={<Database size={16} />} title="Datos de prueba" subtitle={`Fuerza la evolución de ${SCENARIO_TARGET_NAME} para verificar alertas`}>
          <div className="grid grid-cols-2 gap-1.5 py-3">
            {(Object.keys(SCENARIO_META) as ScenarioKey[]).map((k) => (
              <button key={k} onClick={() => setScenario(k)} title={SCENARIO_META[k].description} className="rounded-lg border border-line px-2 py-1.5 text-[12.5px] font-medium text-muted transition hover:border-accent/50 hover:text-ink">{SCENARIO_META[k].label}</button>
            ))}
          </div>
          <div className="py-2.5"><Button size="sm" onClick={resetSim}>Restablecer datos de prueba</Button></div>
        </Section>

        <Section icon={<Info size={16} />} title="Información del sistema">
          <dl className="space-y-2 py-2.5 text-[13px]">
            {[['Producto', 'VitalTrend AI'], ['Versión', '1.1.0'], ['Origen de datos', 'Lecturas de prueba (sin conexión a dispositivos)'], ['NEWS2', 'Calculado a partir de las lecturas']].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
            ))}
          </dl>
          <p className="py-3 text-[12px] leading-snug text-muted">{DISCLAIMER}</p>
        </Section>
      </div>
      <Disclaimer />
    </div>
  )
}
