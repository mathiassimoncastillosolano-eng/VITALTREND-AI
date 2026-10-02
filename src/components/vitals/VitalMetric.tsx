import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { VITAL_META } from '@/constants'
import type { BaselineDeviation, VitalKey, VitalTrend } from '@/types'
import { formatSigned, formatVital } from '@/utils/format'
import { SEVERITY_LABEL, severityLevel } from '@/utils/severity'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'

interface Props {
  vital: VitalKey
  deviation: BaselineDeviation
  trend: VitalTrend
  variant?: 'compact' | 'full'
}

const TREND_ICON = { sube: ArrowUp, baja: ArrowDown, estable: ArrowRight }

export function VitalMetric({ vital, deviation, trend, variant = 'full' }: Props) {
  const meta = VITAL_META[vital]
  const st = LEVEL_STYLE[severityLevel(deviation.severity)]
  const Icon = st.icon
  const TrendIcon = TREND_ICON[trend.direction]
  const value = formatVital(vital, deviation.current)
  const pct = deviation.percent

  if (variant === 'compact') {
    return (
      <div className="rounded-lg bg-surface-2 px-2.5 py-2">
        <div className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{meta.short}</div>
        <div className="flex items-baseline gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={`tabular text-[16px] font-semibold leading-tight ${deviation.severity === 'normal' ? '' : st.text}`}
            >
              {value}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10.5px] text-muted">{meta.unit}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border bg-surface-2/60 p-4 transition-colors duration-300 ${deviation.severity === 'normal' ? 'border-line' : st.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-muted">{meta.label}</span>
        <TrendIcon size={15} className={trend.direction === 'estable' ? 'text-muted' : st.text} aria-label={`Tendencia: ${trend.direction}`} />
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="tabular text-[28px] font-semibold leading-none"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[13px] text-muted">{meta.unit}</span>
      </div>
      <p className="tabular mt-2 text-[12.5px] text-muted">
        {pct >= 0 ? '↑' : '↓'} {Math.abs(pct).toFixed(1)} % respecto a línea base ({formatVital(vital, deviation.baseline)})
      </p>
      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.text}`}>
        <Icon size={12} aria-hidden />
        {SEVERITY_LABEL[deviation.severity]}
        {deviation.severity !== 'normal' && <span className="tabular opacity-80">({formatSigned(deviation.absolute, meta.decimals)} {meta.unit})</span>}
      </div>
    </div>
  )
}
