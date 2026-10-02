import { DISPLAY_VITALS, VITAL_META } from '@/constants'
import type { Patient } from '@/types'
import { effectiveBaseline, adverseZ } from '@/utils/clinical'
import { windowLabel } from '@/utils/format'
import { useMemo } from 'react'

/** Últimas lecturas; resalta los valores fuera de su rango individual (≥ 2 DE en sentido adverso). */
export function ReadingsTable({ patient, rows = 12 }: { patient: Patient; rows?: number }) {
  const eff = useMemo(() => effectiveBaseline(patient.baseline), [patient.baseline])
  const data = patient.history.slice(-rows).reverse()
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-[13px]">
        <caption className="sr-only">Últimas lecturas de signos vitales</caption>
        <thead className="border-b border-line text-[11.5px] text-muted">
          <tr>
            <th scope="col" className="py-2 pr-3 font-medium">Hora</th>
            {DISPLAY_VITALS.map((k) => (
              <th key={k} scope="col" className="px-3 py-2 font-medium">{VITAL_META[k].short} <span className="font-normal opacity-70">({VITAL_META[k].unit})</span></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((p, i) => (
            <tr key={p.t} className="border-b border-line/60 last:border-0">
              <th scope="row" className="tabular py-2 pr-3 text-left font-medium text-muted">{windowLabel(p.t)}{i === 0 && <span className="ml-1.5 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">última</span>}</th>
              {DISPLAY_VITALS.map((k) => {
                const z = adverseZ(k, p[k], eff[k])
                const cls = z >= 3 ? 'font-semibold text-crit' : z >= 2 ? 'font-semibold text-high' : z >= 1 ? 'text-warn' : ''
                return <td key={k} className={`tabular px-3 py-2 ${cls}`}>{p[k].toFixed(VITAL_META[k].decimals)}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
