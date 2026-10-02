import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

/** Ctrl/Cmd + K abre la búsqueda; Esc cierra búsqueda o panel lateral. */
export function useGlobalHotkeys() {
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  const selectPatient = useAppStore((s) => s.selectPatient)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        const { searchOpen, selectedId } = useAppStore.getState()
        if (searchOpen) setSearchOpen(false)
        else if (selectedId) selectPatient(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen, selectPatient])
}
