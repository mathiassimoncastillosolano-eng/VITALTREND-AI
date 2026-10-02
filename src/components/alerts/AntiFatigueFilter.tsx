import { motion } from 'motion/react'
import { BellOff, Check, ShieldCheck, X } from 'lucide-react'
import { PERSISTENCE_WINDOWS } from '@/constants'
import { Term } from '@/components/ui/Tooltip'

interface Props {
  windows: boolean[]
  persistence: number
  required: number
  suppressed: boolean
}

export function AntiFatigueFilter({ windows, persistence, required, suppressed }: Props) {
  const confirmed = persistence >= required
  return (
    <div className={`rounded-xl border p-4 ${confirmed ? 'border-high/40 bg-high-soft' : 'border-line bg-surface-2/60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent"><ShieldCheck size={17} aria-hidden /></span>
          <div>
            <div className="text-[13.5px] font-semibold"><Term term="Anti-fatiga">Filtro anti-fatiga</Term></div>
            <div className="text-[11.5px] text-muted">Persistencia requerida: {required}/{PERSISTENCE_WINDOWS} ventanas</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden /> Activo
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {windows.map((w, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-[12.5px]">
            <span className={`grid h-5 w-5 place-items-center rounded-full ${w ? 'bg-ok text-white' : 'bg-surface-2 text-muted'}`}>
              {w ? <Check size={12} strokeWidth={3} aria-hidden /> : <X size={12} aria-hidden />}
            </span>
            Ventana {i + 1}
            <span className="sr-only">{w ? 'con desviación' : 'sin desviación'}</span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-2 text-[13px] font-medium leading-snug">
        {confirmed ? (
          'Alerta confirmada por persistencia temporal.'
        ) : suppressed ? (
          <>
            <BellOff size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden />
            Un modelo sin filtro habría alertado; aquí se retiene hasta confirmar {required} ventanas consecutivas (evita una falsa alarma por un pico aislado).
          </>
        ) : (
          'Sin alerta confirmada: la desviación aún no es sostenida.'
        )}
      </p>
    </div>
  )
}
