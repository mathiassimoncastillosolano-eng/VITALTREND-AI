import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { VITAL_META } from '@/constants'
import type { BaselineDeviation, Patient, VitalKey } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { windowLabel } from '@/utils/format'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'
import { severityLevel } from '@/utils/severity'

interface Props {
  patient: Patient
  vital: VitalKey
  deviation: BaselineDeviation
  height?: number
  showBand?: boolean
}

/** Tendencia de un signo vital con línea base individual y rango esperado (±2 DE). */
export function VitalTrendChart({ patient, vital, deviation, height = 200, showBand = true }: Props) {
  const meta = VITAL_META[vital]
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const { mean, sd } = eff[vital]
  const data = useMemo(
    () =>
      patient.history.map((p) => ({
        label: windowLabel(p.t),
        v: p[vital],
        band: [mean - 2 * sd, mean + 2 * sd] as [number, number],
      })),
    [patient.history, vital, mean, sd],
  )
  const values = data.map((d) => d.v)
  const lo = Math.min(...values, mean - 2 * sd)
  const hi = Math.max(...values, mean + 2 * sd)
  const pad = (hi - lo) * 0.12 || 1
  const last = data[data.length - 1]
  const dotColor = LEVEL_STYLE[severityLevel(deviation.severity)].hex

  return (
    <div style={{ height }} role="img" aria-label={`Tendencia de ${meta.label} con línea base individual`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--c-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
          <YAxis
            tick={{ fill: 'var(--c-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[Math.floor((lo - pad) * 10) / 10, Math.ceil((hi + pad) * 10) / 10]}
            tickFormatter={(v: number) => (meta.decimals ? v.toFixed(1) : Math.round(v).toString())}
            width={44}
          />
          <Tooltip
            cursor={{ stroke: 'var(--c-muted)', strokeOpacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as { label: string; v: number }
              return (
                <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] shadow-pop">
                  <div className="text-muted">{row.label}</div>
                  <div className="tabular font-semibold">
                    {row.v.toFixed(meta.decimals)} {meta.unit}
                  </div>
                  <div className="tabular text-muted">Línea base {mean.toFixed(meta.decimals)}</div>
                </div>
              )
            }}
          />
          {showBand && <Area type="monotone" dataKey="band" stroke="none" fill="var(--c-accent)" fillOpacity={0.13} isAnimationActive animationDuration={700} />}
          <ReferenceLine y={mean} stroke="var(--c-muted)" strokeDasharray="4 4" label={{ value: 'Línea base', position: 'insideTopRight', fill: 'var(--c-muted)', fontSize: 10.5 }} />
          <Line type="monotone" dataKey="v" stroke="var(--c-ink)" strokeWidth={2.2} dot={false} isAnimationActive animationDuration={800} />
          <ReferenceDot x={last.label} y={last.v} r={5} fill={dotColor} stroke="var(--c-surface)" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
