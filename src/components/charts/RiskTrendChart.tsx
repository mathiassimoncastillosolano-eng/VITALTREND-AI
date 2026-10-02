import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LEVEL_META, RISK_THRESHOLDS } from '@/constants'
import type { Patient, RiskLevel } from '@/types'
import { levelSeries } from '@/utils/clinical'
import { windowLabel } from '@/utils/format'

/** Evolución del puntaje de riesgo con los umbrales de cada nivel. */
export function RiskTrendChart({ patient, required, windows, height = 170 }: { patient: Patient; required: number; windows: number; height?: number }) {
  const data = useMemo(
    () => levelSeries(patient, required).slice(-windows).map((s) => ({ label: windowLabel(s.t), score: Math.round(s.score), level: s.level })),
    [patient, required, windows],
  )
  return (
    <div style={{ height }} role="img" aria-label="Evolución del puntaje de riesgo">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="risk-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-high)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--c-high)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--c-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={32} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fill: 'var(--c-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
          <ReferenceLine y={RISK_THRESHOLDS.evaluacion} stroke="var(--c-warn)" strokeDasharray="3 4" strokeOpacity={0.7} />
          <ReferenceLine y={RISK_THRESHOLDS.elevado} stroke="var(--c-high)" strokeDasharray="3 4" strokeOpacity={0.7} />
          <ReferenceLine y={RISK_THRESHOLDS.critico} stroke="var(--c-crit)" strokeDasharray="3 4" strokeOpacity={0.7} />
          <Tooltip
            cursor={{ stroke: 'var(--c-muted)', strokeOpacity: 0.4 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as { label: string; score: number; level: RiskLevel }
              return (
                <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] shadow-pop">
                  <div className="text-muted">{row.label}</div>
                  <div className="tabular font-semibold">Riesgo {row.score}/100</div>
                  <div className="text-muted">{LEVEL_META[row.level].label}</div>
                </div>
              )
            }}
          />
          <Area type="monotone" dataKey="score" stroke="var(--c-high)" strokeWidth={2} fill="url(#risk-fill)" isAnimationActive animationDuration={700} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
