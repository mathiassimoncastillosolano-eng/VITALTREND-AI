import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

export function useCountUp(target: number, duration = 0.8): number {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)
  const from = useRef(reduce ? target : 0)
  useEffect(() => {
    if (reduce) {
      setValue(target)
      from.current = target
      return
    }
    const controls = animate(from.current, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
      onComplete: () => {
        from.current = target
      },
    })
    return () => controls.stop()
  }, [target, duration, reduce])
  return value
}
