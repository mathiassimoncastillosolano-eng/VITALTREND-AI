import { Info } from 'lucide-react'
import { DISCLAIMER } from '@/constants'

export function Disclaimer() {
  return (
    <footer className="mt-10 flex items-start gap-2 border-t border-line pt-4 text-[11.5px] leading-snug text-muted">
      <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
      <p>{DISCLAIMER}</p>
    </footer>
  )
}
