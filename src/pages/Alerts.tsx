import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BellOff, BellRing, ClipboardCheck } from 'lucide-react'
import { mockEngine } from '@/mockEngine'
import { useAlerts } from '@/hooks/useDerived'
import { useClinicalActions } from '@/hooks/useClinicalActions'
import { useAppStore } from '@/store/useAppStore'
import { openPatient } from '@/hooks/useRoute'
import type { RiskLevel } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { AlertCard } from '@/components/alerts/AlertCard'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'

type View = 'todas' | 'nuevas' | 'gestionadas'
type Lvl = 'todos' | RiskLevel

const DECISION_LABEL = { revisada: 'Revisada', evaluacion: 'Evaluación solicitada', descartada: 'Descartada', registrada: 'Decisión registrada' }

export default function Alerts() {
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const alertStatus = useAppStore((s) => s.alertStatus)
  const decisions = useAppStore((s) => s.decisions)
  const act = useClinicalActions()
  const alerts = useAlerts()
  const [view, setView] = useState<View>('todas')
  const [lvl, setLvl] = useState<Lvl>('todos')
  const retained = useMemo(() => mockEngine.getSuppressed(patients, analyses), [patients, analyses])

  const shown = alerts.filter((a) => {
    const s = alertStatus[a.id] ?? 'nueva'
    if (view === 'nuevas' && s !== 'nueva') return false
    if (view === 'gestionadas' && s === 'nueva') return false
    return lvl === 'todos' || a.level === lvl
  })
  const newCount = alerts.filter((a) => (alertStatus[a.id] ?? 'nueva') === 'nueva').length

  return (
    <div>
      <PageHeader title="Centro de alertas" subtitle="Alertas confirmadas por persistencia temporal, con el factor principal que las explica." />
      {status === 'error' ? <ErrorState onRetry={() => void load()} /> : status === 'loading' ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTabs<View> layoutId="alert-view" ariaLabel="Estado de la alerta" value={view} onChange={setView} options={[{ value: 'todas', label: 'Todas', count: alerts.length }, { value: 'nuevas', label: 'Nuevas', count: newCount }, { value: 'gestionadas', label: 'Gestionadas', count: alerts.length - newCount }]} />
              <FilterTabs<Lvl> layoutId="alert-level" ariaLabel="Nivel de la alerta" value={lvl} onChange={setLvl} options={[{ value: 'todos', label: 'Todos los niveles' }, { value: 'critico', label: 'Crítico' }, { value: 'elevado', label: 'Elevado' }, { value: 'evaluacion', label: 'En observación' }]} />
            </div>
            {shown.length === 0 ? (
              <EmptyState icon={<BellRing size={22} />} title="No hay alertas que coincidan." description="Cuando una desviación se sostenga, aparecerá aquí con su explicación." />
            ) : (
              <motion.div layout className="space-y-3">
                <AnimatePresence initial={false}>
                  {shown.map((a) => {
                    const p = patients.find((x) => x.id === a.patientId)
                    const an = analyses[a.patientId]
                    if (!p || !an) return null
                    return <AlertCard key={a.id} alert={a} patient={p} analysis={an} status={alertStatus[a.id] ?? 'nueva'} onOpen={() => openPatient(p.id, 'explicabilidad')} onAction={(type) => act(p.id, a.id, type)} />
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
          <aside className="space-y-4">
            <Card title={<span className="flex items-center gap-2"><BellOff size={15} className="text-accent" aria-hidden /> Alertas retenidas</span>} subtitle="Esperan confirmación de persistencia antes de alertar">
              {retained.length === 0 ? <p className="text-[13px] text-muted">Ninguna alerta retenida en este momento.</p> : (
                <ul className="space-y-2">
                  {retained.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => openPatient(p.id, 'explicabilidad')} className="flex w-full items-center justify-between rounded-lg bg-surface-2/60 px-3 py-2 text-left hover:bg-surface-2">
                        <span><span className="block text-[13px] font-semibold">{p.fullName}</span><span className="text-[11.5px] text-muted">Persistencia {analyses[p.id].persistence}/3</span></span>
                        <StatusBadge level={analyses[p.id].risk.rawLevel} size="sm" short />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title={<span className="flex items-center gap-2"><ClipboardCheck size={15} className="text-ok" aria-hidden /> Decisiones registradas</span>} subtitle="Registradas en esta sesión">
              {decisions.length === 0 ? <p className="text-[13px] text-muted">Aún no hay decisiones. Gestiona una alerta para verla aquí.</p> : (
                <ul className="space-y-2">
                  {decisions.slice(0, 8).map((d) => (
                    <li key={d.id} className="rounded-lg bg-surface-2/60 px-3 py-2 text-[12.5px]">
                      <span className="font-semibold">{patients.find((p) => p.id === d.patientId)?.fullName}</span> · {DECISION_LABEL[d.type]} <span className="text-muted">({d.at})</span>
                      {d.note && <div className="text-muted">{d.note}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      )}
      <Disclaimer />
    </div>
  )
}
