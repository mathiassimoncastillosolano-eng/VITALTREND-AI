import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[14px] text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}
