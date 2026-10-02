import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

/** Ctrl/Cmd + K abre la búsqueda; Esc la cierra. */
export function useGlobalHotkeys() {
  const setSearchOpen = useAppStore((s) => s.setSearchOpen)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        if (useAppStore.getState().searchOpen) setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])
}
