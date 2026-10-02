import { useState } from 'react'
import { motion } from 'motion/react'
import type { ShapFactor } from '@/types'
import { Term } from '@/components/ui/Tooltip'

export function ShapFactors({ factors }: { factors: ShapFactor[] }) {
  const [all, setAll] = useState(false)
  const shown = (all ? factors : factors.slice(0, 3)).filter((f) => f.value > 0.004)
  const max = Math.max(...factors.map((f) => f.value), 0.01)
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[13px] font-semibold">¿Por qué generamos esta alerta?</h4>
        <span className="text-[11.5px] text-muted">Contribución <Term term="SHAP">SHAP</Term> (simulada)</span>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-lg bg-surface-2/60 p-3 text-[13px] text-muted">Ningún factor contribuye de forma relevante: los signos están dentro de su línea base.</p>
      ) : (
        <ol className="space-y-4">
          {shown.map((f, i) => (
            <li key={f.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold"><span className="mr-2 text-muted">{i + 1}.</span>{f.title}</span>
                <span className="tabular text-[12.5px] font-semibold text-high">SHAP +{f.value.toFixed(2)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2" role="presentation">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-high" initial={{ width: 0 }} animate={{ width: `${(f.value / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }} />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{f.text}</p>
            </li>
          ))}
        </ol>
      )}
      {factors.length > 3 && (
        <button onClick={() => setAll((v) => !v)} className="mt-4 text-[12.5px] font-medium text-accent hover:underline">
          {all ? 'Ver solo los 3 principales' : 'Ver todos los factores'}
        </button>
      )}
      <p className="mt-3 text-[11.5px] text-muted">SHAP indica la contribución de una variable a la predicción; no representa causalidad fisiológica.</p>
    </div>
  )
}
