import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { useCountUp } from '@/hooks/useCountUp'
import { staggerChild } from '@/animations/variants'

interface Props {
  label: string
  value: number
  total?: number
  icon: LucideIcon
  tone: 'accent' | 'ok' | 'warn' | 'high' | 'crit'
  hint?: string
  active?: boolean
  onClick?: () => void
}

const TONES = {
  accent: { text: 'text-accent', bg: 'bg-accent-soft', bar: 'bg-accent' },
  ok: { text: 'text-ok', bg: 'bg-ok-soft', bar: 'bg-ok' },
  warn: { text: 'text-warn', bg: 'bg-warn-soft', bar: 'bg-warn' },
  high: { text: 'text-high', bg: 'bg-high-soft', bar: 'bg-high' },
  crit: { text: 'text-crit', bg: 'bg-crit-soft', bar: 'bg-crit' },
}

export function KpiCard({ label, value, total, icon: Icon, tone, hint, active, onClick }: Props) {
  const shown = useCountUp(value)
  const t = TONES[tone]
  const pct = total ? Math.round((value / total) * 100) : null
  return (
    <motion.button
      variants={staggerChild}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      aria-pressed={active}
      className={`group w-full rounded-2xl border bg-surface p-4 text-left shadow-card transition-colors ${
        active ? 'border-accent/60' : 'border-line hover:border-accent/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-muted">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${t.bg} ${t.text}`}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="tabular text-[32px] font-semibold leading-none">{shown}</span>
        {pct !== null && <span className="tabular text-[12.5px] text-muted">{pct} %</span>}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" role="presentation">
        <motion.div
          className={`h-full rounded-full ${t.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct ?? 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {hint && <p className="mt-2 text-[11.5px] text-muted">{hint}</p>}
    </motion.button>
  )
}
