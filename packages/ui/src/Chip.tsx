import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected?: boolean
  children: ReactNode
  /** Accent colour for the selected state; defaults to brand. */
  accent?: string
  accentTint?: string
}

/**
 * A large, thumb-friendly selectable option. The intake screen is used on a
 * tablet in the field, so the hit target never drops below 44px.
 */
export const Chip = ({
  selected = false,
  accent,
  accentTint,
  className,
  children,
  style,
  ...rest
}: ChipProps) => (
  <button
    type="button"
    aria-pressed={selected}
    style={
      selected && accent
        ? { borderColor: accent, background: accentTint, color: accent, ...style }
        : style
    }
    className={cn(
      'min-h-11 cursor-pointer rounded-control border px-4 py-2.5 text-[13.5px] font-semibold transition-all duration-150',
      selected && !accent
        ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
        : !selected &&
            'border-line-2 bg-card text-ink-2 hover:border-line-strong hover:bg-subtle',
      className,
    )}
    {...rest}
  >
    {children}
  </button>
)
