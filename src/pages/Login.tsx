import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { LogIn } from 'lucide-react'
import { DISCLAIMER } from '@/constants'
import { navigate } from '@/hooks/useRoute'
import { useAppStore } from '@/store/useAppStore'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'

const FIELD = 'mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export default function Login() {
  const signIn = useAppStore((s) => s.signIn)
  const [user, setUser] = useState('lparedes')
  const [pass, setPass] = useState('••••••••')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !pass) {
      setError('Ingresa tu usuario y contraseña.')
      return
    }
    signIn()
    navigate('dashboard')
  }

  return (
    <div className="bg-ambient relative grid min-h-full place-items-center overflow-hidden px-6 py-12">
      <svg className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-30" viewBox="0 0 1200 160" preserveAspectRatio="none" height="160" width="100%" aria-hidden>
        <motion.path d="M0 90 H300 l30 -60 40 110 40 -90 30 40 H620 l30 -50 40 100 40 -70 30 20 H1200" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
      </svg>
      <motion.main initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="glass relative w-full max-w-md rounded-3xl border border-line p-8 shadow-pop md:p-10">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-7 text-center text-[26px] font-bold leading-tight tracking-tight">Iniciar sesión</h1>
        <p className="mt-1.5 text-center text-[14px] text-muted">Monitorización y detección temprana del deterioro clínico.</p>
        <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
          <label className="block text-[13px] font-medium">
            Usuario
            <input value={user} onChange={(e) => { setUser(e.target.value); setError('') }} autoComplete="username" autoFocus className={FIELD} />
          </label>
          <label className="block text-[13px] font-medium">
            Contraseña
            <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError('') }} autoComplete="current-password" className={FIELD} />
          </label>
          {error && <p role="alert" className="text-[12.5px] font-medium text-crit">{error}</p>}
          <Button type="submit" variant="primary" className="w-full py-3 text-[14px]" icon={<LogIn size={17} />}>Ingresar</Button>
        </form>
        <p className="mt-7 border-t border-line pt-4 text-[11.5px] leading-snug text-muted">{DISCLAIMER}</p>
      </motion.main>
    </div>
  )
}
