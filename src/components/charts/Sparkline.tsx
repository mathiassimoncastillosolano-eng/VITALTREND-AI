import { Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, YAxis } from 'recharts'

interface Props {
  values: number[]
  mean: number
  sd: number
  color: string
  height?: number
  showBand?: boolean
}

/** Mini tendencia: serie reciente + línea base + rango individual (±2 DE). */
export function Sparkline({ values, mean, sd, color, height = 56, showBand = true }: Props) {
  const data = values.map((v, i) => ({ i, v }))
  const lo = Math.min(...values, mean - 2 * sd)
  const hi = Math.max(...values, mean + 2 * sd)
  const pad = (hi - lo) * 0.1 || 1
  return (
    <div style={{ height }} role="img" aria-label="Mini tendencia respecto a línea base individual">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <YAxis hide domain={[lo - pad, hi + pad]} />
          {showBand && <ReferenceArea y1={mean - 2 * sd} y2={mean + 2 * sd} fill="var(--c-accent)" fillOpacity={0.12} strokeOpacity={0} />}
          <ReferenceLine y={mean} stroke="var(--c-muted)" strokeDasharray="3 3" strokeOpacity={0.7} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive animationDuration={700} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
