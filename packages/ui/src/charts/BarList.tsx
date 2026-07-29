import { cn } from '../cn'

export interface BarDatum {
  id: string
  label: string
  value: number
  /** Colour token for the mark; defaults to the sequential brand hue. */
  color?: string
  /** Optional secondary line under the label. */
  meta?: string
}

export interface BarListProps {
  data: BarDatum[]
  /** Formats the direct value label. */
  format: (v: number) => string
  /** Fixes the scale across re-renders; defaults to the largest value. */
  max?: number
  emptyLabel?: string
  className?: string
}

/**
 * Horizontal bars for comparing magnitude across a handful of named
 * categories. Single series, so no legend: the category names sit beside their
 * own marks and every bar is direct-labelled with its value.
 */
export const BarList = ({ data, format, max, emptyLabel = 'No data', className }: BarListProps) => {
  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1)
  if (!data.length || ceiling <= 0) {
    return <p className={cn('py-6 text-center text-[12px] text-ink-3', className)}>{emptyLabel}</p>
  }

  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {data.map((d) => {
        const pct = (d.value / ceiling) * 100
        return (
          <li key={d.id} className="group">
            <div className="mb-1.5 flex items-baseline gap-3">
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">
                {d.label}
              </span>
              {d.meta ? <span className="shrink-0 text-[10.5px] text-ink-3">{d.meta}</span> : null}
              <span className="tnum shrink-0 text-[12.5px] font-bold text-ink">{format(d.value)}</span>
            </div>
            {/* Track is a hairline wash so the mark, not the container, carries the ink. */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-inset">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.max(pct, 1.5)}%`,
                  background: d.color ?? 'var(--viz-1)',
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
