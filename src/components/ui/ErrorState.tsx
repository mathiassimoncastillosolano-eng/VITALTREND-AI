import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message = 'No se pudieron cargar las lecturas de los pacientes.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-high/30 bg-high-soft px-6 py-12 text-center">
      <TriangleAlert size={26} className="mb-3 text-high" aria-hidden />
      <p className="text-[15px] font-semibold">{message}</p>
      <p className="mt-1 text-[13px] text-muted">Revisa la conexión e inténtalo de nuevo.</p>
      {onRetry && <Button className="mt-5" variant="primary" onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}
