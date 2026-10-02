import { motion } from 'motion/react'

interface Option<T extends string> {
  value: T
  label: string
  count?: number
}

interface Props<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
  layoutId: string
  ariaLabel: string
}

export function FilterTabs<T extends string>({ options, value, onChange, layoutId, ariaLabel }: Props<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              active ? 'text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-line"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
              {o.count !== undefined && <span className="tabular text-[11px] text-muted">{o.count}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
