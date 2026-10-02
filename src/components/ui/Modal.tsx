import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { modalVariants } from '@/animations/variants'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, description, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-lg rounded-2xl border border-line bg-surface shadow-pop"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[16px] font-semibold">{title}</h2>
                {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
              </div>
              <button aria-label="Cerrar" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
