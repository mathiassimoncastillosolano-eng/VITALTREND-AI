import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { DISPLAY_VITALS, VITAL_COLOR, VITAL_META, VITAL_KEYS } from '@/constants'
import { mockEngine } from '@/mockEngine'
import { patientHref } from '@/hooks/useRoute'
import type { Patient, PatientAnalysis, RiskLevel, VitalKey } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { rhythmLabel } from '@/utils/waveforms'
import { Card } from '@/components/ui/Card'
import { Term } from '@/components/ui/Tooltip'
import { LiveMonitor } from '@/components/monitor/LiveMonitor'
import { VitalCard } from './VitalCard'
import { ReadingsTable } from './ReadingsTable'
import { VitalTrendChart } from '@/components/charts/VitalTrendChart'
import { MultiVitalChart } from '@/components/charts/MultiVitalChart'
import { RiskTrendChart } from '@/components/charts/RiskTrendChart'
import { BaselineDeviation } from '@/components/baseline/BaselineDeviation'
import { BaselineConfidence } from '@/components/baseline/BaselineConfidence'
import { PersistenceIndicator } from '@/components/alerts/PersistenceIndicator'
import { AntiFatigueFilter } from '@/components/alerts/AntiFatigueFilter'
import { AlertTimeline } from '@/components/alerts/AlertTimeline'
import { ShapFactors } from '@/components/explainability/ShapFactors'
import { ConfidenceIndicator } from '@/components/explainability/ConfidenceIndicator'
import { RiskHorizon } from '@/components/explainability/RiskHorizon'
import { News2Comparison } from '@/components/comparison/News2Comparison'
import { LeadTimeViz } from '@/components/comparison/LeadTimeViz'
import { ClinicalDecisionPanel } from '@/components/decision/ClinicalDecisionPanel'

export interface TabProps {
  patient: Patient
  analysis: PatientAnalysis
  required: number
  showBand: boolean
}

const HEADLINE: Record<RiskLevel, string> = {
  estable: 'Signos dentro de su línea base individual.',
  evaluacion: 'Desviación detectada: el paciente queda en observación.',
  elevado: 'Riesgo elevado de deterioro. Requiere evaluación clínica prioritaria.',
  critico: 'Paciente crítico. Requiere evaluación inmediata.',
}
const BANNER: Record<RiskLevel, string> = {
  estable: 'border-ok/30 bg-ok-soft',
  evaluacion: 'border-warn/30 bg-warn-soft',
  elevado: 'border-high/35 bg-high-soft',
  critico: 'border-crit/40 bg-crit-soft',
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11.5px] text-muted">{label}</dt>
      <dd className="text-[13.5px] font-medium">{children}</dd>
    </div>
  )
}

