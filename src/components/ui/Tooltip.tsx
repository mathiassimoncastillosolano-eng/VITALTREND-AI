import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CircleHelp } from 'lucide-react'
import { GLOSSARY } from '@/constants/glossary'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className={`pointer-events-none absolute left-1/2 z-50 w-max max-w-[260px] -translate-x-1/2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-left text-[12px] font-normal normal-case leading-snug tracking-normal text-ink shadow-pop ${
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/** Término técnico con definición en tooltip (Línea base, SHAP, NEWS2, ...). */
export function Term({ term, children, side }: { term: string; children?: ReactNode; side?: 'top' | 'bottom' }) {
  const def = GLOSSARY[term]
  if (!def) return <>{children ?? term}</>
  return (
    <Tooltip content={def} side={side}>
      <span
        tabIndex={0}
        className="inline-flex cursor-help items-center gap-1 underline decoration-muted/60 decoration-dotted underline-offset-4"
      >
        {children ?? term}
        <CircleHelp size={11} className="text-muted" aria-label={`Qué es ${term}`} />
      </span>
    </Tooltip>
  )
}
