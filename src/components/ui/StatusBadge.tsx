import { LEVEL_META } from '@/constants'
import type { RiskLevel } from '@/types'
import { LEVEL_STYLE } from './levelStyle'

interface Props {
  level: RiskLevel
  size?: 'sm' | 'md'
  short?: boolean
  uppercase?: boolean
}

/** Estado = color + icono + texto (nunca solo color). */
export function StatusBadge({ level, size = 'md', short = false, uppercase = true }: Props) {
  const st = LEVEL_STYLE[level]
  const Icon = st.icon
  const label = short ? LEVEL_META[level].short : LEVEL_META[level].label
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors duration-300 ${st.bg} ${st.border} ${st.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10.5px]' : 'px-2.5 py-1 text-[11.5px]'
      } ${uppercase ? 'uppercase tracking-wide' : ''}`}
    >
      <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} aria-hidden />
      {label}
    </span>
  )
}

export const RiskBadge = StatusBadge