export function OverviewTab({ patient, analysis: a, required, showBand }: TabProps) {
  const events = useMemo(() => mockEngine.getTimeline(patient, a, required).slice(0, 4), [patient, a, required])
  const score = Math.round(a.risk.score)
  return (
    <div className="space-y-6">
      <div className={`rounded-xl border px-4 py-3 ${BANNER[a.risk.level]}`}>
        <p className="text-[14px] font-semibold">{HEADLINE[a.risk.level]}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {a.shap[0] && a.shap[0].value > 0.004 ? `Factor principal: ${a.shap[0].title.toLowerCase()}. ` : ''}
          Herramienta de apoyo a la priorización: no diagnostica.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <div className="text-[12.5px] font-medium text-muted">Puntaje de riesgo</div>
          <div className="mt-1 flex items-baseline gap-2"><span className="tabular text-[28px] font-semibold leading-none">{score}</span><span className="text-[13px] text-muted">/ 100</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface" role="presentation"><div className="h-full rounded-full bg-gradient-to-r from-ok via-warn to-crit" style={{ width: `${score}%` }} /></div>
          <p className="tabular mt-2 text-[11.5px] text-muted"><Term term="NEWS2">NEWS2</Term> {a.news2.total} · {a.news2.band}{a.news2.alerting ? ' · umbral alcanzado' : ''}</p>
        </div>
        <ConfidenceIndicator confidence={a.risk.confidence} hours={patient.baseline.hoursAccumulated} />
        <RiskHorizon risk={a.risk} />
        <div className="rounded-xl border border-line bg-surface-2/60 p-4">
          <div className="text-[12.5px] font-medium text-muted"><Term term="Persistencia">Persistencia de la desviación</Term></div>
          <div className="mt-3"><PersistenceIndicator variant="compact" windows={a.windows} persistence={a.persistence} required={required} /></div>
          <p className="mt-3 text-[11.5px] text-muted">La alerta se confirma tras {required} ventanas consecutivas con desviación.</p>
        </div>
      </div>

      <LiveMonitor patient={patient} analysis={a} />

      <section aria-label="Signos vitales actuales">
        <h2 className="mb-3 text-[15px] font-semibold">Signos vitales</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DISPLAY_VITALS.map((k) => <VitalCard key={k} patient={patient} analysis={a} vital={k} showBand={showBand} />)}
          <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
            <div className="text-[12.5px] font-medium text-muted"><Term term="Shock Index">Índice de shock</Term></div>
            <div className="tabular mt-1 text-[30px] font-semibold leading-none">{a.shockIndex.toFixed(2)}</div>
            <p className="tabular mt-3 text-[12.5px] text-muted">Habitual {a.baselineShockIndex.toFixed(2)} · FC / PAS</p>
            <p className="mt-3 text-[11.5px] text-muted">{patient.ecgMonitored ? `ECG: ${rhythmLabel(a.current.hr, patient.rhythm === 'irregular')}.` : 'Sin ECG continuo.'}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Factores principales" subtitle="Lo que más contribuye al riesgo actual" actions={<a href={patientHref(patient.id, 'explicabilidad')} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">Explicación completa <ArrowRight size={13} aria-hidden /></a>}>
          {a.shap.filter((f) => f.value > 0.004).length === 0 ? (
            <p className="text-[13px] text-muted">Ningún factor contribuye de forma relevante.</p>
          ) : (
            <ol className="space-y-2.5">
              {a.shap.slice(0, 3).filter((f) => f.value > 0.004).map((f) => (
                <li key={f.key}>
                  <div className="flex justify-between gap-3 text-[13px]"><span className="font-medium">{f.title}</span><span className="tabular font-semibold text-high">+{f.value.toFixed(2)}</span></div>
                  <p className="text-[12.5px] leading-snug text-muted">{f.text}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
        <Card title="Eventos recientes" actions={<a href={patientHref(patient.id, 'eventos')} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline">Ver todos <ArrowRight size={13} aria-hidden /></a>}>
          <AlertTimeline events={events} />
        </Card>
      </div>

      <Card title="Contexto clínico">
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          <Fact label="Motivo de ingreso">{patient.admissionReason}</Fact>
          <Fact label="Días de hospitalización">{patient.admittedDays}</Fact>
          <Fact label="Servicio">{patient.specialty}</Fact>
          <Fact label="Base de datos propios">{patient.baseline.hoursAccumulated} h de monitoreo</Fact>
        </dl>
        {patient.note && <p className="mt-4 rounded-lg bg-accent-soft px-3 py-2 text-[12.5px]">{patient.note}</p>}
      </Card>
    </div>
  )
}

const RANGES = [
  { id: '6', label: '6 h', windows: 6 },
  { id: '12', label: '12 h', windows: 12 },
  { id: '24', label: '24 h', windows: 24 },
  { id: 'all', label: 'Todo', windows: 36 },
] as const

export function VitalsTab({ patient, analysis: a, required, showBand }: TabProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]['id']>('24')
  const [active, setActive] = useState<VitalKey[]>(['hr', 'rr', 'spo2', 'temp'])
  const windows = RANGES.find((r) => r.id === range)!.windows
  const toggle = (k: VitalKey) => setActive((cur) => (cur.includes(k) ? (cur.length > 1 ? cur.filter((x) => x !== k) : cur) : [...cur, k]))
  return (
    <div className="space-y-6">
      <Card
        title="Evolución multiparámetro"
        subtitle="Cada signo respecto a su línea base, en desviaciones estándar (DE). La franja marca el rango individual (±2 DE)."
        actions={
          <div role="group" aria-label="Periodo" className="flex gap-1 rounded-lg border border-line bg-surface-2 p-0.5">
            {RANGES.map((r) => (
              <button key={r.id} onClick={() => setRange(r.id)} aria-pressed={range === r.id} className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${range === r.id ? 'bg-surface text-ink shadow-card' : 'text-muted hover:text-ink'}`}>{r.label}</button>
            ))}
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Signos a mostrar">
          {VITAL_KEYS.map((k) => {
            const on = active.includes(k)
            return (
              <button key={k} onClick={() => toggle(k)} aria-pressed={on} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${on ? 'border-line bg-surface-2 text-ink' : 'border-line/60 text-muted hover:text-ink'}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: on ? VITAL_COLOR[k] : 'transparent', boxShadow: `inset 0 0 0 1.5px ${VITAL_COLOR[k]}` }} aria-hidden />
                {VITAL_META[k].short}
              </button>
            )
          })}
        </div>
        <MultiVitalChart patient={patient} vitals={active} windows={windows} />
      </Card>

      <Card title="Evolución del riesgo" subtitle="Puntaje por ventana y umbrales de observación, riesgo elevado y crítico">
        <RiskTrendChart patient={patient} required={required} windows={windows} />
      </Card>

      <section aria-label="Detalle por signo vital">
        <h2 className="mb-3 text-[15px] font-semibold">Detalle por signo</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {VITAL_KEYS.map((k) => (
            <Card key={k} title={VITAL_META[k].label} subtitle={`${a.deviations[k].current.toFixed(VITAL_META[k].decimals)} ${VITAL_META[k].unit} ahora`}>
              <VitalTrendChart patient={patient} vital={k} deviation={a.deviations[k]} showBand={showBand} height={170} />
            </Card>
          ))}
        </div>
      </section>

      <Card title="Últimas lecturas" subtitle="Los valores resaltados están fuera de su rango individual">
        <ReadingsTable patient={patient} />
      </Card>
    </div>
  )
}

export function BaselineTab({ patient, analysis: a, showBand }: TabProps) {
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const sds = Object.fromEntries(VITAL_KEYS.map((k) => [k, eff[k].sd])) as Record<VitalKey, number>
  return (
    <div className="space-y-6">
      <Card title={<Term term="Línea base">¿Qué es normal para este paciente?</Term>}>
        {patient.note && <p className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-[12.5px]">{patient.note} El sistema compara contra este rango individual, no contra el poblacional.</p>}
        <BaselineDeviation deviations={a.deviations} sds={sds} />
      </Card>
      <BaselineConfidence confidence={a.baselineConfidence} hours={patient.baseline.hoursAccumulated} building={a.baselineBuilding} />
      <Card title={`${VITAL_META.spo2.label}: actual y línea base`}>
        <VitalTrendChart patient={patient} vital="spo2" deviation={a.deviations.spo2} showBand={showBand} height={220} />
      </Card>
    </div>
  )
}

export function ExplainTab({ patient, analysis: a, required }: TabProps) {
  return (
    <div className="space-y-6">
      <Card><ShapFactors factors={a.shap} /></Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConfidenceIndicator confidence={a.risk.confidence} hours={patient.baseline.hoursAccumulated} />
        <RiskHorizon risk={a.risk} />
      </div>
      <AntiFatigueFilter windows={a.windows} persistence={a.persistence} required={required} suppressed={a.risk.suppressedByPersistence} />
    </div>
  )
}

export function ComparisonTab({ patient, analysis: a }: TabProps) {
  return (
    <div className="space-y-6">
      <Card><News2Comparison analysis={a} /></Card>
      <LeadTimeViz patient={patient} analysis={a} />
    </div>
  )
}

export function EventsTab({ patient, analysis: a, required }: TabProps) {
  const events = useMemo(() => mockEngine.getTimeline(patient, a, required), [patient, a, required])
  return <Card title="Eventos del paciente" subtitle="Cambios de nivel, confirmaciones de persistencia y desviaciones por signo"><AlertTimeline events={events} /></Card>
}

export function EvaluationTab({ patient, analysis: a }: TabProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card title="Evaluación clínica" subtitle={`Registra la decisión sobre ${patient.fullName}`}>
        <ClinicalDecisionPanel patientId={patient.id} analysis={a} />
      </Card>
    </div>
  )
}
