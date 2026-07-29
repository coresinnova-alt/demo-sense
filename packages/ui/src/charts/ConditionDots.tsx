import { cn } from '../cn'

export interface ConditionDot {
  id: string
  /** Component name, used for the tooltip. */
  label: string
  color: string
  /** Text label for the condition, so the dot is never colour-alone. */
  condition: string
}

/**
 * A compact per-component condition strip for dense table rows. The colour is
 * a glanceable summary; the tooltip carries the actual reading, and the table
 * legend spells the scale out.
 */
export const ConditionDots = ({ dots, className }: { dots: ConditionDot[]; className?: string }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {dots.map((d) => (
      <span
        key={d.id}
        title={`${d.label}: ${d.condition}`}
        aria-label={`${d.label}: ${d.condition}`}
        className="size-2.5 shrink-0 rounded-[3px]"
        style={{ background: d.color }}
      />
    ))}
  </div>
)
