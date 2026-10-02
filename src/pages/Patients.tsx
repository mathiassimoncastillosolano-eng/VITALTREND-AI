import { motion } from 'motion/react'
import { staggerChild, staggerParent } from '@/animations/variants'
import { PRIMARY_VITALS, VITAL_META } from '@/constants'
import { useFilteredPatients } from '@/hooks/useDerived'
import { useAppStore } from '@/store/useAppStore'
import { formatMinutes, formatVital } from '@/utils/format'
import { PageHeader } from '@/components/layout/PageHeader'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { PatientFilters } from '@/components/patients/PatientFilters'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { PersistenceIndicator } from '@/components/alerts/PersistenceIndicator'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'
import { severityLevel } from '@/utils/severity'

export default function Patients() {
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const analyses = useAppStore((s) => s.analyses)
  const select = useAppStore((s) => s.selectPatient)
  const required = useAppStore((s) => s.settings.requiredWindows)
  const setFilter = useAppStore((s) => s.setFilter)
  const list = useFilteredPatients()

  return (
    <div>
      <PageHeader title="Pacientes" subtitle="Vista de lista con signos vitales, riesgo, persistencia y comparación NEWS2." />
      {status === 'error' ? <ErrorState onRetry={() => void load()} /> : (
        <div className="space-y-4">
          <PatientFilters />
          {status === 'loading' ? (
            <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : list.length === 0 ? (
            <EmptyState action={<Button onClick={() => setFilter({ level: 'todos', query: '' })}>Limpiar filtros</Button>} />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
              <table className="w-full min-w-[980px] text-left text-[13px]">
                <caption className="sr-only">Pacientes monitorizados</caption>
                <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Paciente</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 font-semibold">Riesgo</th>
                    {PRIMARY_VITALS.map((k) => <th key={k} className="px-3 py-3 font-semibold">{VITAL_META[k].short}</th>)}
                    <th className="px-3 py-3 font-semibold">Persistencia</th>
                    <th className="px-3 py-3 font-semibold">NEWS2</th>
                    <th className="px-3 py-3 font-semibold">Act.</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {list.map((p) => {
                    const a = analyses[p.id]
                    const st = LEVEL_STYLE[a.risk.level]
                    return (
                      <motion.tr key={p.id} variants={staggerChild} onClick={() => select(p.id, 'resumen')} className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-surface-2/60">
                        <td className="px-4 py-3">
                          <button className="flex items-center gap-3 text-left" onClick={(e) => { e.stopPropagation(); select(p.id, 'resumen') }}>
                            <Avatar code={p.code} hue={p.hue} size={34} />
                            <span><span className="block font-semibold">{p.code}</span><span className="block text-[11.5px] text-muted">{p.hospitalId} · Hab. {p.room} · Cama {p.bed}</span></span>
                          </button>
                        </td>
                        <td className="px-3 py-3"><StatusBadge level={a.risk.level} size="sm" short /></td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${st.solid}`} style={{ width: `${a.risk.score}%` }} /></div>
                            <span className="tabular text-[12px] text-muted">{Math.round(a.risk.score)}</span>
                          </div>
                        </td>
                        {PRIMARY_VITALS.map((k) => {
                          const d = a.deviations[k]
                          return <td key={k} className={`tabular px-3 py-3 font-medium ${d.severity === 'normal' ? '' : LEVEL_STYLE[severityLevel(d.severity)].text}`}>{formatVital(k, d.current)}</td>
                        })}
                        <td className="px-3 py-3"><div className="w-36"><PersistenceIndicator variant="compact" windows={a.windows} persistence={a.persistence} required={required} /></div></td>
                        <td className="tabular px-3 py-3"><span className={a.news2.alerting ? 'font-semibold text-high' : ''}>{a.news2.total}</span></td>
                        <td className="tabular px-3 py-3 text-muted">{formatMinutes(p.lastUpdateMin)}</td>
                      </motion.tr>
                    )
                  })}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Disclaimer />
    </div>
  )
}
