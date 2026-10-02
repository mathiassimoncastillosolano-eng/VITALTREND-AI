import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Info, OctagonAlert, X } from 'lucide-react'
import { useAppStore, type Toast } from '@/store/useAppStore'

const KIND = {
  success: { icon: CheckCircle2, cls: 'text-ok' },
  info: { icon: Info, cls: 'text-accent' },
  error: { icon: OctagonAlert, cls: 'text-high' },
  critical: { icon: OctagonAlert, cls: 'text-crit' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useAppStore((s) => s.dismissToast)
  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.kind === 'critical' ? 7000 : 4000)
    return () => window.clearTimeout(id)
  }, [toast.id, toast.kind, dismiss])
  const { icon: Icon, cls } = KIND[toast.kind]
  return (
    <motion.div
      layout
      role={toast.kind === 'critical' ? 'alert' : 'status'}
      initial={{ opacity: 0, x: 40, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5 shadow-pop"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${cls}`} aria-hidden />
      <p className="flex-1 text-[13px] leading-snug">{toast.message}</p>
      <button aria-label="Cerrar notificación" onClick={() => dismiss(toast.id)} className="text-muted hover:text-ink">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] flex flex-col gap-2" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}
