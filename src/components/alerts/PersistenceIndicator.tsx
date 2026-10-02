import { motion } from 'motion/react'
import { Check, Minus } from 'lucide-react'
import { PERSISTENCE_WINDOWS } from '@/constants'
import { Term } from '@/components/ui/Tooltip'

interface Props {
  windows: boolean[]
  persistence: number
  required: number
  variant?: 'compact' | 'full'
}

export function PersistenceIndicator({ windows, persistence, required, variant = 'full' }: Props) {
  const sustained = persistence >= required
  const label = sustained ? 'Desviación sostenida' : persistence > 0 ? 'Desviación en construcción' : 'Sin desviación'
  const tone = sustained ? 'text-high' : persistence > 0 ? 'text-warn' : 'text-ok'

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-muted">Desviación sostenida</span>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-1" aria-hidden>
            {windows.map((w, i) => (
              <span key={i} className={`h-1.5 w-4 rounded-full transition-colors duration-300 ${w ? (sustained ? 'bg-high' : 'bg-warn') : 'bg-surface-2'}`} />
            ))}
          </span>
          <span className={`tabular text-[12px] font-semibold ${tone}`}>{persistence}/{PERSISTENCE_WINDOWS}</span>
          <span className="sr-only">ventanas consecutivas</span>
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold"><Term term="Persistencia">Persistencia de la desviación</Term></span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${sustained ? 'bg-high-soft text-high' : persistence > 0 ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'}`}>{label}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {windows.map((w, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-lg bg-surface-2/70 px-3 py-2"
          >
            <span className={`grid h-6 w-6 place-items-center rounded-full ${w ? 'bg-high text-white' : 'bg-surface text-muted ring-1 ring-line'}`}>
              {w ? <Check size={14} strokeWidth={3} aria-hidden /> : <Minus size={14} aria-hidden />}
            </span>
            <span className="text-[13px]">Ventana {i + 1}</span>
            <span className="ml-auto text-[12px] text-muted">{w ? 'Desviación presente' : 'Dentro del rango'}</span>
          </motion.li>
        ))}
      </ul>
      <p className="tabular mt-3 text-[13px] font-semibold">
        {persistence}/{PERSISTENCE_WINDOWS} ventanas consecutivas
        <span className="ml-2 text-[12px] font-normal text-muted">(confirmación a partir de {required})</span>
      </p>
    </div>
  )
}
