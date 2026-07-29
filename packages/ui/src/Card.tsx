import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `flat` drops the drop shadow for cards inside an already-elevated surface. */
  elevation?: 'flat' | 'raised' | 'floating'
}

export const Card = ({ elevation = 'raised', className, ...rest }: CardProps) => (
  <div
    className={cn(
      'rounded-card border border-line bg-card',
      elevation === 'raised' && 'shadow-e1',
      elevation === 'floating' && 'shadow-e2',
      className,
    )}
    {...rest}
  />
)

export interface CardHeaderProps {
  title: ReactNode
  /** Small monospace count or code shown beside the title. */
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

export const CardHeader = ({ title, eyebrow, description, actions, className }: CardHeaderProps) => (
  <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-5 py-3.5', className)}>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2.5">
        <h2 className="truncate text-sm font-bold text-ink">{title}</h2>
        {eyebrow ? (
          <span className="rounded-md bg-inset px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
            {eyebrow}
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-0.5 text-[11.5px] text-ink-3">{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
  </div>
)

export const CardBody = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...rest} />
)
