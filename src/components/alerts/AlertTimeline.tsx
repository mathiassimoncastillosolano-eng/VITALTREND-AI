import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import type { TimelineEvent } from '@/types'
import { windowLabel } from '@/utils/format'
import { LEVEL_STYLE } from '@/components/ui/levelStyle'

export function AlertTimeline({ events }: { events: TimelineEvent[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  if (!events.length) return <p className="rounded-lg bg-surface-2/60 p-4 text-[13px] text-muted">Sin eventos de alerta en el periodo mostrado.</p>
  return (
    <ol className="relative space-y-1 before:absolute before:bottom-2 before:left-[53px] before:top-2 before:w-px before:bg-line">
      {events.map((e) => {
        const st = LEVEL_STYLE[e.level]
        const open = openId === e.id
        const Icon = st.icon
        return (
          <li key={e.id}>
            <button onClick={() => setOpenId(open ? null : e.id)} aria-expanded={open} className="flex w-full items-start gap-3 rounded-lg px-1 py-2 text-left hover:bg-surface-2/60">
              <span className="tabular w-11 shrink-0 pt-0.5 text-right text-[12.5px] font-semibold">{windowLabel(e.t)}</span>
              <span className={`relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${st.bg} ${st.text} ring-4 ring-surface`}><Icon size={11} aria-hidden /></span>
              <span className="flex-1 text-[13px] font-medium">{e.title}</span>
              <ChevronDown size={14} className={`mt-1 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-[76px] overflow-hidden pr-2 text-[12.5px] leading-snug text-muted">
                  <span className="block pb-2">{e.detail}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}
