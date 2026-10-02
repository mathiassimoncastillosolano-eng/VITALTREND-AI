import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { drawerVariants } from '@/animations/variants'
import { PRIMARY_VITALS, VITAL_KEYS, VITAL_META } from '@/constants'
import { mockEngine } from '@/mockEngine'
import { useAppStore, type DrawerTab } from '@/store/useAppStore'
import type { Patient, PatientAnalysis, RiskLevel } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Term } from '@/components/ui/Tooltip'
import { VitalMetric } from '@/components/vitals/VitalMetric'
import { VitalTrendChart } from '@/components/charts/VitalTrendChart'
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

const TABS: { id: DrawerTab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'vitales', label: 'Signos vitales' },
  { id: 'baseline', label: 'Línea base' },
  { id: 'explicabilidad', label: 'Explicabilidad' },
  { id: 'comparacion', label: 'Comparación' },
  { id: 'historial', label: 'Historial' },
  { id: 'notas', label: 'Notas' },
]

const HEADLINE: Record<RiskLevel, string> = {
  estable: 'Signos dentro de su línea base individual.',
  evaluacion: 'Desviación detectada. Requiere evaluación clínica.',
  elevado: 'Riesgo elevado de deterioro. Requiere evaluación clínica prioritaria.',
  critico: 'Paciente requiere evaluación prioritaria.',
}

interface TabProps {
  patient: Patient
  analysis: PatientAnalysis
  required: number
  showBand: boolean
}

function Section({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
      {title && <h4 className="mb-3 text-[13px] font-semibold">{title}</h4>}
      {children}
    </div>
  )
}

