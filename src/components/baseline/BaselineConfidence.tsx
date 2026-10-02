import { Hourglass, ShieldCheck } from 'lucide-react'
import { BASELINE_FULL_HOURS } from '@/constants'
import type { BaselineConfidence as Conf } from '@/types'
import { Term } from '@/components/ui/Tooltip'

const LABEL: Record<Conf, string> = { baja: 'Baja', media: 'Media', alta: 'Alta' }
const TONE: Record<Conf, string> = { baja: 'text-warn bg-warn-soft', media: 'text-accent bg-accent-soft', alta: 'text-ok bg-ok-soft' }

interface Props {
  confidence: Conf
  hours: number
  building: boolean
}

/** Confianza de la línea base y representación del arranque en frío (cold start). */
export function BaselineConfidence({ confidence, hours, building }: Props) {
  const pct = Math.min(100, (hours / BASELINE_FULL_HOURS) * 100)
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          {building ? <Hourglass size={16} className="text-warn" aria-hidden /> : <ShieldCheck size={16} className="text-ok" aria-hidden />}
          {building ? 'Construyendo línea base' : <Term term="Línea base">Línea base individual</Term>}
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${TONE[confidence]}`}>Confianza: {LABEL[confidence]}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Datos individuales acumulados">
        <div className={`h-full rounded-full transition-all duration-700 ${confidence === 'baja' ? 'bg-warn' : confidence === 'media' ? 'bg-accent' : 'bg-ok'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
        <span>Datos individuales acumulados: <b className="tabular text-ink">{hours} h</b></span>
        <span>Objetivo {BASELINE_FULL_HOURS} h</span>
      </div>
      {building && (
        <p className="mt-3 text-[12.5px] leading-snug text-muted">
          Con pocas horas de datos propios, el sistema pondera la evidencia individual con un prior poblacional (arranque en frío). La confianza de la alerta es menor.
        </p>
      )}
    </div>
  )
}
