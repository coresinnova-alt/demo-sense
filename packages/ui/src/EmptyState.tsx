import type { ReactNode } from 'react'
import { cn } from './cn'

export interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export const EmptyState = ({ title, description, action, icon, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
    {icon ? (
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-inset text-ink-3">
        {icon}
      </div>
    ) : null}
    <p className="text-sm font-bold text-ink">{title}</p>
    {description ? <p className="mt-1.5 max-w-sm text-[12.5px] text-ink-3">{description}</p> : null}
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
)
