import { useAppSelector } from '@sense/store'
import { Modal, ProgressBar, cn } from '@sense/ui'

/**
 * Blocking progress for the drafting run. It names the approved-language refs
 * being retrieved at each step — the point being that the narrative is
 * assembled from Sense content, and the numbers are computed, not drafted.
 */
export const GenerationOverlay = () => {
  const { running, steps, modeLabel } = useAppSelector((s) => s.generation)
  if (!running) return null

  const done = steps.filter((s) => s.state === 'done').length
  const pct = steps.length ? (done / steps.length) * 100 : 0

  return (
    <Modal open dismissible={false} size="md">
      <div className="mb-1.5 flex items-center gap-3">
        <span
          aria-hidden
          className="size-5 shrink-0 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600 dark:border-brand-950"
        />
        <h2 className="text-base font-extrabold tracking-tight text-ink">Generating draft report</h2>
        <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
          {modeLabel}
        </span>
      </div>
      <p className="mb-4 text-[11.5px] text-ink-3">
        Retrieving approved language for each selection, drafting narrative, computing costs.
      </p>

      <ol className="mb-4 flex flex-col gap-0.5">
        {steps.map((step, i) => (
          <li
            key={i}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2.5 py-2',
              step.state === 'active' && 'bg-subtle',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold',
                step.state === 'done'
                  ? 'bg-brand-600 text-white'
                  : step.state === 'active'
                    ? 'animate-softpulse bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200'
                    : 'bg-inset text-ink-3',
              )}
            >
              {step.state === 'done' ? '✓' : step.state === 'active' ? '●' : '○'}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">
              {step.label}
            </span>
            <span className="hidden shrink-0 font-mono text-[9.5px] text-ink-3 sm:block">{step.ref}</span>
          </li>
        ))}
      </ol>

      <ProgressBar value={pct} label="Draft generation progress" />
      <p className="mt-3 text-[11px] text-ink-3">
        Narrative is drafted only from Sense-approved language. Costs, quantities and photo placement
        are deterministic — never generated.
      </p>
    </Modal>
  )
}
