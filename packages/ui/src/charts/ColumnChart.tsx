import { useEffect, useRef, useState } from 'react'
import { cn } from '../cn'

export interface ColumnDatum {
  label: string
  value: number
  /** Secondary line shown in the tooltip. */
  note?: string
}

export interface ColumnChartProps {
  data: ColumnDatum[]
  format: (v: number) => string
  /** Axis caption, e.g. "Year of expenditure". */
  xLabel?: string
  height?: number
  className?: string
  emptyLabel?: string
}

const PAD = { top: 16, right: 8, bottom: 26, left: 46 }

/**
 * Single-series columns over an ordered axis. One hue (magnitude, not
 * identity), a recessive gridline set, 4px rounded data-ends anchored to the
 * baseline, and a hover tooltip — no legend, since the title names the series.
 */
export const ColumnChart = ({
  data,
  format,
  xLabel,
  height = 200,
  className,
  emptyLabel = 'No expenditure in this period',
}: ColumnChartProps) => {
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(560)
  const max = Math.max(...data.map((d) => d.value), 1)
  const hasAny = data.some((d) => d.value > 0)

  /* The viewBox tracks the real pixel width so one unit is one pixel. Scaling
     a fixed viewBox would letterbox the plot and distort the tick labels. */
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width
      if (w && w > 0) setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = width
  const H = height
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const slot = plotW / Math.max(data.length, 1)
  // Thin marks: the column never fills its slot, leaving a clear gap between bars.
  const barW = Math.min(slot * 0.5, 34)

  /* Four gridlines is enough to read a value without crowding the plot. */
  const ticks = Array.from({ length: 4 }, (_, i) => (max / 3) * i)

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={xLabel}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t, i) => {
          const y = PAD.top + plotH - (t / max) * plotH
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--viz-grid)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="tnum"
                fill="var(--ink-3)"
                fontSize="9.5"
              >
                {format(t)}
              </text>
            </g>
          )
        })}

        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + plotH}
          y2={PAD.top + plotH}
          stroke="var(--viz-axis)"
          strokeWidth="1"
        />

        {data.map((d, i) => {
          const x = PAD.left + slot * i + (slot - barW) / 2
          const h = d.value > 0 ? Math.max((d.value / max) * plotH, 3) : 0
          const y = PAD.top + plotH - h
          const active = hover === i
          return (
            <g key={i}>
              {/* Hit target spans the whole slot so hovering is forgiving. */}
              <rect
                x={PAD.left + slot * i}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              {h > 0 ? (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx="4"
                  fill="var(--viz-1)"
                  opacity={hover === null || active ? 1 : 0.45}
                  className="transition-opacity duration-150"
                />
              ) : null}
              <text
                x={PAD.left + slot * i + slot / 2}
                y={H - 9}
                textAnchor="middle"
                fill={active ? 'var(--ink-1)' : 'var(--ink-3)'}
                fontSize="9.5"
                fontWeight={active ? 700 : 500}
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>

      {hover !== null && data[hover] ? (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-line bg-card px-2.5 py-1.5 shadow-e2"
          style={{
            left: `${((PAD.left + slot * hover + slot / 2) / W) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[11px] font-bold text-ink">{data[hover].label}</p>
          <p className="tnum text-[12px] font-extrabold text-ink">{format(data[hover].value)}</p>
          {data[hover].note ? <p className="text-[10px] text-ink-3">{data[hover].note}</p> : null}
        </div>
      ) : null}

      {!hasAny ? (
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[12px] text-ink-3">
          {emptyLabel}
        </p>
      ) : null}

      {xLabel ? <p className="mt-1 text-center text-[10.5px] text-ink-3">{xLabel}</p> : null}
    </div>
  )
}
