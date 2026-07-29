import { cn } from './cn'

export interface SkeletonProps {
  className?: string
  /** Rendered as a circle instead of a rounded rectangle. */
  circle?: boolean
}

export const Skeleton = ({ className, circle }: SkeletonProps) => (
  <div
    aria-hidden
    className={cn(
      'animate-shimmer bg-[length:200%_100%]',
      'bg-[linear-gradient(90deg,var(--srf-inset)_25%,var(--srf-subtle)_50%,var(--srf-inset)_75%)]',
      circle ? 'rounded-full' : 'rounded-lg',
      className,
    )}
  />
)

/** Placeholder rows for a table that has not loaded yet. */
export const SkeletonRows = ({ rows = 4, className }: { rows?: number; className?: string }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
)
