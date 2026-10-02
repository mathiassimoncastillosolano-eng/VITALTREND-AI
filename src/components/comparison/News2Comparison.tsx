import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, FlaskConical } from 'lucide-react'
import { NEWS2_ALERT_THRESHOLD } from '@/constants'
import type { PatientAnalysis } from '@/types'
import { Term } from '@/components/ui/Tooltip'
import { StatusBadge } from '@/components/ui/StatusBadge'

function statement(a: PatientAnalysis): string {
  const vt = a.alertActive
  const n2 = a.news2.alerting
  if (vt && !n2) return 'VitalTrend AI detectó una desviación sostenida respecto a la línea base individual antes de que NEWS2 alcanzara su umbral de alerta.'
  if (vt && n2) {
    const h = a.leadTime.hours
    return h && h > 0
      ? `Ambos sistemas están en alerta. VitalTrend AI alertó ${h} h antes de que NEWS2 alcanzara su umbral.`
      : 'Ambos sistemas están en alerta en este momento.'
  }
  if (!vt && n2) return 'NEWS2 alcanzó su umbral, pero la desviación respecto a la línea base individual todavía no es sostenida.'
  if (a.news2.hasRedFlag && a.risk.level === 'estable')
    return 'NEWS2 marca un parámetro en banda roja, pero los valores son habituales para este paciente según su línea base individual: se evita una posible falsa alarma.'
  if (a.risk.level === 'evaluacion') return 'VitalTrend AI sugiere evaluación; NEWS2 permanece bajo el umbral. La desviación aún se está confirmando.'
  return 'Ningún sistema indica alerta en este momento.'
}

export function News2Comparison({ analysis: a }: { analysis: PatientAnalysis }) {
  const [open, setOpen] = useState(false)
  const vtLabel = a.alertActive ? 'Alerta activa' : a.risk.level === 'evaluacion' ? 'Requiere evaluación' : 'Sin alerta'
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[13px] font-semibold">VitalTrend AI vs <Term term="NEWS2">NEWS2</Term></h4>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted"><FlaskConical size={12} aria-hidden /> Comparación experimental</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <div className="text-[12px] font-medium text-muted">VitalTrend AI</div>
          <div className="mt-2"><StatusBadge level={a.risk.level} /></div>
          <div className="mt-2 text-[13px] font-semibold">{vtLabel}</div>
          <div className="tabular text-[12px] text-muted">Riesgo simulado {Math.round(a.risk.score)}/100</div>
        </div>
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <div className="text-[12px] font-medium text-muted">NEWS2</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="tabular text-[26px] font-semibold leading-none">{a.news2.total}</span>
            <span className="text-[12px] text-muted">puntos</span>
          </div>
          <div className="mt-2 text-[13px] font-semibold">{a.news2.alerting ? 'Umbral alcanzado' : 'Bajo umbral'}{a.news2.hasRedFlag ? ' · parámetro en banda roja' : ''}</div>
          <div className="text-[12px] text-muted">Banda {a.news2.band} · umbral de alerta ≥ {NEWS2_ALERT_THRESHOLD}</div>
        </div>
      </div>
      <p className="mt-3 rounded-lg border border-accent/25 bg-accent-soft px-3.5 py-2.5 text-[13px] leading-snug">{statement(a)}</p>
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">
        Ver desglose NEWS2 <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 overflow-hidden rounded-lg border border-line text-[12.5px]">
            {a.news2.parameters.map((p) => (
              <li key={p.key} className="flex items-center justify-between border-b border-line px-3 py-2 last:border-b-0">
                <span className="text-muted">{p.label}</span>
                <span className="tabular">{p.value}</span>
                <span className={`tabular w-8 text-right font-semibold ${p.score >= 3 ? 'text-crit' : p.score > 0 ? 'text-warn' : 'text-muted'}`}>{p.score}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
