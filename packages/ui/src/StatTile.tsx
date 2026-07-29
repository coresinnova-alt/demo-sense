import type { ReactNode } from 'react'
import { cn } from './cn'

export interface StatTileProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  /** Small trailing element, e.g. a sparkline or a badge. */
  aside?: ReactNode
  tone?: 'default' | 'warn' | 'danger' | 'success'
  className?: string
}

const TONES = {
  default: 'text-ink',
  warn: 'text-warn',
  danger: 'text-danger',
  success: 'text-success',
} as const

/**
 * A headline number. Deliberately not a chart: one value, its label, and the
 * context line that makes it mean something.
 */
export const StatTile = ({ label, value, sub, aside, tone = 'default', className }: StatTileProps) => (
  <div className={cn('rounded-card border border-line bg-card p-4 shadow-e1', className)}>
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[9.5px] font-semibold tracking-[0.09em] text-ink-3 uppercase">
          {label}
        </p>
        <p className={cn('mt-2 text-2xl leading-none font-extrabold tracking-tight', TONES[tone])}>
          {value}
        </p>
        {sub ? <p className="mt-1.5 text-[11px] text-ink-3">{sub}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  </div>
)
