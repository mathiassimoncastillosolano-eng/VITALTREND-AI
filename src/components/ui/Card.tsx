import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  padded?: boolean
}

export function Card({ title, subtitle, actions, padded = true, className = '', children, ...rest }: Props) {
  return (
    <section className={`rounded-2xl border border-line bg-surface shadow-card ${className}`} {...rest}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            {title && <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

export function SimBadge({ label = 'Datos simulados' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-accent">
      {label}
    </span>
  )
}