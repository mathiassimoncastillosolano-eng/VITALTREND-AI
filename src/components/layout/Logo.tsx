export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden role="img">
      <defs>
        <linearGradient id="vt-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b93ff" />
          <stop offset="1" stopColor="#34d3aa" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="var(--c-surface-2)" stroke="var(--c-line)" />
      <path d="M4.5 18h4.6l2.7-7.5 4.7 14 3-8.5 1.6 2H27.5" fill="none" stroke="url(#vt-g)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.5 8.5h4.5V13" fill="none" stroke="var(--c-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight">VitalTrend <span className="text-accent">AI</span></div>
          <div className="text-[10.5px] text-muted">Detección temprana del deterioro clínico</div>
        </div>
      )}
    </div>
  )
}
