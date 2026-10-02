import { Clock } from 'lucide-react'
import type { RiskAssessment } from '@/types'
import { Term } from '@/components/ui/Tooltip'

export function RiskHorizon({ risk }: { risk: RiskAssessment }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted"><Clock size={13} aria-hidden /> <Term term="Horizonte">Horizonte estimado</Term></div>
      {risk.horizon ? (
        <>
          <div className="tabular mt-1 text-[28px] font-semibold leading-none">{risk.horizon[0]}–{risk.horizon[1]} h</div>
          <p className="mt-2 text-[12.5px] leading-snug text-muted">Posible inicio de deterioro si la tendencia actual continúa.</p>
        </>
      ) : (
        <>
          <div className="mt-1 text-[22px] font-semibold leading-none">Sin horizonte</div>
          <p className="mt-2 text-[12.5px] leading-snug text-muted">No se estima deterioro con la tendencia actual.</p>
        </>
      )}
    </div>
  )
}
