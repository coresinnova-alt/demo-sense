import type { ReactNode } from 'react'
import { cn } from './cn'

export interface TabItem<T extends string> {
  id: T
  label: ReactNode
  /** Optional count or status pill shown after the label. */
  badge?: ReactNode
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  /** `pill` for toolbars, `underline` for page-level section switching. */
  variant?: 'pill' | 'underline'
  className?: string
  ariaLabel?: string
}

export const Tabs = <T extends string>({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
  ariaLabel,
}: TabsProps<T>) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className={cn('flex items-center gap-1', variant === 'underline' && 'border-b border-line', className)}
  >
    {items.map((item) => {
      const active = item.id === value
      return (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={active}
          onClick={() => onChange(item.id)}
          className={cn(
            'inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold transition-colors duration-150',
            variant === 'pill'
              ? cn(
                  'rounded-full px-3.5 py-2',
                  active ? 'bg-invert text-ink-invert' : 'text-ink-2 hover:bg-inset hover:text-ink',
                )
              : cn(
                  '-mb-px border-b-2 px-3 py-2.5',
                  active
                    ? 'border-brand-600 text-ink'
                    : 'border-transparent text-ink-3 hover:border-line-2 hover:text-ink-2',
                ),
          )}
        >
          {item.label}
          {item.badge}
        </button>
      )
    })}
  </div>
)
