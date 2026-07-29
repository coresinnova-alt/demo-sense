import { useMemo } from 'react'
import { cn } from './cn'

export interface PhotoThumbProps {
  name: string
  label: string
  /** Deterministic seed, so a photo always renders the same placeholder. */
  seed: number
  offline?: boolean
  onRemove?: () => void
  size?: 'sm' | 'md' | 'lg' | 'hero'
  /** Hides the filename strip — used where a figure caption already sits below. */
  showCaption?: boolean
  className?: string
}

const HEIGHTS = { sm: 'h-14', md: 'h-20', lg: 'h-24', hero: 'h-60' } as const

/* A tiny deterministic PRNG so the same seed always draws the same scene. */
const rng = (seed: number) => {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/**
 * Stand-in for a real field photograph. Rather than a grey box, it renders a
 * deterministic abstract "site photo" so dense report layouts read correctly
 * at review time.
 */
export const PhotoThumb = ({
  name,
  label,
  seed,
  offline = false,
  onRemove,
  size = 'md',
  showCaption = true,
  className,
}: PhotoThumbProps) => {
  const scene = useMemo(() => {
    const rand = rng(seed)
    const hue = 190 + rand() * 40
    // Kept below the 60-unit viewBox height so the ground band never inverts.
    const horizon = 38 + rand() * 14
    const shapes = Array.from({ length: 4 }, () => ({
      x: rand() * 100,
      w: 10 + rand() * 26,
      h: 12 + rand() * 30,
      o: 0.15 + rand() * 0.3,
    }))
    return { hue, horizon, shapes }
  }, [seed])

  return (
    <figure
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-inset',
        className,
      )}
    >
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden
        className={cn('w-full', HEIGHTS[size])}
      >
        <defs>
          <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${scene.hue} 45% 78%)`} />
            <stop offset="100%" stopColor={`hsl(${scene.hue} 30% 62%)`} />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill={`url(#sky-${seed})`} />
        {scene.shapes.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={scene.horizon - s.h}
            width={s.w}
            height={s.h}
            fill="#2b3138"
            opacity={s.o}
          />
        ))}
        <rect y={scene.horizon} width="100" height={60 - scene.horizon} fill="#4a5058" opacity="0.55" />
      </svg>

      {showCaption ? (
        <figcaption className="border-t border-line bg-card px-2 py-1.5">
          <p className="truncate font-mono text-[9px] text-ink-2">{name}</p>
          <p className="truncate text-[9.5px] text-ink-3">{label}</p>
        </figcaption>
      ) : null}

      {offline ? (
        <span
          title="Captured offline — uploads on sync"
          className="absolute top-1.5 left-1.5 rounded bg-warn px-1.5 py-0.5 font-mono text-[8px] font-bold text-white"
        >
          OFFLINE
        </span>
      ) : null}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="absolute top-1.5 right-1.5 cursor-pointer rounded-md bg-[rgb(20_24_28/0.75)] p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </figure>
  )
}
