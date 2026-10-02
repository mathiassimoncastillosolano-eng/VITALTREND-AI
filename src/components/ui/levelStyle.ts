import { CheckCircle2, Eye, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { RiskLevel } from '@/types'

export interface LevelStyle {
  icon: LucideIcon
  text: string
  bg: string
  border: string
  solid: string
  hex: string
}

export const LEVEL_STYLE: Record<RiskLevel, LevelStyle> = {
  estable: { icon: CheckCircle2, text: 'text-ok', bg: 'bg-ok-soft', border: 'border-ok/30', solid: 'bg-ok', hex: 'var(--c-ok)' },
  evaluacion: { icon: Eye, text: 'text-warn', bg: 'bg-warn-soft', border: 'border-warn/30', solid: 'bg-warn', hex: 'var(--c-warn)' },
  elevado: { icon: TriangleAlert, text: 'text-high', bg: 'bg-high-soft', border: 'border-high/35', solid: 'bg-high', hex: 'var(--c-high)' },
  critico: { icon: OctagonAlert, text: 'text-crit', bg: 'bg-crit-soft', border: 'border-crit/40', solid: 'bg-crit', hex: 'var(--c-crit)' },
}
