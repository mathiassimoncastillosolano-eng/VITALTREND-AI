import { useEffect, useRef, useState } from 'react'
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { SORT_OPTIONS, useFilteredPatients } from '@/hooks/useDerived'
import { useAppStore, type LevelFilter, type SortKey } from '@/store/useAppStore'
import { FilterTabs } from '@/components/ui/FilterTabs'
import { SearchInput } from '@/components/ui/SearchInput'

const SORT_DIR_LABEL: Record<SortKey, [desc: string, asc: string]> = {
  riesgo: ['Mayor riesgo primero', 'Menor riesgo primero'],
  actualizacion: ['Más reciente primero', 'Más antigua primero'],
  hr: ['Más alta primero', 'Más baja primero'],
  spo2: ['Más alta primero', 'Más baja primero'],
  temp: ['Más alta primero', 'Más baja primero'],
  rr: ['Más alta primero', 'Más baja primero'],
}

export function PatientFilters() {
  const filter = useAppStore((s) => s.filter)
  const total = useAppStore((s) => s.patients.length)
  const setFilter = useAppStore((s) => s.setFilter)
  const setSort = useAppStore((s) => s.setSort)
  const toggleDir = useAppStore((s) => s.toggleSortDir)
  const shown = useFilteredPatients().length

  const [text, setText] = useState(filter.query)
  const debounced = useDebounce(text, 250)
  const pushed = useRef(filter.query)
  const [cleared, setCleared] = useState(false)

  // Escritura local -> filtro compartido (con retardo).
  useEffect(() => {
    if (debounced !== pushed.current) {
      pushed.current = debounced
      setFilter({ query: debounced })
    }
  }, [debounced, setFilter])

  // Cambios externos del filtro (p. ej. "Limpiar") -> campo de texto.
  useEffect(() => {
    if (filter.query !== pushed.current) {
      pushed.current = filter.query
      setText(filter.query)
    }
  }, [filter.query])

  const typing = text !== debounced
  const prevText = useRef(text)
  useEffect(() => {
    if (prevText.current.trim() && !text.trim()) {
      setCleared(true)
      const id = window.setTimeout(() => setCleared(false), 1800)
      prevText.current = text
      return () => window.clearTimeout(id)
    }
    prevText.current = text
  }, [text])

  const dirLabel = SORT_DIR_LABEL[filter.sort][filter.dir === 'desc' ? 0 : 1]
  const hasFilters = filter.level !== 'todos' || filter.query.trim() !== ''

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs<LevelFilter>
          layoutId="level-filter"
          ariaLabel="Filtrar por estado clínico"
          value={filter.level}
          onChange={(level) => setFilter({ level })}
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'estable', label: 'Estables' },
            { value: 'evaluacion', label: 'En observación' },
            { value: 'elevado', label: 'Riesgo elevado' },
            { value: 'critico', label: 'Crítico' },
          ]}
        />
        <SearchInput value={text} onChange={setText} placeholder="Nombre, ID, habitación o cama" className="min-w-[240px] flex-1 md:max-w-sm" />
        <div className="flex items-center gap-1.5">
          <label className="sr-only" htmlFor="patient-sort">Ordenar pacientes por</label>
          <select
            id="patient-sort"
            value={filter.sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-line bg-surface py-2 pl-3 pr-8 text-[13px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={toggleDir}
            title={dirLabel}
            aria-label={`Orden: ${dirLabel}. Cambiar sentido`}
            className="inline-flex h-[38px] items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-[12px] text-muted hover:text-ink"
          >
            {filter.dir === 'desc' ? <ArrowDownNarrowWide size={15} aria-hidden /> : <ArrowUpNarrowWide size={15} aria-hidden />}
            <span className="hidden 2xl:inline">{dirLabel}</span>
          </button>
        </div>
      </div>
      <p className="flex min-h-5 items-center gap-2 text-[12.5px] text-muted" role="status" aria-live="polite">
        {typing ? (
          <><Loader2 size={13} className="animate-spin" aria-hidden /> Buscando…</>
        ) : cleared && !hasFilters ? (
          'Búsqueda borrada. Se muestran todos los pacientes.'
        ) : (
          <>
            <span className="tabular">{shown} de {total} pacientes</span>
            {hasFilters && (
              <button onClick={() => { setFilter({ level: 'todos', query: '' }) }} className="font-medium text-accent hover:underline">Limpiar filtros</button>
            )}
          </>
        )}
      </p>
    </div>
  )
}
