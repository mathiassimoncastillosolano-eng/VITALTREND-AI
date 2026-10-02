import { Presentation } from 'lucide-react'
import { DEMO_PATIENT_ID } from '@/constants'
import { useAppStore, type DrawerTab } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'

const CRITICAL_ID = 'p07'

const STEPS: { label: string; id: string; tab: DrawerTab }[] = [
  { label: 'Paciente crítico: evaluación prioritaria', id: CRITICAL_ID, tab: 'resumen' },
  { label: 'Paciente 03: analizar tendencia', id: DEMO_PATIENT_ID, tab: 'vitales' },
  { label: 'Mostrar línea base y desviación', id: DEMO_PATIENT_ID, tab: 'baseline' },
  { label: 'Persistencia y anti-fatiga + SHAP', id: DEMO_PATIENT_ID, tab: 'explicabilidad' },
  { label: 'Comparar con NEWS2 y lead time', id: DEMO_PATIENT_ID, tab: 'comparacion' },
  { label: 'Horizonte y confianza', id: DEMO_PATIENT_ID, tab: 'resumen' },
  { label: 'Registrar evaluación clínica', id: DEMO_PATIENT_ID, tab: 'notas' },
]

export function DemoGuide() {
  const select = useAppStore((s) => s.selectPatient)
  return (
    <Card title={<span className="flex items-center gap-2"><Presentation size={15} className="text-accent" aria-hidden /> Guía de demostración</span>} subtitle="Recorrido sugerido para la exposición">
      <ol className="space-y-1.5">
        {STEPS.map((s, i) => (
          <li key={s.label}>
            <button onClick={() => select(s.id, s.tab)} className="group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[12.5px] hover:bg-surface-2">
              <span className="tabular grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent group-hover:bg-accent group-hover:text-white">{i + 1}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>
    </Card>
  )
}
