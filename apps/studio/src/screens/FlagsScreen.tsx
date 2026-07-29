import { Navigate, useNavigate } from 'react-router-dom'
import {
  generateDraft,
  selectActiveFlags,
  selectOffline,
  selectOverrides,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import { COMPONENTS, computeCostLine, money, photoCount } from '@sense/core'
import { Button, cn } from '@sense/ui'
import { useActiveInspection } from '../lib/useActiveInspection'
import { DeviceFrame } from './intake/DeviceFrame'

export const FlagsScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const inspection = useActiveInspection()
  const flags = useAppSelector(selectActiveFlags)
  const overrides = useAppSelector(selectOverrides)
  const offline = useAppSelector(selectOffline)

  if (!inspection) return <Navigate to="/" replace />

  const lines = COMPONENTS.map((c) => computeCostLine(overrides, c.id, inspection.data[c.id])).filter(
    (l): l is NonNullable<typeof l> => !!l,
  )
  const total = lines.reduce((n, l) => n + l.line, 0)

  return (
    <div className="animate-rise flex justify-center px-5 py-6 pb-14">
      <DeviceFrame title="SENSE FIELD · PRELIMINARY SUMMARY" className="max-w-[820px]">
        <div className="flex flex-1 flex-col p-8">
          <span
            aria-hidden
            className="mb-4 flex size-13 items-center justify-center rounded-2xl bg-brand-50 text-2xl font-extrabold text-brand-800 dark:bg-brand-950 dark:text-brand-200"
          >
            ✓
          </span>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Inspection complete</h1>
          <p className="mt-1 text-[13px] text-ink-2">
            {inspection.property.name} ·{' '}
            <span className="font-mono text-[11.5px]">{inspection.proj}</span>
          </p>
          <p className="tnum mt-2 mb-5 font-mono text-[11px] text-ink-3">
            {COMPONENTS.length} components · {photoCount(inspection)} photos · {lines.length} cost{' '}
            {lines.length === 1 ? 'line' : 'lines'} · {money(total)} identified
          </p>

          {flags?.red.length ? (
            <FlagGroup
              title="RED FLAGS — IMMEDIATE ATTENTION"
              tone="danger"
              items={flags.red}
            />
          ) : null}
          {flags?.yellow.length ? (
            <FlagGroup title="YELLOW FLAGS — WATCH ITEMS" tone="warn" items={flags.yellow} />
          ) : null}

          {flags?.clear.length ? (
            <p className="mb-5 text-[12px] text-ink-3">
              In serviceable condition: {flags.clear.join(', ')} — described in the narrative, no cost
              carried.
            </p>
          ) : null}

          <div className="flex-1" />

          <div className="flex flex-wrap gap-2.5">
            <Button size="lg" onClick={() => navigate('/')}>
              Back to dashboard
            </Button>
            <Button
              size="lg"
              variant="primary"
              className="flex-1"
              onClick={() => {
                void dispatch(generateDraft(inspection.id))
                navigate(`/inspection/${inspection.id}/review`)
              }}
            >
              Generate draft report →
            </Button>
          </div>
          <p className="mt-3 text-center text-[11px] text-ink-3">
            {offline
              ? 'Offline — the draft will be grounded in the cached approved-language library on this device.'
              : 'Draft generation takes about a minute. The manual baseline is roughly five business days.'}
          </p>
        </div>
      </DeviceFrame>
    </div>
  )
}

const FlagGroup = ({
  title,
  tone,
  items,
}: {
  title: string
  tone: 'danger' | 'warn'
  items: { id: string; title: string; sub: string }[]
}) => (
  <section
    className={cn(
      'mb-3 rounded-xl border p-4',
      tone === 'danger' ? 'border-danger/25 bg-danger-tint' : 'border-warn/25 bg-warn-tint',
    )}
  >
    <h2
      className={cn(
        'mb-2 text-[11px] font-extrabold tracking-[0.07em]',
        tone === 'danger' ? 'text-danger' : 'text-warn',
      )}
    >
      {title}
    </h2>
    <ul className="flex flex-col gap-1.5">
      {items.map((f) => (
        <li key={f.id} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span
            aria-hidden
            className={cn(
              'size-2 shrink-0 rounded-full',
              tone === 'danger' ? 'bg-danger' : 'bg-warn',
            )}
          />
          <span className="text-[13.5px] font-bold text-ink">{f.title}</span>
          <span className="text-[11.5px] text-ink-3">{f.sub}</span>
        </li>
      ))}
    </ul>
  </section>
)
