import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, BellOff, ShieldAlert, TriangleAlert, Users } from 'lucide-react'
import { staggerParent } from '@/animations/variants'
import { LEVEL_ORDER } from '@/constants'
import { mockEngine } from '@/mockEngine'
import { useAlerts, useFilteredPatients, useStats } from '@/hooks/useDerived'
import { navigate } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { DemoGuide } from '@/components/layout/DemoGuide'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { KpiCard } from '@/components/ui/KpiCard'
import { KpiSkeleton, PatientCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PatientCard } from '@/components/patients/PatientCard'
import { PatientFilters } from '@/components/patients/PatientFilters'
import { DecisionFlow } from '@/components/decision/DecisionFlow'
import { windowLabel } from '@/utils/format'

export default function Dashboard() {
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const filter = useAppStore((s) => s.filter)
  const setFilter = useAppStore((s) => s.setFilter)
  const select = useAppStore((s) => s.selectPatient)
  const selectedId = useAppStore((s) => s.selectedId)
  const required = useAppStore((s) => s.settings.requiredWindows)
  const showBand = useAppStore((s) => s.settings.showBaselineBand)
  const compact = useAppStore((s) => s.settings.compactCards)
  const stats = useStats()
  const alerts = useAlerts()
  const filtered = useFilteredPatients()
  const retained = useMemo(() => mockEngine.getSuppressed(patients, analyses), [patients, analyses])

  const featuredMode = filter.level === 'todos' && !filter.query.trim()
  const featured = useMemo(
    () => (featuredMode ? [...filtered].sort((a, b) => LEVEL_ORDER[analyses[b.id].risk.level] - LEVEL_ORDER[analyses[a.id].risk.level] || analyses[b.id].risk.score - analyses[a.id].risk.score).slice(0, 3) : []),
    [featuredMode, filtered, analyses],
  )
  const featuredIds = new Set(featured.map((p) => p.id))
  const rest = featuredMode ? filtered.filter((p) => !featuredIds.has(p.id)) : filtered

  const header = <PageHeader title="Pacientes monitorizados" subtitle="Análisis continuo de signos vitales y comparación con línea base individual" />

  if (status === 'error') return <>{header}<ErrorState onRetry={() => void load()} /></>

  const card = (p: (typeof patients)[number]) => (
    <PatientCard key={p.id} patient={p} analysis={analyses[p.id]} selected={selectedId === p.id} required={required} showBand={showBand} compact={compact} onSelect={(id) => select(id, 'resumen')} />
  )

  return (
    <div>
      {header}
      {status === 'loading' ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <PatientCardSkeleton key={i} />)}</div>
        </>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-6">
            <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard label="Total monitorizados" value={stats.total} icon={Users} tone="accent" active={filter.level === 'todos'} onClick={() => setFilter({ level: 'todos' })} hint="Pacientes en vigilancia continua" />
              <KpiCard label="Estables" value={stats.estable} total={stats.total} icon={Activity} tone="ok" active={filter.level === 'estable'} onClick={() => setFilter({ level: 'estable' })} hint="Dentro de su línea base" />
              <KpiCard label="En riesgo" value={stats.evaluacion} total={stats.total} icon={TriangleAlert} tone="warn" active={filter.level === 'evaluacion'} onClick={() => setFilter({ level: 'evaluacion' })} hint="Requieren evaluación" />
              <KpiCard label="Riesgo elevado / críticos" value={stats.highOrCritical} total={stats.total} icon={ShieldAlert} tone="crit" active={filter.level === 'elevado'} onClick={() => setFilter({ level: stats.critico && !stats.elevado ? 'critico' : 'elevado' })} hint={`${stats.elevado} elevados · ${stats.critico} críticos`} />
            </motion.div>

            <PatientFilters />

            {featured.length > 0 && (
              <section aria-label="Atención prioritaria">
                <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Atención prioritaria</h2>
                <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  <AnimatePresence initial={false}>{featured.map(card)}</AnimatePresence>
                </motion.div>
              </section>
            )}

            <section aria-label="Pacientes">
              {featured.length > 0 && <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">Resto de pacientes</h2>}
              {rest.length === 0 && featured.length === 0 ? (
                <EmptyState action={<Button onClick={() => setFilter({ level: 'todos', query: '' })}>Limpiar filtros</Button>} />
              ) : (
                <motion.div layout variants={staggerParent} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  <AnimatePresence initial={false}>{rest.map(card)}</AnimatePresence>
                </motion.div>
              )}
            </section>
          </div>

          <aside className="space-y-4" aria-label="Contexto clínico">
            <Card title="Alertas activas" subtitle="Ordenadas por nivel de riesgo" actions={<Button size="sm" variant="ghost" onClick={() => navigate('alerts')}>Ver todas</Button>}>
              <ul className="-mx-2 space-y-1">
                {alerts.filter((a) => a.level !== 'evaluacion').slice(0, 4).map((a) => {
                  const p = patients.find((x) => x.id === a.patientId)
                  if (!p) return null
                  return (
                    <li key={a.id}>
                      <button onClick={() => select(p.id, 'explicabilidad')} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
                        <span className="tabular w-11 text-[12px] font-semibold">{windowLabel(a.t)}</span>
                        <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{p.code}</span><span className="block truncate text-[11.5px] text-muted">{a.factor}</span></span>
                        <StatusBadge level={a.level} size="sm" short />
                      </button>
                    </li>
                  )
                })}
                {alerts.filter((a) => a.level !== 'evaluacion').length === 0 && <li className="px-2 py-3 text-[13px] text-muted">Sin alertas activas.</li>}
              </ul>
            </Card>

            <Card title="Filtro anti-fatiga" subtitle={`Persistencia requerida: ${required}/3 ventanas`}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><BellOff size={18} aria-hidden /></span>
                <div>
                  <div className="tabular text-[22px] font-semibold leading-none">{retained.length}</div>
                  <div className="text-[12px] text-muted">alertas retenidas por desviación no sostenida</div>
                </div>
              </div>
              {retained.length > 0 && <p className="mt-3 text-[12.5px] text-muted">{retained.map((p) => p.code).join(', ')} {retained.length > 1 ? 'tienen' : 'tiene'} un pico aislado: se confirma solo si persiste.</p>}
            </Card>

            <Card title="Flujo de decisión clínica" subtitle="El sistema apoya; la decisión es del profesional">
              <DecisionFlow decided={false} />
            </Card>

            <DemoGuide />
          </aside>
        </div>
      )}
      <Disclaimer />
    </div>
  )
}
