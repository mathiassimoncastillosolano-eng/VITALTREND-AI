import type { Confidence } from '@/types'
import { Term } from '@/components/ui/Tooltip'

const TONE = { Baja: 'bg-warn', Media: 'bg-accent', 'Media-alta': 'bg-accent', Alta: 'bg-ok' } as const

export function ConfidenceIndicator({ confidence, hours }: { confidence: Confidence; hours: number }) {
  const pct = Math.round(confidence.value * 100)
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="text-[12.5px] font-medium text-muted"><Term term="Confianza">Confianza del modelo</Term></div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="tabular text-[28px] font-semibold leading-none">{pct}%</span>
        <span className="text-[13px] font-medium">{confidence.label}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Confianza del modelo">
        <div className={`h-full rounded-full transition-all duration-700 ${TONE[confidence.label]}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11.5px] text-muted">Basada en {hours} h de datos propios. No es una certeza clínica.</p>
    </div>
  )
}
