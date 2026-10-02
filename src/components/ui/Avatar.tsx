function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length > 2 ? parts.length - 2 : 1][0] : '')).toUpperCase()
}

export function Avatar({ name, hue, size = 40 }: { name: string; hue: number; size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 40) % 360} 60% 32%))`,
      }}
    >
      {initials(name)}
    </span>
  )
}
