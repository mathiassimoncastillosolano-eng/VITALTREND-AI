import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'
import { staggerChild, staggerParent } from '@/animations/variants'
import { METRIC_DEFS, scenarioMetrics } from '@/data/analytics.mock'
import { PageHeader } from '@/components/layout/PageHeader'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { Card, SimBadge } from '@/components/ui/Card'
import { Term } from '@/components/ui/Tooltip'

const COLORS = ['var(--c-muted)', 'var(--c-warn)', 'var(--c-accent)', 'var(--c-ok)']
const axis = { fill: 'var(--c-muted)', fontSize: 11 }

const tooltipStyle = { background: 'var(--c-surface-2)', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 12, color: 'var(--c-ink)' }

export default function Analytics() {
  const quality = scenarioMetrics.map((s) => ({ name: s.short, AUROC: s.auroc, AUPRC: s.auprc, Sensibilidad: s.sensitivity }))
  const ops = scenarioMetrics.map((s) => ({ name: s.short, 'False Alarm Rate': Math.round(s.falseAlarmRate * 100), 'Lead time (h)': s.leadTimeH }))
  const full = scenarioMetrics[3]
  const news = scenarioMetrics[0]
  const ml = scenarioMetrics[1]
  const lb = scenarioMetrics[2]

  return (
    <div>
      <PageHeader title="Análisis del sistema" subtitle="Cuatro escenarios lado a lado para aislar la contribución de cada componente (ML, línea base, anti-fatiga)." actions={<SimBadge label="Datos simulados" />} />

      <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenarioMetrics.map((s, i) => (
          <motion.section key={s.id} variants={staggerChild} className={`rounded-2xl border bg-surface p-4 shadow-card ${i === 3 ? 'border-ok/40' : 'border-line'}`}>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} /><h3 className="text-[13.5px] font-semibold">{s.name}</h3></div>
            <p className="mt-0.5 text-[11.5px] text-muted">{['Baseline estándar', 'Modelo estándar', 'Modelo propuesto', 'Sistema completo'][i]}</p>
            <dl className="mt-4 space-y-2.5">
              {METRIC_DEFS.map((m) => {
                const v = s[m.key]
                const max = m.key === 'leadTimeH' ? 6 : 1
                return (
                  <div key={m.key}>
                    <div className="flex justify-between text-[12px]"><dt className="text-muted"><Term term={m.term}>{m.label}</Term></dt><dd className="tabular font-semibold">{m.format(v)}</dd></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2"><motion.div className="h-full rounded-full" style={{ background: COLORS[i] }} initial={{ width: 0 }} animate={{ width: `${(v / max) * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} /></div>
                  </div>
                )
              })}
            </dl>
          </motion.section>
        ))}
      </motion.div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Calidad discriminativa" subtitle="AUROC, AUPRC y sensibilidad (a especificidad fija)" actions={<SimBadge />}>
          <div className="h-64" role="img" aria-label="Gráfico de barras de AUROC, AUPRC y sensibilidad por escenario">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quality} margin={{ left: -16, top: 8 }}>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} domain={[0, 1]} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--c-surface-2)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="AUROC" fill="var(--c-accent)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AUPRC" fill="var(--c-warn)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sensibilidad" fill="var(--c-ok)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Carga operativa" subtitle="Tasa de falsas alarmas (%) y lead time (h)" actions={<SimBadge />}>
          <div className="h-64" role="img" aria-label="Gráfico de barras de falsas alarmas y lead time por escenario">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ops} margin={{ left: -16, top: 8 }}>
                <CartesianGrid stroke="var(--grid)" vertical={false} />
                <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                <YAxis tick={axis} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--c-surface-2)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="False Alarm Rate" fill="var(--c-high)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lead time (h)" fill="var(--c-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4" title="¿De dónde viene la mejora?" subtitle="Contribución desagregada de cada componente (valores simulados)">
        <ul className="grid gap-3 md:grid-cols-3">
          <li className="rounded-xl bg-surface-2/60 p-4"><div className="text-[12px] text-muted">Aporte del modelo de ML</div><div className="tabular mt-1 text-[22px] font-semibold">+{(ml.auroc - news.auroc).toFixed(2)} AUROC</div><p className="mt-1 text-[12px] text-muted">NEWS2 → ML sin línea base</p></li>
          <li className="rounded-xl bg-surface-2/60 p-4"><div className="text-[12px] text-muted">Aporte de la línea base individual</div><div className="tabular mt-1 text-[22px] font-semibold">+{(lb.leadTimeH - ml.leadTimeH).toFixed(1)} h de lead time</div><p className="mt-1 text-[12px] text-muted">ML → ML + línea base</p></li>
          <li className="rounded-xl bg-surface-2/60 p-4"><div className="text-[12px] text-muted">Aporte del filtro anti-fatiga</div><div className="tabular mt-1 text-[22px] font-semibold">−{Math.round((lb.falseAlarmRate - full.falseAlarmRate) * 100)} pp falsas alarmas</div><p className="mt-1 text-[12px] text-muted">ML + línea base → sistema completo</p></li>
        </ul>
        <p className="mt-4 text-[12px] text-muted">No se usa Accuracy como métrica principal: el evento (sepsis) es poco frecuente y la exactitud sería engañosa. Todas las cifras son ilustrativas y no provienen de una validación real.</p>
      </Card>
      <Disclaimer />
    </div>
  )
}
