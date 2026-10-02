import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FlaskConical, Pause, Play, RotateCcw, X } from 'lucide-react'
import { DEMO_PATIENT_ID, SCENARIO_META, SIM_SPEEDS } from '@/constants'
import { useAppStore } from '@/store/useAppStore'
import type { ScenarioKey } from '@/types'
import { formatMinutes, windowMinutes } from '@/utils/format'
import { Button } from '@/components/ui/Button'

export function SimulationPanel() {
  const [open, setOpen] = useState(false)
  const sim = useAppStore((s) => s.sim)
  const toggle = useAppStore((s) => s.toggleSim)
  const setSpeed = useAppStore((s) => s.setSpeed)
  const setScenario = useAppStore((s) => s.setScenario)
  const reset = useAppStore((s) => s.resetSim)
  const demo = useAppStore((s) => s.patients.find((p) => p.id === DEMO_PATIENT_ID))
  const clock = demo ? formatMinutes(windowMinutes(demo.history[demo.history.length - 1].t)) : '--:--'

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-4 md:left-auto md:right-4 md:z-30">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.section key="panel" initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }} aria-label="Panel de simulación" className="glass w-[300px] rounded-2xl border border-line p-4 shadow-pop">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[13.5px] font-semibold"><FlaskConical size={15} className="text-accent" aria-hidden /> Simulación</h3>
              <button onClick={() => setOpen(false)} aria-label="Cerrar panel de simulación" className="rounded-md p-1 text-muted hover:text-ink"><X size={15} /></button>
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted">Reloj simulado <b className="tabular text-ink">{clock}</b> · cada tick = 1 ventana horaria</p>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" size="sm" className="flex-1" icon={sim.running ? <Pause size={13} /> : <Play size={13} />} onClick={toggle}>{sim.running ? 'Pausar' : 'Iniciar simulación'}</Button>
              <Button size="sm" icon={<RotateCcw size={13} />} onClick={reset} aria-label="Reiniciar simulación">Reiniciar</Button>
            </div>
            <div className="mt-3">
              <div className="mb-1 text-[11.5px] font-medium text-muted">Velocidad</div>
              <div className="flex gap-1 rounded-lg bg-surface-2 p-1" role="radiogroup" aria-label="Velocidad">
                {SIM_SPEEDS.map((s) => (
                  <button key={s} role="radio" aria-checked={sim.speed === s} onClick={() => setSpeed(s)} className={`flex-1 rounded-md py-1 text-[12px] font-medium ${sim.speed === s ? 'bg-surface text-ink shadow-card' : 'text-muted'}`}>{s}x</button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <div className="mb-1 text-[11.5px] font-medium text-muted">Escenario · {demo?.code ?? 'Paciente 03'}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(SCENARIO_META) as ScenarioKey[]).map((k) => (
                  <button key={k} onClick={() => setScenario(k)} aria-pressed={sim.scenario === k} title={SCENARIO_META[k].description} className={`rounded-lg border px-2 py-1.5 text-[12px] font-medium transition ${sim.scenario === k ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted hover:text-ink'}`}>{SCENARIO_META[k].label}</button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">{SCENARIO_META[sim.scenario].description}</p>
            </div>
          </motion.section>
        ) : (
          <motion.button key="pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(true)} className="glass flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[12.5px] font-medium shadow-pop hover:border-accent/50">
            <FlaskConical size={14} className="text-accent" aria-hidden /> Simulación
            <span className={`h-2 w-2 rounded-full ${sim.running ? 'animate-pulse bg-ok' : 'bg-muted'}`} aria-label={sim.running ? 'En ejecución' : 'Detenida'} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
