export function Avatar({ code, hue, size = 40 }: { code: string; hue: number; size?: number }) {
  const n = code.replace(/\D/g, '')
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
      {n}
    </span>
  )
}
