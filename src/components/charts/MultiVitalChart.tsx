import { useMemo } from 'react'
import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { VITAL_COLOR, VITAL_META } from '@/constants'
import type { Patient, VitalKey } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { windowLabel } from '@/utils/format'

interface Props {
  patient: Patient
  vitals: VitalKey[]
  /** Cantidad de ventanas recientes a mostrar. */
  windows: number
  height?: number
}

/**
 * Todos los signos en una sola escala: desviación respecto a la línea base individual,
 * medida en desviaciones estándar (0 = habitual; ±2 = límite del rango individual).
 */
export function MultiVitalChart({ patient, vitals, windows, height = 300 }: Props) {
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const data = useMemo(
    () =>
      patient.history.slice(-windows).map((p) => {
        const row: Record<string, number | string> = { label: windowLabel(p.t) }
        for (const k of vitals) {
          row[k] = Number(((p[k] - eff[k].mean) / eff[k].sd).toFixed(2))
          row[`${k}_raw`] = p[k]
        }
        return row
      }),
    [patient.history, windows, vitals, eff],
  )
  const all = data.flatMap((d) => vitals.map((k) => d[k] as number))
  const limit = Math.max(3, Math.ceil(Math.max(...all.map(Math.abs), 0)))
  const bound = Math.min(limit, 12)

  return (
    <div style={{ height }} role="img" aria-label="Evolución de los signos vitales respecto a la línea base individual, en desviaciones estándar">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <ReferenceArea y1={-2} y2={2} fill="var(--c-accent)" fillOpacity={0.1} strokeOpacity={0} />
          <ReferenceLine y={0} stroke="var(--c-muted)" strokeDasharray="4 4" label={{ value: 'Línea base', position: 'insideTopRight', fill: 'var(--c-muted)', fontSize: 10.5 }} />
          <XAxis dataKey="label" tick={{ fill: 'var(--c-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={32} />
          <YAxis
            domain={[-bound, bound]}
            allowDataOverflow
            tick={{ fill: 'var(--c-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => (v > 0 ? `+${v}` : `${v}`)}
            label={{ value: 'DE', angle: -90, position: 'insideLeft', fill: 'var(--c-muted)', fontSize: 10.5, offset: 18 }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--c-muted)', strokeOpacity: 0.4 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const row = payload[0].payload as Record<string, number>
              return (
                <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] shadow-pop">
                  <div className="mb-1 text-muted">{label}</div>
                  {vitals.map((k) => (
                    <div key={k} className="tabular flex items-center justify-between gap-4">
                      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: VITAL_COLOR[k] }} />{VITAL_META[k].short}</span>
                      <span className="font-semibold">{row[`${k}_raw`].toFixed(VITAL_META[k].decimals)} {VITAL_META[k].unit} <span className="font-normal text-muted">({row[k] > 0 ? '+' : ''}{row[k].toFixed(1)} DE)</span></span>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          {vitals.map((k) => (
            <Line key={k} type="monotone" dataKey={k} stroke={VITAL_COLOR[k]} strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} isAnimationActive animationDuration={700} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
