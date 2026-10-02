import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, BellOff, Eye, OctagonAlert, TriangleAlert, Users } from 'lucide-react'
import { staggerParent } from '@/animations/variants'
import { mockEngine } from '@/mockEngine'
import { useAlerts, useFilteredPatients, useNowMin, useStats } from '@/hooks/useDerived'
import { navigate, openPatient } from '@/hooks/useRoute'
import { useAppStore, type LevelFilter } from '@/store/useAppStore'
import { PageHeader } from '@/components/layout/PageHeader'
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
import { formatMinutes, shortName, windowLabel } from '@/utils/format'

export default function Dashboard() {
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const filter = useAppStore((s) => s.filter)
  const setFilter = useAppStore((s) => s.setFilter)
  const required = useAppStore((s) => s.settings.requiredWindows)
  const compact = useAppStore((s) => s.settings.compactCards)
  const stats = useStats()
  const alerts = useAlerts()
  const filtered = useFilteredPatients()
  const nowMin = useNowMin()
  const retained = useMemo(() => mockEngine.getSuppressed(patients, analyses), [patients, analyses])

  const sustainedAlerts = alerts.filter((a) => a.level !== 'evaluacion')
  const withActiveAlert = patients.filter((p) => analyses[p.id]?.alertActive).length
  const highestRisk = useMemo(
    () => patients.filter((p) => analyses[p.id]?.risk.level === 'critico').sort((a, b) => analyses[b.id].risk.score - analyses[a.id].risk.score)[0],
    [patients, analyses],
  )
  const elevatedSustained = patients.filter((p) => analyses[p.id]?.risk.level === 'elevado' && analyses[p.id].alertActive).length

  const toggle = (level: LevelFilter) => setFilter({ level: filter.level === level ? 'todos' : level })
  const searching = filter.query.trim() !== ''

  const header = (
    <PageHeader
      title="Pacientes monitorizados"
      subtitle={status === 'ready' ? `Última lectura a las ${formatMinutes(nowMin)}` : 'Cargando lecturas…'}
    />
  )

  if (status === 'error') return <>{header}<ErrorState onRetry={() => void load()} /></>

  return (
    <div>
      {header}
      {status === 'loading' ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{[0, 1, 2, 3, 4].map((i) => <KpiSkeleton key={i} />)}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <PatientCardSkeleton key={i} />)}</div>
        </>
      ) : (
        <div className="space-y-6">
          <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <KpiCard label="Pacientes monitorizados" value={stats.total} icon={Users} tone="accent" active={filter.level === 'todos'} onClick={() => setFilter({ level: 'todos' })} hint={`${withActiveAlert} con alerta activa`} />
            <KpiCard label="Estables" value={stats.estable} total={stats.total} icon={Activity} tone="ok" active={filter.level === 'estable'} onClick={() => toggle('estable')} hint="Dentro de su línea base" />
            <KpiCard label="En observación" value={stats.evaluacion} total={stats.total} icon={Eye} tone="warn" active={filter.level === 'evaluacion'} onClick={() => toggle('evaluacion')} hint={retained.length ? `${retained.length} con alerta retenida` : 'Desviación sin persistencia'} />
            <KpiCard label="Riesgo elevado" value={stats.elevado} total={stats.total} icon={TriangleAlert} tone="high" active={filter.level === 'elevado'} onClick={() => toggle('elevado')} hint={`${elevatedSustained} con desviación sostenida`} />
            <KpiCard label="Críticos" value={stats.critico} total={stats.total} icon={OctagonAlert} tone="crit" active={filter.level === 'critico'} onClick={() => toggle('critico')} hint={highestRisk ? `Mayor riesgo: ${highestRisk.fullName}` : 'Sin pacientes críticos'} />
          </motion.div>

          <PatientFilters />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section aria-label="Pacientes" className="min-w-0">
              {filtered.length === 0 ? (
                <EmptyState
                  title={searching ? `Sin resultados para “${filter.query.trim()}”` : 'No hay pacientes en este estado.'}
                  description={searching ? 'Busca por nombre, ID, habitación (hab 103) o cama (cama 2).' : 'Cambia el filtro de estado para ver otros pacientes.'}
                  action={<Button onClick={() => setFilter({ level: 'todos', query: '' })}>{searching ? 'Limpiar búsqueda' : 'Ver todos los pacientes'}</Button>}
                />
              ) : (
                <motion.div layout variants={staggerParent} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  <AnimatePresence initial={false}>
                    {filtered.map((p) => <PatientCard key={p.id} patient={p} analysis={analyses[p.id]} nowMin={nowMin} required={required} compact={compact} />)}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>

            <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start" aria-label="Alertas activas">
              <Card title="Alertas activas" subtitle="Desviaciones sostenidas, por nivel de riesgo" actions={<Button size="sm" variant="ghost" className="whitespace-nowrap" onClick={() => navigate('alerts')}>Ver todas</Button>}>
                <ul className="-mx-2 space-y-1">
                  {sustainedAlerts.slice(0, 5).map((a) => {
                    const p = patients.find((x) => x.id === a.patientId)
                    if (!p) return null
                    return (
                      <li key={a.id}>
                        <button onClick={() => openPatient(p.id, 'explicabilidad')} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2">
                          <span className="tabular w-11 text-[12px] font-semibold">{windowLabel(a.t)}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{shortName(p.fullName)}</span><span className="block truncate text-[11.5px] text-muted">{a.factor}</span></span>
                          <StatusBadge level={a.level} size="sm" short />
                        </button>
                      </li>
                    )
                  })}
                  {sustainedAlerts.length === 0 && <li className="px-2 py-3 text-[13px] text-muted">No hay alertas activas.</li>}
                </ul>
                {retained.length > 0 && (
                  <p className="mt-3 flex items-start gap-2 border-t border-line pt-3 text-[12px] text-muted">
                    <BellOff size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    <span>{retained.length === 1 ? '1 alerta retenida' : `${retained.length} alertas retenidas`} hasta confirmar persistencia: {retained.map((p) => shortName(p.fullName)).join(', ')}.</span>
                  </p>
                )}
              </Card>
            </aside>
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  )
}
