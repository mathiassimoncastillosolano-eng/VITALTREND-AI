import { useEffect } from 'react'
import { SIM_TICK_MS } from '@/constants'
import { useAppStore } from '@/store/useAppStore'

/** Reloj de la simulación en vivo: cada tick agrega una ventana de medición simulada. */
export function useSimulation() {
  const running = useAppStore((s) => s.sim.running)
  const speed = useAppStore((s) => s.sim.speed)
  const tick = useAppStore((s) => s.tick)
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(tick, SIM_TICK_MS / speed)
    return () => window.clearInterval(id)
  }, [running, speed, tick])
}
