import { useState } from 'react'
import { cn } from '../cn'

export interface StackSegment {
  id: string
  label: string
  value: number
  color: string
}

export interface StackedBarProps {
  segments: StackSegment[]
  format?: (v: number) => string
  /** Text used for the accessible summary and the table caption. */
  caption?: string
  className?: string
}

/**
 * A single 100% stacked bar. Segments are separated by a 2px surface gap so
 * adjacent fills never touch, a legend is always present, and a table view is
 * available — identity is never carried by colour alone.
 */
export const StackedBar = ({
  segments,
  format = (v) => String(v),
  caption,
  className,
}: StackedBarProps) => {
  const [showTable, setShowTable] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const total = segments.reduce((n, s) => n + s.value, 0)

  if (total <= 0) {
    return <p className={cn('py-6 text-center text-[12px] text-ink-3', className)}>Nothing assessed yet</p>
  }

  return (
    <div className={className}>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={caption}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              title={`${s.label}: ${format(s.value)}`}
              className="h-full min-w-1 rounded-full transition-opacity duration-150"
              style={{
                flexGrow: s.value,
                background: s.color,
                opacity: hovered && hovered !== s.id ? 0.45 : 1,
              }}
            />
          ))}
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <li
            key={s.id}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1.5"
          >
            <span aria-hidden className="size-2 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="text-[11px] font-semibold text-ink-2">{s.label}</span>
            <span className="tnum text-[11px] text-ink-3">{format(s.value)}</span>
          </li>
        ))}
        <li className="ml-auto">
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="cursor-pointer text-[10.5px] font-semibold text-ink-3 underline underline-offset-2 hover:text-ink"
          >
            {showTable ? 'Hide table' : 'Table view'}
          </button>
        </li>
      </ul>

      {showTable ? (
        <table className="mt-3 w-full border-collapse text-left">
          {caption ? <caption className="pb-2 text-left text-[11px] text-ink-3">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-line">
              <th className="py-1.5 font-mono text-[9.5px] font-semibold tracking-wide text-ink-3 uppercase">
                Category
              </th>
              <th className="py-1.5 text-right font-mono text-[9.5px] font-semibold tracking-wide text-ink-3 uppercase">
                Value
              </th>
              <th className="py-1.5 text-right font-mono text-[9.5px] font-semibold tracking-wide text-ink-3 uppercase">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="py-1.5 text-[12px] text-ink">{s.label}</td>
                <td className="tnum py-1.5 text-right text-[12px] text-ink">{format(s.value)}</td>
                <td className="tnum py-1.5 text-right text-[12px] text-ink-2">
                  {Math.round((s.value / total) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
