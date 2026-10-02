import { Fragment } from 'react'
import { ArrowRight, Bot, UserRound } from 'lucide-react'

const STEPS = [
  { label: 'IA detecta desviación', human: false },
  { label: 'IA explica factores', human: false },
  { label: 'IA prioriza', human: false },
  { label: 'Profesional evalúa', human: true },
  { label: 'Profesional registra decisión', human: true },
]

/** El flujo termina siempre en una persona: el sistema apoya, no diagnostica. */
export function DecisionFlow({ decided }: { decided: boolean }) {
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Flujo de decisión clínica">
      {STEPS.map((s, i) => {
        const Icon = s.human ? UserRound : Bot
        const active = s.human && i === 4 && decided
        return (
          <Fragment key={s.label}>
            <li className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium ${s.human ? 'border-ok/30 bg-ok-soft text-ok' : 'border-accent/25 bg-accent-soft text-accent'} ${active ? 'ring-2 ring-ok/40' : ''}`}>
              <Icon size={13} aria-hidden /> {s.label}
            </li>
            {i < STEPS.length - 1 && <ArrowRight size={13} className="text-muted" aria-hidden />}
          </Fragment>
        )
      })}
    </ol>
  )
}
