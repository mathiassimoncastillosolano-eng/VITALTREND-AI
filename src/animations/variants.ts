import type { Transition, Variants } from 'motion/react'

export const EASE: Transition['ease'] = [0.22, 1, 0.36, 1]

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

export const staggerParent: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
}

export const drawerVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { duration: 0.34, ease: EASE } },
  exit: { x: '100%', transition: { duration: 0.24, ease: EASE } },
}

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: EASE } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.12 } },
}

export const alertEnter: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.18 } },
}
