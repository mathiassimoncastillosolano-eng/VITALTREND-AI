import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAppStore } from '@/store/useAppStore'
import { openPatient } from '@/hooks/useRoute'
import { patientMatches } from '@/utils/search'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchInput } from '@/components/ui/SearchInput'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'

export function SearchPalette() {
  const open = useAppStore((s) => s.searchOpen)
  const setOpen = useAppStore((s) => s.setSearchOpen)
  const patients = useAppStore((s) => s.patients)
  const analyses = useAppStore((s) => s.analyses)
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const dq = useDebounce(q, 180)

  const results = useMemo(() => {
    return patients.filter((p) => patientMatches(p, dq)).slice(0, 8)
  }, [patients, dq])

  useEffect(() => {
    if (open) {
      setQ('')
      setCursor(0)
    }
  }, [open])
  useEffect(() => setCursor(0), [dq])

  const choose = (id: string) => {
    setOpen(false)
    openPatient(id)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Búsqueda rápida"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
              if (e.key === 'Enter' && results[cursor]) choose(results[cursor].id)
            }}
            className="relative w-full max-w-xl rounded-2xl border border-line bg-surface p-3 shadow-pop"
          >
            <SearchInput value={q} onChange={setQ} autoFocus />
            <ul className="mt-2 max-h-[50vh] space-y-1 overflow-y-auto" role="listbox" aria-label="Resultados">
              {results.map((p, i) => {
                const a = analyses[p.id]
                return (
                  <li key={p.id} role="option" aria-selected={i === cursor}>
                    <button onClick={() => choose(p.id)} onMouseEnter={() => setCursor(i)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${i === cursor ? 'bg-surface-2' : ''}`}>
                      <Avatar name={p.fullName} hue={p.hue} size={32} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold">{p.fullName}</span>
                        <span className="block truncate text-[12px] text-muted">{p.code} · ID {p.hospitalId} · Hab. {p.room} · Cama {p.bed} · {p.specialty}</span>
                      </span>
                      {a && <StatusBadge level={a.risk.level} size="sm" short />}
                    </button>
                  </li>
                )
              })}
            </ul>
            {results.length === 0 && <div className="mt-2"><EmptyState title={dq.trim() ? `Sin resultados para “${dq.trim()}”` : 'Sin pacientes'} description="Busca por nombre, ID, habitación (hab 103) o cama (cama 2)." /></div>}
            <div className="mt-2 flex gap-3 px-2 text-[11px] text-muted"><span>↑↓ navegar</span><span>Enter abrir</span><span>Esc cerrar</span></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
