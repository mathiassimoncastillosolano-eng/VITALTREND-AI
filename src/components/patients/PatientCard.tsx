import { memo } from 'react'
import { motion } from 'motion/react'
import { Activity, ArrowUpRight, BellOff, Hourglass } from 'lucide-react'
import { DISPLAY_VITALS, LEVEL_META } from '@/constants'
import { staggerChild } from '@/animations/variants'
import type { Patient, PatientAnalysis } from '@/types'
import { formatAgo, formatMinutes, sexLabel } from '@/utils/format'
import { rhythmLabel } from '@/utils/waveforms'
import { openPatient, patientHref } from '@/hooks/useRoute'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'
import { VitalTile } from '@/components/vitals/VitalTile'
import { PersistenceIndicator } from '@/components/alerts/PersistenceIndicator'

interface Props {
  patient: Patient
  analysis: PatientAnalysis
  nowMin: number
  required: number
  compact?: boolean
}

function PatientCardBase({ patient, analysis: a, nowMin, required, compact = false }: Props) {
  const level = a.risk.level
  const st = LEVEL_STYLE[level]
  const border = level === 'critico' ? 'border-crit/50' : level === 'elevado' ? 'border-high/40' : 'border-line'
  const score = Math.round(a.risk.score)
  const rhythm = rhythmLabel(a.current.hr, patient.rhythm === 'irregular')

  return (
    <motion.article
      layout
      variants={staggerChild}
      className={`flex flex-col rounded-2xl border bg-surface p-4 shadow-card transition-colors duration-300 hover:border-accent/40 ${border} ${level === 'elevado' ? 'glow-high' : ''}`}
      aria-label={`${patient.fullName}, ${LEVEL_META[level].label}`}
    >
      <header className="flex items-start gap-3">
        <Avatar name={patient.fullName} hue={patient.hue} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-semibold leading-tight">
            <a href={patientHref(patient.id)} className="hover:text-accent hover:underline">{patient.fullName}</a>
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-muted">{patient.code} · ID {patient.hospitalId}</p>
          <p className="truncate text-[12px] text-muted">{patient.age} años · {sexLabel(patient.sex)} · {patient.specialty}</p>
          <p className="truncate text-[12px] text-muted">Habitación {patient.room} · Cama {patient.bed}</p>
        </div>
        <span className={level === 'critico' ? 'crit-pulse rounded-full' : ''}><StatusBadge level={level} size="sm" short /></span>
      </header>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {DISPLAY_VITALS.map((k, i) => (
          <VitalTile
            key={k}
            vital={k}
            deviation={a.deviations[k]}
            trend={a.trends[k]}
            className={!patient.ecgMonitored && i === DISPLAY_VITALS.length - 1 ? 'col-span-2' : ''}
          />
        ))}
        {patient.ecgMonitored && (
          <div className="rounded-xl bg-surface-2/70 px-3 py-2.5" role="group" aria-label={`ECG: ${rhythm}`}>
            <div className="flex items-center justify-between text-[11.5px] font-medium text-muted"><span>ECG</span><Activity size={13} aria-hidden /></div>
            <div className="text-[13px] font-semibold leading-tight">{patient.rhythm === 'irregular' ? 'Irregular' : a.current.hr > 100 ? 'Taquicardia' : a.current.hr < 50 ? 'Bradicardia' : 'Sinusal'}</div>
            <div className="truncate text-[11.5px] text-muted">{rhythm}</div>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-[11.5px] text-muted">Riesgo</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Puntaje de riesgo">
            <div className={`h-full rounded-full transition-all duration-500 ${st.solid}`} style={{ width: `${score}%` }} />
          </div>
          <span className={`tabular text-[12px] font-semibold ${level === 'estable' ? '' : st.text}`}>{score}</span>
          <span className="tabular text-[11.5px] text-muted">NEWS2 {a.news2.total}</span>
        </div>
        {!compact && <PersistenceIndicator variant="compact" windows={a.windows} persistence={a.persistence} required={required} />}
        {(a.baselineBuilding || a.risk.suppressedByPersistence) && (
          <div className="flex flex-wrap gap-1.5">
            {a.baselineBuilding && <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-[10.5px] font-medium text-warn"><Hourglass size={10} aria-hidden /> Línea base en construcción</span>}
            {a.risk.suppressedByPersistence && <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-medium text-accent"><BellOff size={10} aria-hidden /> Alerta retenida por persistencia</span>}
          </div>
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between gap-2">
        <span className="tabular text-[11.5px] text-muted" title={`Última lectura a las ${formatMinutes(patient.lastUpdateMin)}`}>
          Actualizado {formatAgo(nowMin, patient.lastUpdateMin)}
        </span>
        <Button size="sm" variant="secondary" icon={<ArrowUpRight size={14} />} onClick={() => openPatient(patient.id)}>Ver análisis</Button>
      </footer>
    </motion.article>
  )
}

export const PatientCard = memo(PatientCardBase)
