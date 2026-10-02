import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Signal } from '@/utils/waveforms'

interface Props {
  signal: Signal
  color: string
  height?: number
  /** Rango esperado de la señal [mín, máx] para escalar el trazo. */
  range: [number, number]
  label: string
  /** Píxeles por segundo del barrido. */
  speed?: number
}

/** Trazo continuo tipo monitor de cabecera: barrido de izquierda a derecha. */
export function Waveform({ signal, color, height = 84, range, label, speed = 120 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signalRef = useRef(signal)
  const reduce = useAppStore((s) => s.settings.reduceMotion)
  signalRef.current = signal

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const prefersStatic = reduce || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let raf = 0
    let x = 0
    let last = performance.now()
    let t = 0
    let prevY: number | null = null

    const yOf = (v: number) => {
      const pad = 8
      const norm = (v - range[0]) / (range[1] - range[0])
      return height - pad - norm * (height - pad * 2)
    }

    const style = () => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      style()
      x = 0
      prevY = null
      if (prefersStatic) drawStatic()
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      style()
      ctx.beginPath()
      for (let px = 0; px <= width; px++) {
        const y = yOf(signalRef.current(px / speed))
        if (px === 0) ctx.moveTo(px, y)
        else ctx.lineTo(px, y)
      }
      ctx.stroke()
    }

    let acc = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (document.hidden) {
        last = now
        return
      }
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      acc += dt * speed
      const steps = Math.floor(acc)
      if (steps < 1) return
      acc -= steps
      style()
      ctx.beginPath()
      // Continúa desde el último punto dibujado para que el trazo no tenga huecos.
      if (prevY !== null) ctx.moveTo(x, prevY)
      for (let i = 0; i < steps; i++) {
        x += 1
        t += 1 / speed
        if (x >= width) {
          // Fin del barrido: vuelve al borde izquierdo sin unir ambos extremos.
          ctx.stroke()
          ctx.beginPath()
          x = 0
          prevY = null
        }
        const y = yOf(signalRef.current(t))
        if (prevY === null) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        prevY = y
      }
      ctx.stroke()
      // Borra un tramo por delante del cursor para que se vea el barrido.
      ctx.clearRect(x + 2, 0, 16, height)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    if (!prefersStatic) raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [color, height, range, speed, reduce])

  // Con movimiento reducido, redibuja el trazo estático cuando cambia la señal.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !(reduce || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    const width = canvas.clientWidth
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.8
    ctx.beginPath()
    for (let px = 0; px <= width; px++) {
      const norm = (signal(px / speed) - range[0]) / (range[1] - range[0])
      const y = height - 8 - norm * (height - 16)
      if (px === 0) ctx.moveTo(px, y)
      else ctx.lineTo(px, y)
    }
    ctx.stroke()
  }, [signal, reduce, color, height, range, speed])

  return <canvas ref={canvasRef} role="img" aria-label={label} className="block w-full" style={{ height }} />
}
