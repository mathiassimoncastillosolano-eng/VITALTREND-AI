import { useEffect, useState } from 'react'
import { ArrowDownWideNarrow } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useStats } from '@/hooks/useDerived'
import { useAppStore, type LevelFilter, type SortKey } from '@/store/useAppStore'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { SearchInput } from '@/components/ui/SearchInput'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'estado', label: 'Ordenar por estado' },
  { value: 'riesgo', label: 'Ordenar por riesgo' },
  { value: 'actualizacion', label: 'Última actualización' },
]

export function PatientFilters() {
  const filter = useAppStore((s) => s.filter)
  const setFilter = useAppStore((s) => s.setFilter)
  const stats = useStats()
  const [text, setText] = useState(filter.query)
  const debounced = useDebounce(text, 250)
  useEffect(() => setFilter({ query: debounced }), [debounced, setFilter])
  useEffect(() => setText(filter.query), [filter.query])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterTabs<LevelFilter>
        layoutId="level-filter"
        ariaLabel="Filtrar por estado"
        value={filter.level}
        onChange={(level) => setFilter({ level })}
        options={[
          { value: 'todos', label: 'Todos', count: stats.total },
          { value: 'estable', label: 'Estables', count: stats.estable },
          { value: 'evaluacion', label: 'Requieren evaluación', count: stats.evaluacion },
          { value: 'elevado', label: 'Riesgo elevado', count: stats.elevado },
          { value: 'critico', label: 'Críticos', count: stats.critico },
        ]}
      />
      <SearchInput value={text} onChange={setText} className="min-w-[220px] flex-1 md:max-w-xs" />
      <label className="relative flex items-center">
        <span className="sr-only">Ordenar</span>
        <ArrowDownWideNarrow size={15} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
        <select value={filter.sort} onChange={(e) => setFilter({ sort: e.target.value as SortKey })} className="appearance-none rounded-xl border border-line bg-surface py-2 pl-9 pr-8 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25">
          {SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
  )
}
