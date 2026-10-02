import { useEffect } from 'react'
import { motion } from 'motion/react'
import { UserX } from 'lucide-react'
import { navigate, getOrigin, useLocation } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import type { PatientTab } from '@/types'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { PatientHeader } from '@/components/patient/PatientHeader'
import { BaselineTab, ComparisonTab, EvaluationTab, EventsTab, ExplainTab, OverviewTab, VitalsTab, type TabProps } from '@/components/patient/tabs'

const VIEW: Record<PatientTab, (p: TabProps) => React.ReactNode> = {
  resumen: (p) => <OverviewTab {...p} />,
  vitales: (p) => <VitalsTab {...p} />,
  baseline: (p) => <BaselineTab {...p} />,
  explicabilidad: (p) => <ExplainTab {...p} />,
  comparacion: (p) => <ComparisonTab {...p} />,
  eventos: (p) => <EventsTab {...p} />,
  evaluacion: (p) => <EvaluationTab {...p} />,
}

export default function PatientDetail() {
  const { patientId, tab } = useLocation()
  const status = useAppStore((s) => s.status)
  const load = useAppStore((s) => s.load)
  const patient = useAppStore((s) => s.patients.find((p) => p.id === patientId))
  const analysis = useAppStore((s) => (patientId ? s.analyses[patientId] : undefined))
  const required = useAppStore((s) => s.settings.requiredWindows)
  const showBand = useAppStore((s) => s.settings.showBaselineBand)

  // Al abrir otro paciente se vuelve al inicio de la página.
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [patientId])

  useEffect(() => {
    if (patient) document.title = `${patient.fullName} · VitalTrend AI`
    return () => { document.title = 'VitalTrend AI' }
  }, [patient])

  if (status === 'error') return <ErrorState onRetry={() => void load()} />
  if (status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }
  if (!patient || !analysis) {
    return (
      <EmptyState
        icon={<UserX size={22} />}
        title="No se encontró el paciente"
        description="El enlace no corresponde a ningún paciente monitorizado."
        action={<Button variant="primary" onClick={() => navigate(getOrigin())}>Volver a pacientes</Button>}
      />
    )
  }

  return (
    <div>
      <PatientHeader patient={patient} analysis={analysis} tab={tab} />
      <motion.div key={`${patient.id}:${tab}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        {VIEW[tab]({ patient, analysis, required, showBand })}
      </motion.div>
      <Disclaimer />
    </div>
  )
}
