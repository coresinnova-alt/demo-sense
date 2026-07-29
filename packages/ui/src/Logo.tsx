import { cn } from './cn'

export interface LogoProps {
  size?: number
  className?: string
}

/**
 * The Sense mark: concentric rings radiating from a red dome. Drawn inline so
 * it inherits crispness at any size and works in both themes.
 */
export const LogoMark = ({ size = 30, className }: LogoProps) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={cn('shrink-0', className)}
    role="img"
    aria-label="Sense Engineering"
  >
    <rect width="64" height="64" rx="14" fill="var(--color-brand-700)" />
    <g fill="none" strokeLinecap="round">
      <ellipse cx="32" cy="35" rx="24" ry="12.5" stroke="var(--color-brand-400)" strokeWidth="3" opacity="0.55" />
      <ellipse cx="32" cy="33.5" rx="16.5" ry="8.5" stroke="var(--color-brand-300)" strokeWidth="3" opacity="0.8" />
      <ellipse cx="32" cy="32" rx="9" ry="4.5" stroke="var(--color-brand-200)" strokeWidth="3" />
    </g>
    <ellipse cx="32" cy="24" rx="7" ry="7" fill="var(--color-signal-500)" />
  </svg>
)

export const LogoLockup = ({
  size = 30,
  wordmark = 'Sense Report Studio',
  className,
}: LogoProps & { wordmark?: string }) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <LogoMark size={size} />
    <span className="text-sm font-extrabold tracking-tight text-ink">{wordmark}</span>
  </div>
)
