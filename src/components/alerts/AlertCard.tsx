import { motion } from 'motion/react'
import { CheckCheck, ClipboardList, Eye, Trash2 } from 'lucide-react'
import { alertEnter } from '@/animations/variants'
import { LEVEL_META } from '@/constants'
import type { Alert, AlertStatus, Patient, PatientAnalysis } from '@/types'
import { windowLabel } from '@/utils/format'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { PersistenceIndicator } from './PersistenceIndicator'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'

const STATUS_LABEL: Record<AlertStatus, string> = {
  nueva: 'Nueva',
  revisada: 'Revisada',
  evaluacion: 'Evaluación solicitada',
  descartada: 'Descartada',
}

interface Props {
  alert: Alert
  patient: Patient
  analysis: PatientAnalysis
  status: AlertStatus
  onOpen: () => void
  onAction: (type: 'revisada' | 'evaluacion' | 'descartada') => void
}

export function AlertCard({ alert, patient, analysis, status, onOpen, onAction }: Props) {
  const st = LEVEL_STYLE[alert.level]
  const done = status !== 'nueva'
  return (
    <motion.article
      layout
      variants={alertEnter}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`rounded-2xl border bg-surface p-4 shadow-card transition-opacity ${done ? 'border-line opacity-75' : st.border}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="tabular rounded-lg bg-surface-2 px-2.5 py-1.5 text-[13px] font-semibold">{windowLabel(alert.t)}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={onOpen} className="text-[14.5px] font-semibold hover:text-accent">{patient.fullName}</button>
              <span className="text-[12px] text-muted">{patient.code} · ID {patient.hospitalId} · Hab. {patient.room} · Cama {patient.bed}</span>
            </div>
            <p className="mt-1 text-[13px]">{analysis.shap[0]?.text ?? alert.factor}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge level={alert.level} />
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${done ? 'bg-ok-soft text-ok' : 'bg-accent-soft text-accent'}`}>{STATUS_LABEL[status]}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-3 border-t border-line pt-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-xs"><PersistenceIndicator variant="compact" windows={analysis.windows} persistence={analysis.persistence} required={alert.required} /></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" icon={<Eye size={13} />} onClick={onOpen}>Revisar paciente</Button>
          <Button size="sm" icon={<CheckCheck size={13} />} onClick={() => onAction('revisada')} disabled={done}>Marcar revisada</Button>
          <Button size="sm" icon={<ClipboardList size={13} />} onClick={() => onAction('evaluacion')} disabled={done}>Solicitar evaluación</Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => onAction('descartada')} disabled={done}>Descartar</Button>
        </div>
      </div>
      <p className="sr-only">Nivel {LEVEL_META[alert.level].label}</p>
    </motion.article>
  )
}
