export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`shimmer rounded-lg ${className}`} />
}

export function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-16" />
      <Skeleton className="mt-4 h-2 w-full" />
    </div>
  )
}

export function PatientCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
      <Skeleton className="mt-4 h-16 w-full" />
      <Skeleton className="mt-4 h-8 w-full" />
    </div>
  )
}

export function ChartSkeleton({ h = 'h-48' }: { h?: string }) {
  return <Skeleton className={`${h} w-full`} />
}

export function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-6" aria-busy>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <ChartSkeleton />
    </div>
  )
}
