import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { VITAL_COLOR, VITAL_META } from '@/constants'
import type { Patient, PatientAnalysis, VitalKey } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { formatSigned, formatVital } from '@/utils/format'
import { SEVERITY_LABEL, severityLevel } from '@/utils/severity'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'
import { Sparkline } from '@/components/charts/Sparkline'
import { useMemo } from 'react'

const TREND_ICON = { sube: ArrowUp, baja: ArrowDown, estable: ArrowRight }
const TREND_TEXT = { sube: 'En aumento', baja: 'En descenso', estable: 'Estable' }

/** Signo vital con valor, estado, tendencia, rango individual y evolución reciente. */
export function VitalCard({ patient, analysis: a, vital, showBand }: { patient: Patient; analysis: PatientAnalysis; vital: VitalKey; showBand: boolean }) {
  const meta = VITAL_META[vital]
  const d = a.deviations[vital]
  const trend = a.trends[vital]
  const st = LEVEL_STYLE[severityLevel(d.severity)]
  const abnormal = d.severity !== 'normal'
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const { mean, sd } = eff[vital]
  const TrendIcon = TREND_ICON[trend.direction]
  const value = formatVital(vital, d.current)
  const range = `${(mean - 2 * sd).toFixed(meta.decimals)}–${(mean + 2 * sd).toFixed(meta.decimals)}`

  return (
    <div className={`rounded-xl border bg-surface p-4 shadow-card transition-colors duration-300 ${abnormal ? st.border : 'border-line'}`}>
      <div className="flex items-center justify-between text-[12.5px] font-medium text-muted">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: VITAL_COLOR[vital] }} aria-hidden />{meta.label}</span>
        <span className={`inline-flex items-center gap-1 text-[11.5px] ${abnormal && trend.direction !== 'estable' ? st.text : ''}`}>
          <TrendIcon size={13} aria-hidden /> {TREND_TEXT[trend.direction]}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="tabular text-[30px] font-semibold leading-none">
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[13px] text-muted">{meta.unit}</span>
        <span className={`tabular ml-auto text-[12.5px] font-medium ${abnormal ? st.text : 'text-muted'}`}>{formatSigned(d.absolute, meta.decimals)} {meta.unit} vs. base</span>
      </div>
      <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.text}`}>
        <st.icon size={12} aria-hidden /> {SEVERITY_LABEL[d.severity]}
      </div>
      <div className="mt-2 rounded-lg bg-surface-2/50 px-1">
        <Sparkline values={patient.history.slice(-24).map((p) => p[vital])} mean={mean} sd={sd} color={abnormal ? st.hex : VITAL_COLOR[vital]} showBand={showBand} height={52} />
      </div>
      <p className="tabular mt-2 text-[11.5px] text-muted">Rango individual {range} {meta.unit} · base {formatVital(vital, mean)}</p>
    </div>
  )
}