function SummaryTab({ patient, analysis: a, required }: TabProps) {
  const setTab = useAppStore((s) => s.setDrawerTab)
  return (
    <div className="space-y-4">
      <div className={`rounded-xl border px-4 py-3 text-[13.5px] font-medium ${a.risk.level === 'critico' ? 'border-crit/40 bg-crit-soft' : a.risk.level === 'elevado' ? 'border-high/35 bg-high-soft' : a.risk.level === 'evaluacion' ? 'border-warn/30 bg-warn-soft' : 'border-ok/30 bg-ok-soft'}`}>
        {HEADLINE[a.risk.level]}
        <div className="mt-0.5 text-[12px] font-normal text-muted">Herramienta de apoyo a la priorización: no diagnostica.</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PRIMARY_VITALS.map((k) => <VitalMetric key={k} vital={k} deviation={a.deviations[k]} trend={a.trends[k]} />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConfidenceIndicator confidence={a.risk.confidence} hours={patient.baseline.hoursAccumulated} />
        <RiskHorizon risk={a.risk} />
      </div>
      <Section><PersistenceIndicator windows={a.windows} persistence={a.persistence} required={required} /></Section>
      <Section title="Factores principales">
        <ol className="space-y-1.5 text-[13px]">
          {a.shap.slice(0, 3).filter((f) => f.value > 0.004).map((f, i) => (
            <li key={f.key} className="flex justify-between gap-3"><span><span className="mr-1.5 text-muted">{i + 1}.</span>{f.title}</span><span className="tabular font-semibold text-high">+{f.value.toFixed(2)}</span></li>
          ))}
        </ol>
        <button onClick={() => setTab('explicabilidad')} className="mt-3 text-[12.5px] font-medium text-accent hover:underline">Ver explicación completa</button>
      </Section>
    </div>
  )
}

function VitalsTab({ patient, analysis: a, showBand }: TabProps) {
  return (
    <div className="space-y-4">
      {VITAL_KEYS.map((k) => (
        <Section key={k}>
          <div className="grid gap-4 md:grid-cols-[210px_1fr]">
            <VitalMetric vital={k} deviation={a.deviations[k]} trend={a.trends[k]} />
            <VitalTrendChart patient={patient} vital={k} deviation={a.deviations[k]} showBand={showBand} height={170} />
          </div>
        </Section>
      ))}
      <p className="text-[12px] text-muted"><Term term="Shock Index">Shock Index</Term> actual: <b className="tabular text-ink">{a.shockIndex.toFixed(2)}</b> (habitual {a.baselineShockIndex.toFixed(2)}).</p>
    </div>
  )
}

function BaselineTab({ patient, analysis: a, showBand }: TabProps) {
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const sds = Object.fromEntries(VITAL_KEYS.map((k) => [k, eff[k].sd])) as Record<(typeof VITAL_KEYS)[number], number>
  return (
    <div className="space-y-4">
      <Section title={<><Term term="Línea base">¿Qué es normal para este paciente?</Term></>}>
        {patient.note && <p className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-[12.5px]">{patient.note} El sistema compara contra ESTE rango, no contra el poblacional.</p>}
        <BaselineDeviation deviations={a.deviations} sds={sds} />
      </Section>
      <BaselineConfidence confidence={a.baselineConfidence} hours={patient.baseline.hoursAccumulated} building={a.baselineBuilding} />
      <Section title={`${VITAL_META.spo2.label}: actual vs. línea base`}>
        <VitalTrendChart patient={patient} vital="spo2" deviation={a.deviations.spo2} showBand={showBand} height={190} />
      </Section>
    </div>
  )
}

function ExplainTab({ patient, analysis: a, required }: TabProps) {
  return (
    <div className="space-y-4">
      <Section><ShapFactors factors={a.shap} /></Section>
      <div className="grid gap-3 sm:grid-cols-2">
        <ConfidenceIndicator confidence={a.risk.confidence} hours={patient.baseline.hoursAccumulated} />
        <RiskHorizon risk={a.risk} />
      </div>
      <AntiFatigueFilter windows={a.windows} persistence={a.persistence} required={required} suppressed={a.risk.suppressedByPersistence} />
    </div>
  )
}

function ComparisonTab({ patient, analysis: a }: TabProps) {
  return (
    <div className="space-y-4">
      <Section><News2Comparison analysis={a} /></Section>
      <LeadTimeViz patient={patient} analysis={a} />
    </div>
  )
}

function HistoryTab({ patient, analysis: a, required }: TabProps) {
  const events = useMemo(() => mockEngine.getTimeline(patient, a, required), [patient, a, required])
  return <Section title="Historial de eventos"><AlertTimeline events={events} /></Section>
}

function NotesTab({ analysis: a, patient }: TabProps) {
  return (
    <Section title="Retroalimentación clínica simulada">
      <ClinicalDecisionPanel patientId={patient.id} analysis={a} />
    </Section>
  )
}

const TAB_VIEW: Record<DrawerTab, (p: TabProps) => ReactNode> = {
  resumen: (p) => <SummaryTab {...p} />,
  vitales: (p) => <VitalsTab {...p} />,
  baseline: (p) => <BaselineTab {...p} />,
  explicabilidad: (p) => <ExplainTab {...p} />,
  comparacion: (p) => <ComparisonTab {...p} />,
  historial: (p) => <HistoryTab {...p} />,
  notas: (p) => <NotesTab {...p} />,
}

export function PatientDrawer({ patient, analysis }: { patient: Patient; analysis: PatientAnalysis }) {
  const tab = useAppStore((s) => s.drawerTab)
  const setTab = useAppStore((s) => s.setDrawerTab)
  const close = useAppStore((s) => s.selectPatient)
  const required = useAppStore((s) => s.settings.requiredWindows)
  const showBand = useAppStore((s) => s.settings.showBaselineBand)
  const closeRef = useRef<HTMLButtonElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => closeRef.current?.focus(), [])
  useEffect(() => bodyRef.current?.scrollTo({ top: 0 }), [tab, patient.id])

  return (
    <div className="fixed inset-0 z-[60]">
      <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => close(null)} />
      <motion.aside
        variants={drawerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label={`Análisis de ${patient.code}`}
        className="absolute inset-y-0 right-0 flex w-full max-w-[760px] flex-col border-l border-line bg-bg shadow-pop"
      >
        <header className="border-b border-line bg-surface px-5 pt-4">
          <div className="flex items-start gap-3">
            <Avatar code={patient.code} hue={patient.hue} size={44} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-semibold leading-tight">{patient.code}</h2>
              <p className="text-[12.5px] text-muted">ID {patient.hospitalId} · Habitación {patient.room} · Cama {patient.bed} · {patient.specialty}</p>
            </div>
            <div className={analysis.risk.level === 'critico' ? 'crit-pulse rounded-full' : ''}><StatusBadge level={analysis.risk.level} /></div>
            <button ref={closeRef} onClick={() => close(null)} aria-label="Cerrar panel (Esc)" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"><X size={18} /></button>
          </div>
          <div role="tablist" aria-label="Secciones del paciente" className="-mb-px mt-3 flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`relative whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors ${tab === t.id ? 'text-ink' : 'text-muted hover:text-ink'}`}>
                {t.label}
                {tab === t.id && <motion.span layoutId="drawer-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
        </header>
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-5">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            {TAB_VIEW[tab]({ patient, analysis, required, showBand })}
          </motion.div>
        </div>
        <footer className="border-t border-line bg-surface px-5 py-2.5 text-[11px] text-muted">Datos simulados · Herramienta experimental de apoyo a la priorización; no diagnostica.</footer>
      </motion.aside>
    </div>
  )
}

