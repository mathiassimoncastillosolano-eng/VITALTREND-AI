import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, Droplets, Brain } from 'lucide-react'
import { useFilteredPatients, useNowMin } from '@/hooks/useDerived'
import { PATIENT_TABS, getOrigin, patientHref } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import type { Patient, PatientAnalysis, PatientTab } from '@/types'
import { formatAgo, formatMinutes, sexLabel } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tooltip } from '@/components/ui/Tooltip'

function Neighbor({ patient, dir }: { patient: Patient | undefined; dir: 'prev' | 'next' }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight
  const label = dir === 'prev' ? 'Paciente anterior' : 'Paciente siguiente'
  const cls = 'grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-muted'
  if (!patient) return <span className={`${cls} opacity-40`} aria-hidden><Icon size={17} /></span>
  return (
    <Tooltip content={`${label}: ${patient.fullName}`} side="bottom">
      <a href={patientHref(patient.id)} aria-label={`${label}: ${patient.fullName}`} className={`${cls} hover:text-ink`}><Icon size={17} /></a>
    </Tooltip>
  )
}

export function PatientHeader({ patient, analysis, tab }: { patient: Patient; analysis: PatientAnalysis; tab: PatientTab }) {
  const list = useFilteredPatients()
  const all = useAppStore((s) => s.patients)
  const nowMin = useNowMin()
  const origin = getOrigin()

  // Se navega entre pacientes en el mismo orden de la lista de origen; si el paciente quedó fuera del filtro, se usa la lista completa.
  const { prev, next, position, count } = useMemo(() => {
    const idx = list.findIndex((p) => p.id === patient.id)
    const source = idx >= 0 ? list : all
    const i = idx >= 0 ? idx : all.findIndex((p) => p.id === patient.id)
    return { prev: source[i - 1], next: source[i + 1], position: i + 1, count: source.length }
  }, [list, all, patient.id])

  return (
    <header className="mb-6">
      <nav aria-label="Ruta de navegación" className="mb-3 flex items-center justify-between gap-3">
        <ol className="flex items-center gap-1.5 text-[12.5px] text-muted">
          <li><a href={`#/${origin}`} className="hover:text-ink hover:underline">{origin === 'dashboard' ? 'Pacientes monitorizados' : 'Pacientes'}</a></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate font-medium text-ink">{patient.fullName}</li>
        </ol>
        <div className="flex items-center gap-2">
          <span className="tabular hidden text-[12px] text-muted sm:inline">{position} de {count}</span>
          <Neighbor patient={prev} dir="prev" />
          <Neighbor patient={next} dir="next" />
        </div>
      </nav>

      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={patient.fullName} hue={patient.hue} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{patient.fullName}</h1>
            <span className={analysis.risk.level === 'critico' ? 'crit-pulse rounded-full' : ''}><StatusBadge level={analysis.risk.level} /></span>
          </div>
          <p className="mt-1 text-[13px] text-muted">
            {patient.code} · ID {patient.hospitalId} · {patient.age} años · {sexLabel(patient.sex)} · Habitación {patient.room} · Cama {patient.bed} · {patient.specialty}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            Ingreso hace {patient.admittedDays} {patient.admittedDays === 1 ? 'día' : 'días'}: {patient.admissionReason}
          </p>
        </div>
        <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12.5px]">
          <div><dt className="text-muted">Última lectura</dt><dd className="tabular font-semibold">{formatMinutes(patient.lastUpdateMin)} · {formatAgo(nowMin, patient.lastUpdateMin)}</dd></div>
          <div><dt className="flex items-center gap-1 text-muted"><Droplets size={12} aria-hidden /> Oxígeno</dt><dd className="font-semibold">{patient.onOxygen ? 'Suplementario' : 'Aire ambiente'}</dd></div>
          <div><dt className="flex items-center gap-1 text-muted"><Brain size={12} aria-hidden /> Conciencia</dt><dd className="font-semibold">{patient.consciousness === 'A' ? 'Alerta' : 'Alterada'}</dd></div>
        </dl>
      </div>

      <nav aria-label="Secciones del paciente" className="-mb-px mt-5 flex gap-1 overflow-x-auto border-b border-line">
        {PATIENT_TABS.map((t) => {
          const active = t.id === tab
          return (
            <a
              key={t.id}
              href={patientHref(patient.id, t.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium transition-colors ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}
            >
              {t.label}
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
