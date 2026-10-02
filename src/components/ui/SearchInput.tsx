import { Search, X } from 'lucide-react'
import type { Ref } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputRef?: Ref<HTMLInputElement>
  autoFocus?: boolean
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar paciente, ID, habitación o cama', inputRef, autoFocus, className = '' }: Props) {
  return (
    <label className={`relative flex items-center ${className}`}>
      <span className="sr-only">Buscar</span>
      <Search size={16} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-8 text-[13px] text-ink placeholder:text-muted/80 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      />
      {value && (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onClick={() => onChange('')}
          className="absolute right-2 grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </label>
  )
}
