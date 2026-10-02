import { memo } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRight, BellOff, Hourglass } from 'lucide-react'
import { LEVEL_META, PRIMARY_VITALS } from '@/constants'
import { staggerChild } from '@/animations/variants'
import type { Patient, PatientAnalysis, VitalKey } from '@/types'
import { effectiveBaseline } from '@/utils/clinical'
import { formatMinutes, formatSigned } from '@/utils/format'
import { SEVERITY_LABEL, severityLevel } from '@/utils/severity'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'
import { Sparkline } from '@/components/charts/Sparkline'
import { VitalMetric } from '@/components/vitals/VitalMetric'
import { PersistenceIndicator } from '@/components/alerts/PersistenceIndicator'

interface Props {
  patient: Patient
  analysis: PatientAnalysis
  selected: boolean
  required: number
  showBand: boolean
  compact?: boolean
  onSelect: (id: string) => void
}

function focusVital(a: PatientAnalysis): VitalKey {
  return PRIMARY_VITALS.reduce((best, k) => (a.deviations[k].adverseZ > a.deviations[best].adverseZ ? k : best), 'spo2' as VitalKey)
}

function PatientCardBase({ patient, analysis: a, selected, required, showBand, compact = false, onSelect }: Props) {
  const level = a.risk.level
  const st = LEVEL_STYLE[level]
  const fv = focusVital(a)
  const dev = a.deviations[fv]
  const eff = effectiveBaseline(patient.baseline)
  const devLevel = severityLevel(dev.severity)
  const border = selected ? 'border-accent' : level === 'critico' ? 'border-crit/50' : level === 'elevado' ? 'border-high/40' : 'border-line'

  return (
    <motion.article
      layout
      variants={staggerChild}
      whileHover={{ y: -2 }}
      className={`flex flex-col rounded-2xl border bg-surface p-4 shadow-card transition-colors duration-300 ${border} ${level === 'elevado' ? 'glow-high' : ''}`}
      aria-label={`${patient.code}, ${LEVEL_META[level].label}`}
    >
      <header className="flex items-start gap-3">
        <Avatar code={patient.code} hue={patient.hue} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14.5px] font-semibold leading-tight">{patient.code}</h3>
          <p className="truncate text-[12px] text-muted">{patient.hospitalId} · Hab. {patient.room} · Cama {patient.bed}</p>
          <p className="truncate text-[12px] text-muted">{patient.specialty}</p>
        </div>
        <span className={level === 'critico' ? 'crit-pulse rounded-full' : ''}><StatusBadge level={level} size="sm" /></span>
      </header>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {PRIMARY_VITALS.map((k) => (
          <VitalMetric key={k} vital={k} deviation={a.deviations[k]} trend={a.trends[k]} variant="compact" />
        ))}
      </div>

      {!compact && (
      <div className="mt-3 rounded-lg bg-surface-2/50 px-2 pt-1.5">
        <div className="flex items-center justify-between px-1 text-[10.5px] text-muted">
          <span>{fv === 'hr' ? 'FC' : fv === 'rr' ? 'FR' : fv === 'spo2' ? 'SpO₂' : 'T°'} · últimas 24 ventanas</span>
          <span>línea base · rango individual</span>
        </div>
        <Sparkline values={patient.history.slice(-24).map((p) => p[fv])} mean={eff[fv].mean} sd={eff[fv].sd} color={level === 'estable' ? 'var(--c-ok)' : st.hex} showBand={showBand} />
      </div>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] text-muted">Desviación de línea base</span>
          <span className={`tabular text-[12px] font-semibold uppercase ${dev.severity === 'normal' ? 'text-ok' : LEVEL_STYLE[devLevel].text}`}>
            {dev.severity === 'normal' ? 'Baja' : SEVERITY_LABEL[dev.severity].replace('Desviación ', '')} {formatSigned(dev.percent, 0)}%
          </span>
        </div>
        <PersistenceIndicator variant="compact" windows={a.windows} persistence={a.persistence} required={required} />
        {(a.baselineBuilding || a.risk.suppressedByPersistence) && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {a.baselineBuilding && <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[10.5px] font-medium text-warn"><Hourglass size={10} aria-hidden /> Construyendo línea base</span>}
            {a.risk.suppressedByPersistence && <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-medium text-accent"><BellOff size={10} aria-hidden /> Alerta retenida (anti-fatiga)</span>}
          </div>
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between gap-2">
        <span className="tabular text-[11px] text-muted">Act. {formatMinutes(patient.lastUpdateMin)}</span>
        <Button size="sm" variant={selected ? 'primary' : 'secondary'} icon={<ArrowUpRight size={14} />} onClick={() => onSelect(patient.id)}>Ver análisis</Button>
      </footer>
    </motion.article>
  )
}

export const PatientCard = memo(PatientCardBase)
