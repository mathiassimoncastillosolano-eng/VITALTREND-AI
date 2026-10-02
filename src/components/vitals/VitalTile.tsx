import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { VITAL_META } from '@/constants'
import type { BaselineDeviation, VitalKey, VitalTrend } from '@/types'
import { formatSigned, formatVital } from '@/utils/format'
import { SEVERITY_LABEL, severityLevel } from '@/utils/severity'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'

const TREND_ICON = { sube: ArrowUp, baja: ArrowDown, estable: ArrowRight }
const TREND_TEXT = { sube: 'en aumento', baja: 'en descenso', estable: 'estable' }

interface Props {
  vital: VitalKey
  deviation: BaselineDeviation
  trend: VitalTrend
  className?: string
}

/** Valor actual, unidad, estado y tendencia de un signo, con su diferencia respecto a la línea base. */
export function VitalTile({ vital, deviation, trend, className = '' }: Props) {
  const meta = VITAL_META[vital]
  const st = LEVEL_STYLE[severityLevel(deviation.severity)]
  const abnormal = deviation.severity !== 'normal'
  const TrendIcon = TREND_ICON[trend.direction]
  const value = formatVital(vital, deviation.current)
  // La unidad solo se repite cuando es porcentaje; en las demás ya figura junto al valor.
  const delta = `${formatSigned(deviation.absolute, meta.decimals)}${meta.unit === '%' ? ' %' : ''}`
  const deltaFull = `${formatSigned(deviation.absolute, meta.decimals)} ${meta.unit}`
  return (
    <div
      className={`rounded-xl border bg-surface-2/70 px-3 py-2.5 ${abnormal ? st.border : 'border-transparent'} ${className}`}
      role="group"
      aria-label={`${meta.label}: ${value} ${meta.unit}. ${SEVERITY_LABEL[deviation.severity]}. Tendencia ${TREND_TEXT[trend.direction]}. ${deltaFull} respecto a su línea base.`}
    >
      <div className="flex items-center justify-between text-[11.5px] font-medium text-muted">
        <span>{meta.short}</span>
        <TrendIcon size={13} className={trend.direction === 'estable' || !abnormal ? 'text-muted' : st.text} aria-hidden />
      </div>
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`tabular text-[21px] font-semibold leading-tight ${abnormal ? st.text : ''}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[11px] text-muted">{meta.unit}</span>
      </div>
      <div className={`tabular whitespace-nowrap text-[11.5px] ${abnormal ? st.text : 'text-muted'}`} title={`${deltaFull} respecto a su línea base`}>
        {delta} vs. base
      </div>
    </div>
  )
}
