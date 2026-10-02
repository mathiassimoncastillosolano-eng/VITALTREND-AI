import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { CheckCheck, ClipboardCheck, ClipboardList, Stethoscope, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { openPatient } from '@/hooks/useRoute'
import { useClinicalActions } from '@/hooks/useClinicalActions'
import type { DecisionType, PatientAnalysis } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

const LABEL: Record<DecisionType, string> = {
  revisada: 'Alerta revisada',
  evaluacion: 'Evaluación solicitada',
  descartada: 'Alerta descartada',
  registrada: 'Decisión registrada',
}

interface Props {
  patientId: string
  analysis: PatientAnalysis
}

export function ClinicalDecisionPanel({ patientId, analysis }: Props) {
  const act = useClinicalActions()
  const allDecisions = useAppStore((s) => s.decisions)
  const decisions = useMemo(() => allDecisions.filter((d) => d.patientId === patientId), [allDecisions, patientId])
  const alertId = `${patientId}:${analysis.risk.level}`
  const status = useAppStore((s) => s.alertStatus[alertId])
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<DecisionType>('registrada')
  const [note, setNote] = useState('')
  const hasAlert = analysis.risk.level !== 'estable'

  const submit = () => {
    act(patientId, hasAlert ? alertId : null, type, note.trim())
    setOpen(false)
    setNote('')
  }

  return (
    <div className="space-y-4">
      {analysis.risk.level === 'critico' && (
        <p role="alert" className="rounded-lg border border-crit/40 bg-crit-soft px-3.5 py-2.5 text-[13px] font-medium text-crit">Paciente requiere evaluación prioritaria.</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button icon={<Stethoscope size={15} />} onClick={() => openPatient(patientId, 'vitales')}>Revisar signos vitales</Button>
        <Button icon={<CheckCheck size={15} />} onClick={() => act(patientId, hasAlert ? alertId : null, 'revisada')} disabled={status === 'revisada'}>Marcar como revisada</Button>
        <Button icon={<ClipboardList size={15} />} onClick={() => act(patientId, hasAlert ? alertId : null, 'evaluacion')} disabled={status === 'evaluacion'}>Solicitar evaluación</Button>
        <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => act(patientId, hasAlert ? alertId : null, 'descartada')} disabled={status === 'descartada' || !hasAlert}>Descartar alerta</Button>
      </div>
      <Button variant="primary" className="w-full" icon={<ClipboardCheck size={15} />} onClick={() => setOpen(true)}>Registrar decisión</Button>

      {decisions.length > 0 && (
        <ul className="space-y-2" aria-label="Decisiones registradas">
          {decisions.map((d) => (
            <motion.li key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-lg border border-ok/25 bg-ok-soft px-3 py-2.5">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-ok text-white">
                <CheckCheck size={12} aria-hidden />
              </motion.span>
              <div className="text-[12.5px]">
                <div className="font-semibold">{LABEL[d.type]} <span className="font-normal text-muted">· {d.at}</span></div>
                {d.note && <div className="text-muted">{d.note}</div>}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Registrar decisión clínica"
        description="Queda registrada en la historia del paciente con la hora de la última lectura."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={submit}>Confirmar (Enter)</Button>
          </>
        }
      >
        <fieldset className="space-y-2" onKeyDown={(e) => e.key === 'Enter' && submit()}>
          <legend className="mb-2 text-[12.5px] font-medium text-muted">Tipo de decisión</legend>
          {(Object.keys(LABEL) as DecisionType[]).map((k) => (
            <label key={k} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] ${type === k ? 'border-accent bg-accent-soft' : 'border-line'}`}>
              <input type="radio" name="decision" checked={type === k} onChange={() => setType(k)} className="accent-[var(--c-accent)]" />
              {LABEL[k]}
            </label>
          ))}
        </fieldset>
        <label className="mt-4 block text-[12.5px] font-medium text-muted">
          Nota clínica
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
            }}
            rows={3}
            placeholder="Ej.: Se solicita valoración médica y repetir signos en 30 min."
            className="mt-1.5 w-full resize-none rounded-lg border border-line bg-surface-2 p-2.5 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </label>
      </Modal>
    </div>
  )
}
