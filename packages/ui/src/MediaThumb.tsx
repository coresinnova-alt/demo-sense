import { useMemo } from 'react'
import { cn } from './cn'

export type MediaKind = 'photo' | 'video' | 'audio'

export interface MediaThumbProps {
  kind: MediaKind
  name: string
  label: string
  /** Deterministic seed, so an asset always renders the same placeholder. */
  seed: number
  durationSec?: number
  transcript?: string
  offline?: boolean
  onRemove?: () => void
  onEdit?: () => void
  size?: 'sm' | 'md' | 'lg' | 'hero'
  /** Hides the filename strip where a figure caption already sits below. */
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

export const formatDuration = (sec?: number) => {
  if (!sec && sec !== 0) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Stand-in for a captured field asset. Photos and video render a deterministic
 * abstract "site scene"; audio renders a waveform. Real capture would swap the
 * SVG for an <img>/<video>/<audio> element — everything around it is unchanged.
 */
export const MediaThumb = ({
  kind,
  name,
  label,
  seed,
  durationSec,
  transcript,
  offline = false,
  onRemove,
  onEdit,
  size = 'md',
  showCaption = true,
  className,
}: MediaThumbProps) => {
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
    // Waveform bars for audio, biased toward the middle so it reads as speech.
    const bars = Array.from({ length: 40 }, (_, i) => {
      const envelope = Math.sin((i / 39) * Math.PI) * 0.7 + 0.3
      return Math.max(0.12, rand() * envelope)
    })
    return { hue, horizon, shapes, bars }
  }, [seed])

  return (
    <figure
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-inset',
        className,
      )}
    >
      {/* Overlays are scoped to this wrapper, not the whole figure, so the
          play badge and duration never land on top of the caption. */}
      <div className="relative">
      {kind === 'audio' ? (
        <div
          className={cn('flex items-center gap-0.5 bg-brand-50 px-2 dark:bg-brand-950', HEIGHTS[size])}
          aria-hidden
        >
          {scene.bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-full bg-brand-500/70"
              style={{ height: `${h * 70}%` }}
            />
          ))}
        </div>
      ) : (
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          aria-hidden
          className={cn('w-full', HEIGHTS[size])}
        >
          <defs>
            <linearGradient id={`sky-${kind}-${seed}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`hsl(${scene.hue} 45% 78%)`} />
              <stop offset="100%" stopColor={`hsl(${scene.hue} 30% 62%)`} />
            </linearGradient>
          </defs>
          <rect width="100" height="60" fill={`url(#sky-${kind}-${seed})`} />
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
      )}

      {/* Play affordance marks time-based media at a glance. */}
      {kind !== 'photo' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[rgb(20_24_28/0.62)] text-white"
        >
          <svg viewBox="0 0 16 16" className="ml-0.5 size-3" fill="currentColor">
            <path d="M4.5 3.2l8 4.8-8 4.8z" />
          </svg>
        </span>
      ) : null}

      <span className="absolute top-1.5 left-1.5 flex gap-1">
        <span className="rounded bg-[rgb(20_24_28/0.72)] px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wide text-white uppercase">
          {kind}
        </span>
        {offline ? (
          <span
            title="Captured offline — uploads on sync"
            className="rounded bg-warn px-1.5 py-0.5 font-mono text-[8px] font-bold text-white"
          >
            OFFLINE
          </span>
        ) : null}
      </span>

      {durationSec !== undefined ? (
        <span className="tnum absolute right-1.5 bottom-1.5 rounded bg-[rgb(20_24_28/0.72)] px-1.5 py-0.5 font-mono text-[8.5px] font-semibold text-white">
          {formatDuration(durationSec)}
        </span>
      ) : null}
      </div>

      {showCaption ? (
        <figcaption className="border-t border-line bg-card px-2 py-1.5">
          <p className="truncate font-mono text-[9px] text-ink-2">{name}</p>
          <p className="truncate text-[9.5px] text-ink-3">{label}</p>
          {/* A clamped transcript is unreadable in the smallest tile, where the
              caption already competes for room. */}
          {transcript && size !== 'sm' ? (
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-ink-3 italic">
              “{transcript}”
            </p>
          ) : null}
        </figcaption>
      ) : null}

      <span className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
            className="cursor-pointer rounded-md bg-[rgb(20_24_28/0.75)] p-1 text-white"
          >
            <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="cursor-pointer rounded-md bg-[rgb(20_24_28/0.75)] p-1 text-white"
          >
            <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </span>
    </figure>
  )
}
