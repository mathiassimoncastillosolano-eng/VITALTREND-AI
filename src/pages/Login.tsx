import { motion } from 'motion/react'
import { ArrowRight, Fingerprint, GitCompareArrows, LineChart, ScanSearch, ShieldCheck, UserRound } from 'lucide-react'
import { DISCLAIMER } from '@/constants'
import { navigate } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'

const PILLARS = [
  { icon: UserRound, label: 'Línea base individual' },
  { icon: LineChart, label: 'Tendencias temporales' },
  { icon: ScanSearch, label: 'Riesgo explicable' },
  { icon: ShieldCheck, label: 'Anti-fatiga de alarmas' },
  { icon: GitCompareArrows, label: 'Comparación con NEWS2' },
]

export default function Login() {
  const enter = useAppStore((s) => s.enterDemo)
  const go = () => {
    enter()
    navigate('dashboard')
  }
  return (
    <div className="bg-ambient relative grid min-h-full place-items-center overflow-hidden px-6 py-12">
      <svg className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-30" viewBox="0 0 1200 160" preserveAspectRatio="none" height="160" width="100%" aria-hidden>
        <motion.path d="M0 90 H300 l30 -60 40 110 40 -90 30 40 H620 l30 -50 40 100 40 -70 30 20 H1200" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
      </svg>
      <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="glass relative w-full max-w-xl rounded-3xl border border-line p-8 text-center shadow-pop md:p-10">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-8 text-[34px] font-bold leading-tight tracking-tight">VITALTREND <span className="text-accent">AI</span></h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">Sistema de apoyo a la detección temprana del deterioro clínico.</p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {PILLARS.map((p) => (
            <li key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/70 px-3 py-1 text-[12px] text-muted"><p.icon size={13} className="text-accent" aria-hidden /> {p.label}</li>
          ))}
        </ul>
        <Button variant="primary" className="mt-8 w-full py-3 text-[14px]" onClick={go} icon={<Fingerprint size={17} />} autoFocus>
          Ingresar a demostración <ArrowRight size={16} aria-hidden />
        </Button>
        <p className="mt-4 text-[12.5px] font-medium text-muted">Entorno académico · Datos simulados</p>
        <p className="mt-6 border-t border-line pt-4 text-[11.5px] leading-snug text-muted">{DISCLAIMER}</p>
      </motion.main>
    </div>
  )
}
