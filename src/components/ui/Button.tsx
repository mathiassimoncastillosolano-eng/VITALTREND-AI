import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md'
  icon?: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:brightness-110 border-transparent',
  secondary: 'bg-surface-2 text-ink border-line hover:border-accent/50',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-surface-2 hover:text-ink',
  danger: 'bg-crit-soft text-crit border-crit/30 hover:border-crit/60',
}

export function Button({ variant = 'secondary', size = 'md', icon, className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        size === 'sm' ? 'px-2.5 py-1.5 text-[12px]' : 'px-3.5 py-2 text-[13px]'
      } ${VARIANTS[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
