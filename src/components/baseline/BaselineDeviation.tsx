import { motion } from 'motion/react'
import { PRIMARY_VITALS, VITAL_META } from '@/constants'
import type { BaselineDeviation as Deviation, VitalKey } from '@/types'
import { clamp, formatSigned, formatVital } from '@/utils/format'
import { severityLevel } from '@/utils/severity'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'

interface RowProps {
  vital: VitalKey
  deviation: Deviation
  sd: number
}

/** Franja de escala: rango individual (±2 DE), línea base y valor actual. */
function DeviationRow({ vital, deviation, sd }: RowProps) {
  const meta = VITAL_META[vital]
  // Escala centrada en la línea base para que la distancia sea legible.
  const span = Math.max(6 * sd, Math.abs(deviation.absolute) * 1.5)
  const lo = deviation.baseline - span
  const hi = deviation.baseline + span
  const pos = (v: number) => clamp(((v - lo) / (hi - lo)) * 100, 2, 98)
  const st = LEVEL_STYLE[severityLevel(deviation.severity)]
  const bandL = pos(deviation.baseline - 2 * sd)
  const bandR = pos(deviation.baseline + 2 * sd)

  return (
    <li className="grid grid-cols-[84px_1fr_auto] items-center gap-3">
      <div>
        <div className="text-[12.5px] font-semibold">{meta.short}</div>
        <div className="text-[11px] text-muted">{meta.unit}</div>
      </div>
      <div className="relative h-9" role="img" aria-label={`${meta.label}: actual ${formatVital(vital, deviation.current)}, línea base ${formatVital(vital, deviation.baseline)}`}>
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2" />
        <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-md bg-accent/20 ring-1 ring-accent/25" style={{ left: `${bandL}%`, width: `${bandR - bandL}%` }} title="Rango esperado individual (±2 DE)" />
        <div className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-muted" style={{ left: `${pos(deviation.baseline)}%` }} />
        <motion.div
          className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface ${st.solid}`}
          initial={false}
          animate={{ left: `${pos(deviation.current)}%` }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
        />
        <span className="tabular absolute -bottom-0.5 text-[10px] text-muted" style={{ left: `${pos(deviation.baseline)}%`, transform: 'translateX(-50%)' }}>
          {formatVital(vital, deviation.baseline)}
        </span>
      </div>
      <div className="w-[88px] text-right">
        <div className={`tabular text-[13px] font-semibold ${deviation.severity === 'normal' ? '' : st.text}`}>
          {formatVital(vital, deviation.current)} <span className="text-[11px] font-normal text-muted">{meta.unit}</span>
        </div>
        <div className="tabular text-[11px] text-muted">{formatSigned(deviation.absolute, meta.decimals)} · {formatSigned(deviation.percent, 0)} %</div>
      </div>
    </li>
  )
}

interface Props {
  deviations: Record<VitalKey, Deviation>
  sds: Record<VitalKey, number>
  vitals?: VitalKey[]
}

export function BaselineDeviation({ deviations, sds, vitals = [...PRIMARY_VITALS, 'sbp'] }: Props) {
  return (
    <div>
      <ul className="space-y-3">
        {vitals.map((k) => (
          <DeviationRow key={k} vital={k} deviation={deviations[k]} sd={sds[k]} />
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-0.5 bg-muted" /> Línea base</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-accent/25 ring-1 ring-accent/25" /> Rango esperado individual</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-high" /> Valor actual</span>
      </div>
    </div>
  )
}
