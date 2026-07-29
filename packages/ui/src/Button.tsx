import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Rendered before the label; keep it to an icon or a single glyph. */
  leading?: ReactNode
  trailing?: ReactNode
  /** Shows a spinner and blocks interaction. */
  loading?: boolean
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-e1 disabled:bg-brand-600/40',
  secondary:
    'bg-card text-ink border border-line-2 hover:bg-subtle active:bg-inset disabled:text-ink-3',
  outline:
    'bg-transparent text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/50',
  ghost: 'bg-transparent text-ink-2 hover:bg-inset hover:text-ink',
  danger: 'bg-signal-600 text-white hover:bg-signal-700 active:bg-signal-800',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-[10px]',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    leading,
    trailing,
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-bold whitespace-nowrap transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner /> : leading}
      {children}
      {trailing}
    </button>
  )
})

const Spinner = () => (
  <span
    aria-hidden
    className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current"
  />
)
