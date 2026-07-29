import { cn } from './cn'

export interface ProgressBarProps {
  /** 0-100. */
  value: number
  label?: string
  size?: 'sm' | 'md'
  tone?: 'brand' | 'success' | 'warn'
  className?: string
}

const TONES = { brand: 'bg-brand-600', success: 'bg-success', warn: 'bg-warn' } as const

export const ProgressBar = ({
  value,
  label,
  size = 'md',
  tone = 'brand',
  className,
}: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-inset',
        size === 'sm' ? 'h-1' : 'h-1.5',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
