import type { ReactNode } from 'react'
import { cn } from './cn'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'info'
  | 'warn'
  | 'danger'
  | 'success'
  | 'good'
  | 'fair'
  | 'poor'
  | 'failed'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-inset text-ink-2',
  brand: 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200',
  info: 'bg-info-tint text-info',
  warn: 'bg-warn-tint text-warn',
  danger: 'bg-danger-tint text-danger',
  success: 'bg-success-tint text-success',
  good: 'bg-cond-good-tint text-cond-good',
  fair: 'bg-cond-fair-tint text-cond-fair',
  poor: 'bg-cond-poor-tint text-cond-poor',
  failed: 'bg-cond-failed-tint text-cond-failed',
}

export interface BadgeProps {
  tone?: BadgeTone
  /** Adds a filled dot — the secondary channel so the tone is never colour-alone. */
  dot?: boolean
  mono?: boolean
  className?: string
  children: ReactNode
}

export const Badge = ({ tone = 'neutral', dot = false, mono = false, className, children }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-none font-bold whitespace-nowrap',
      mono && 'font-mono text-[10px] tracking-wide',
      TONES[tone],
      className,
    )}
  >
    {dot ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
    {children}
  </span>
)
