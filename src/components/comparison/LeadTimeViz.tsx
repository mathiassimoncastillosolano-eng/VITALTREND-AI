import { motion } from 'motion/react'
import { Siren, Timer } from 'lucide-react'
import type { Patient, PatientAnalysis } from '@/types'
import { windowLabel } from '@/utils/format'
import { Term } from '@/components/ui/Tooltip'
import { SimBadge } from '@/components/ui/Card'

export function LeadTimeViz({ patient, analysis: a }: { patient: Patient; analysis: PatientAnalysis }) {
  const t0 = patient.history[0].t
  const t1 = patient.history[patient.history.length - 1].t
  const pos = (t: number) => `${((t - t0) / (t1 - t0)) * 100}%`
  const { vitalTrendAlertT: vt, news2AlertT: n2, hours } = a.leadTime

  const caption =
    vt === null && n2 === null
      ? 'Sin alertas en el periodo mostrado.'
      : hours !== null && hours > 0
        ? `Anticipación observada: ${hours} h`
        : vt !== null && n2 === null
          ? `VitalTrend AI en alerta desde ${windowLabel(vt)}; NEWS2 aún sin alerta.`
          : 'Ambos sistemas alertaron en la misma ventana.'

  const Row = ({ label, t, tone, pending }: { label: string; t: number | null; tone: string; pending?: boolean }) => (
    <div className="grid grid-cols-[96px_1fr] items-center gap-3">
      <span className="text-[12px] font-medium text-muted">{label}</span>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        {t !== null ? (
          <>
            <motion.div className={`absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full ${tone}`} initial={{ width: 0 }} animate={{ width: `calc(100% - ${pos(t)})` }} style={{ left: pos(t) }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            <span className={`absolute top-1/2 grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${tone} text-white`} style={{ left: pos(t) }}>
              <Siren size={13} aria-hidden />
            </span>
            <span className="tabular absolute -bottom-1 -translate-x-1/2 text-[10.5px] text-muted" style={{ left: pos(t) }}>{windowLabel(t)}</span>
          </>
        ) : (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-dashed border-line px-2.5 py-0.5 text-[11px] text-muted">{pending ? 'Sin alerta aún' : '—'}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[13px] font-semibold"><Timer size={14} aria-hidden /> <Term term="Lead time">Visualización del lead time</Term></h4>
        <SimBadge label="Demostración simulada" />
      </div>
      <div className="space-y-3 pb-3">
        <Row label="VitalTrend AI" t={vt} tone="bg-accent" />
        <Row label="NEWS2" t={n2} tone="bg-high" pending />
      </div>
      <div className="flex justify-between text-[10.5px] text-muted"><span className="ml-[108px]">{windowLabel(t0)}</span><span>Ahora · {windowLabel(t1)}</span></div>
      <p className="mt-3 text-[13px] font-semibold">{caption}</p>
    </div>
  )
}
