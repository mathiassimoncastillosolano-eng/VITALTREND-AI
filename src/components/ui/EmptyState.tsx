import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title = 'No hay pacientes que coincidan con los filtros.',
  description = 'Prueba con otro estado o borra la búsqueda.',
  action,
  icon,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
        {icon ?? <SearchX size={22} />}
      </div>
      <p className="text-[15px] font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
