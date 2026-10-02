import { useMemo } from 'react'
import { Activity } from 'lucide-react'
import { VITAL_META } from '@/constants'
import type { Patient, PatientAnalysis, VitalKey } from '@/types'
import { formatSigned, formatVital } from '@/utils/format'
import { makeEcgSignal, makePlethSignal, makeRespSignal, rhythmLabel } from '@/utils/waveforms'
import { Waveform } from './Waveform'

const ECG_RANGE: [number, number] = [-0.35, 1.15]
const PLETH_RANGE: [number, number] = [-0.05, 1.15]
const RESP_RANGE: [number, number] = [-0.1, 1.1]

interface ChannelProps {
  label: string
  caption?: string
  color: string
  children: React.ReactNode
}

function Channel({ label, caption, color, children }: ChannelProps) {
  return (
    <div className="relative border-b border-white/5 last:border-0">
      <div className="absolute left-3 top-2 z-10 flex items-baseline gap-2 text-[11px] font-semibold" style={{ color }}>
        {label}
        {caption && <span className="font-normal opacity-80">{caption}</span>}
      </div>
      {children}
    </div>
  )
}

function Numeric({ vital, color, analysis, big = false }: { vital: VitalKey; color: string; analysis: PatientAnalysis; big?: boolean }) {
  const meta = VITAL_META[vital]
  const d = analysis.deviations[vital]
  const abnormal = d.severity !== 'normal'
  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between text-[11px] font-semibold" style={{ color }}>
        <span>{meta.short}</span>
        <span className="font-normal opacity-70">{meta.unit}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`tabular font-semibold leading-none ${big ? 'text-[44px]' : 'text-[34px]'}`} style={{ color }}>
          {formatVital(vital, d.current)}
        </span>
        <span className={`tabular text-[11.5px] ${abnormal ? 'text-[#ffb4bd]' : 'text-slate-400'}`}>
          {formatSigned(d.absolute, meta.decimals)} vs. base
        </span>
      </div>
    </div>
  )
}

/** Monitor multiparámetro: trazos en continuo y numéricos con su desviación respecto a la línea base. */
export function LiveMonitor({ patient, analysis }: { patient: Patient; analysis: PatientAnalysis }) {
  const { hr, rr } = analysis.current
  const irregular = patient.rhythm === 'irregular'
  const ecg = useMemo(() => makeEcgSignal(hr, irregular, patient.hue), [hr, irregular, patient.hue])
  const pleth = useMemo(() => makePlethSignal(hr), [hr])
  const resp = useMemo(() => makeRespSignal(rr), [rr])

  return (
    <section aria-label="Monitor multiparámetro" className="overflow-hidden rounded-2xl border border-[#1b2a47] bg-[#040913] text-slate-100 shadow-card">
      <div className="grid md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 border-b border-white/5 md:border-b-0 md:border-r">
          {patient.ecgMonitored ? (
            <Channel label="ECG · II" caption={rhythmLabel(hr, irregular)} color="#34d3aa">
              <Waveform signal={ecg} color="#34d3aa" range={ECG_RANGE} height={104} label={`ECG, ${rhythmLabel(hr, irregular)}, ${hr} latidos por minuto`} />
            </Channel>
          ) : (
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5 text-[11.5px] text-slate-400">
              <Activity size={13} aria-hidden /> Sin ECG continuo. La frecuencia cardíaca proviene del pulso.
            </div>
          )}
          <Channel label="Pletismografía" caption={`SpO₂ ${analysis.current.spo2} %`} color="#5bc8ff">
            <Waveform signal={pleth} color="#5bc8ff" range={PLETH_RANGE} height={76} label="Onda de pulso" />
          </Channel>
          <Channel label="Respiración" caption={`${rr} rpm`} color="#f3b84a">
            <Waveform signal={resp} color="#f3b84a" range={RESP_RANGE} height={56} label="Onda respiratoria" speed={60} />
          </Channel>
        </div>
        <div className="grid grid-cols-2 divide-white/5 md:grid-cols-1 md:divide-y">
          <Numeric vital="hr" color="#34d3aa" analysis={analysis} big />
          <Numeric vital="spo2" color="#5bc8ff" analysis={analysis} big />
          <Numeric vital="rr" color="#f3b84a" analysis={analysis} />
          <Numeric vital="sbp" color="#ff8a96" analysis={analysis} />
        </div>
      </div>
    </section>
  )
}
