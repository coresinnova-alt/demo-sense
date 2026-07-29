import { cn } from './cn'

export interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  /** Hides the visible label but keeps it for assistive tech. */
  hideLabel?: boolean
  title?: string
  /** Colour of the "on" track; defaults to brand. */
  tone?: 'brand' | 'warn'
  className?: string
}

export const Toggle = ({
  checked,
  onChange,
  label,
  hideLabel = false,
  title,
  tone = 'brand',
  className,
}: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={hideLabel ? label : undefined}
    title={title}
    onClick={() => onChange(!checked)}
    className={cn('flex cursor-pointer items-center gap-2.5 p-1', className)}
  >
    {hideLabel ? null : <span className="text-[11.5px] font-semibold text-ink-2">{label}</span>}
    <span
      aria-hidden
      className={cn(
        'inline-flex h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-200',
        checked ? (tone === 'warn' ? 'bg-warn' : 'bg-brand-600') : 'bg-line-strong',
      )}
    >
      <span
        className={cn(
          'size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked && 'translate-x-4',
        )}
      />
    </span>
  </button>
)
