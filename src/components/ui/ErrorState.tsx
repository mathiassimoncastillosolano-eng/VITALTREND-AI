import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message = 'Los datos simulados no pudieron cargarse.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-high/30 bg-high-soft px-6 py-12 text-center">
      <TriangleAlert size={26} className="mb-3 text-high" aria-hidden />
      <p className="text-[15px] font-semibold">{message}</p>
      <p className="mt-1 text-[13px] text-muted">Es un error de demostración: no hay ningún servidor involucrado.</p>
      {onRetry && <Button className="mt-5" variant="primary" onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}
