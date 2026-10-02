import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'
import { Download } from 'lucide-react'
import { staggerParent } from '@/animations/variants'
import { falseAlarmDistribution, riskEvolution, weeklyAlerts } from '@/data/analytics.mock'
import { useAlerts, useStats } from '@/hooks/useDerived'
import { useAppStore } from '@/store/useAppStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { Card, SimBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import { Bell, BellOff, Clock, Users, ShieldCheck, GitCompareArrows } from 'lucide-react'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'

const axis = { fill: 'var(--c-muted)', fontSize: 11 }
const tip = { background: 'var(--c-surface-2)', border: '1px solid var(--c-line)', borderRadius: 10, fontSize: 12, color: 'var(--c-ink)' }
const PIE = ['var(--c-high)', 'var(--c-accent)', 'var(--c-muted)']

export default function Reports() {
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const push = useAppStore((s) => s.pushToast)
  const stats = useStats()
  const alerts = useAlerts()

  const leadRows = useMemo(
    () =>
      patients
        .filter((p) => analyses[p.id]?.leadTime.vitalTrendAlertT !== null)
        .map((p) => {
          const a = analyses[p.id]
          const now = a.current.t
          return { name: p.code.replace('Paciente ', 'P'), VitalTrend: now - (a.leadTime.vitalTrendAlertT ?? now), NEWS2: a.leadTime.news2AlertT === null ? 0 : now - a.leadTime.news2AlertT }
        }),
    [patients, analyses],
  )
  const sustained = alerts.filter((a) => a.persistence >= a.required).length
  const retained = patients.filter((p) => analyses[p.id]?.risk.suppressedByPersistence).length
  const leadVals = patients.map((p) => analyses[p.id]?.leadTime.hours).filter((h): h is number => h !== null && h !== undefined && h > 0)
  const avgLead = leadVals.length ? leadVals.reduce((a, b) => a + b, 0) / leadVals.length : 0

  if (status === 'error') return <><PageHeader title="Reportes" /><ErrorState onRetry={() => void load()} /></>

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Resumen del periodo con el estado actual de los pacientes." actions={<Button icon={<Download size={15} />} onClick={() => push('info', 'La exportación de reportes estará disponible próximamente.')}>Exportar</Button>} />
      {status === 'loading' ? <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div> : (
        <>
          <motion.div variants={staggerParent} initial="initial" animate="animate" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Monitorizados" value={stats.total} icon={Users} tone="accent" />
            <KpiCard label="Alertas generadas" value={alerts.length} icon={Bell} tone="high" hint="Estado actual" />
            <KpiCard label="Persistentes" value={sustained} icon={ShieldCheck} tone="crit" hint="Confirmadas" />
            <KpiCard label="Falsas alarmas evitadas" value={retained + 54} icon={BellOff} tone="ok" hint="Simulado (periodo)" />
            <KpiCard label="Lead time medio (h)" value={Math.round(avgLead * 10) / 10} icon={Clock} tone="accent" hint="Pacientes con ambos alertando" />
            <KpiCard label="Concordancia NEWS2" value={patients.filter((p) => analyses[p.id]?.alertActive === analyses[p.id]?.news2.alerting).length} total={stats.total} icon={GitCompareArrows} tone="warn" hint="Mismo veredicto" />
          </motion.div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card title="Alertas por día" subtitle="NEWS2 vs modelo sin filtro vs modelo con anti-fatiga" actions={<SimBadge />}>
              <div className="h-64" role="img" aria-label="Línea de alertas por día por escenario">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyAlerts} margin={{ left: -16, top: 8 }}>
                    <CartesianGrid stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} />
                    <YAxis tick={axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="news2" name="NEWS2" stroke="var(--c-muted)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sinFiltro" name="ML sin filtro" stroke="var(--c-warn)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="conFiltro" name="Con anti-fatiga" stroke="var(--c-ok)" strokeWidth={2.4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Evolución de riesgos" subtitle="Pacientes por nivel en las últimas 12 ventanas" actions={<SimBadge />}>
              <div className="h-64" role="img" aria-label="Áreas apiladas de pacientes por nivel de riesgo">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskEvolution} margin={{ left: -16, top: 8 }}>
                    <CartesianGrid stroke="var(--grid)" vertical={false} />
                    <XAxis dataKey="h" tick={axis} tickLine={false} axisLine={false} interval={2} />
                    <YAxis tick={axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" stackId="1" dataKey="estable" name="Estable" stroke="var(--c-ok)" fill="var(--c-ok)" fillOpacity={0.35} />
                    <Area type="monotone" stackId="1" dataKey="evaluacion" name="Evaluación" stroke="var(--c-warn)" fill="var(--c-warn)" fillOpacity={0.4} />
                    <Area type="monotone" stackId="1" dataKey="elevado" name="Elevado" stroke="var(--c-high)" fill="var(--c-high)" fillOpacity={0.5} />
                    <Area type="monotone" stackId="1" dataKey="critico" name="Crítico" stroke="var(--c-crit)" fill="var(--c-crit)" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Distribución de alertas" subtitle="Qué ocurrió con las desviaciones detectadas" actions={<SimBadge />}>
              <div className="h-64" role="img" aria-label="Distribución de alertas confirmadas, filtradas y descartadas">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={falseAlarmDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="var(--c-surface)">
                      {falseAlarmDistribution.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Tiempo en alerta: VitalTrend AI vs NEWS2" subtitle="Horas desde que cada sistema alertó (estado actual, coherente con los pacientes)">
              {leadRows.length === 0 ? <p className="text-[13px] text-muted">Aún no hay pacientes con alerta sostenida.</p> : (
                <div className="h-64" role="img" aria-label="Barras de horas en alerta por paciente">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadRows} margin={{ left: -16, top: 8 }}>
                      <CartesianGrid stroke="var(--grid)" vertical={false} />
                      <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={tip} cursor={{ fill: 'var(--c-surface-2)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="VitalTrend" name="VitalTrend AI (h)" fill="var(--c-accent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="NEWS2" name="NEWS2 (h)" fill="var(--c-high)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
          <p className="mt-4 text-[12px] text-muted">Las series semanales, de evolución y de distribución son ilustrativas (datos simulados). Los KPI y el gráfico de tiempo en alerta se calculan a partir de los pacientes simulados actuales.</p>
        </>
      )}
      <Disclaimer />
    </div>
  )
}
