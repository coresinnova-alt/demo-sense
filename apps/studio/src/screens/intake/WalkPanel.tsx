import { useNavigate } from 'react-router-dom'
import {
  capturePhoto,
  inspectionActions,
  logAudit,
  recordChange,
  selectOffline,
  selectOverrides,
  uiActions,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import {
  BUCKET_SHORT,
  COMPONENTS,
  CONDITIONS,
  CONDITION_BY_ID,
  RECOMMENDATION_BY_ID,
  completionOf,
  computeCostLine,
  costEntry,
  money,
  needsCost,
  photoCount,
  rate,
} from '@sense/core'
import type { ConditionId, Inspection } from '@sense/core'
import { Badge, Button, Chip, Input, PhotoThumb, ProgressBar, Textarea, cn } from '@sense/ui'
import { CONDITION_COLOR, CONDITION_TINT } from '../../lib/conditionStyle'
import { useHotkeys } from '../../lib/useHotkeys'

export const WalkPanel = ({ inspection }: { inspection: Inspection }) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const overrides = useAppSelector(selectOverrides)
  const offline = useAppSelector(selectOffline)
  const compIdx = useAppSelector((s) => s.inspections.compIdx)

  const comp = COMPONENTS[Math.min(compIdx, COMPONENTS.length - 1)]
  const entry = inspection.data[comp.id]
  const progress = completionOf(inspection)
  const isLast = compIdx === COMPONENTS.length - 1
  const requiresCost = needsCost(entry)
  const ce = entry.type ? costEntry(overrides, comp.id, entry.type) : null
  const line = computeCostLine(overrides, comp.id, entry)
  const allowedRecs = entry.cond ? CONDITION_BY_ID[entry.cond].recs : []

  const id = inspection.id

  const goto = (index: number) => dispatch(inspectionActions.setCompIdx(index))

  const saveExit = () => {
    dispatch(recordChange(`Progress saved — ${inspection.property.name || 'New inspection'}`))
    dispatch(uiActions.pushToast('Saved — resume from the dashboard anytime', 'success'))
    navigate('/')
  }

  const next = () => {
    if (!isLast) {
      dispatch(recordChange(`Component saved — ${comp.label}`))
      goto(compIdx + 1)
      return
    }
    const missing = COMPONENTS.filter((c) => !inspection.data[c.id]?.done)
    if (missing.length) {
      dispatch(
        uiActions.pushToast(
          `Still incomplete: ${missing.map((c) => c.label).join(', ')}`,
          'warn',
        ),
      )
      return
    }
    dispatch(inspectionActions.setStatus({ id, status: 'ready' }))
    dispatch(
      logAudit(
        'Intake completed',
        `${inspection.proj} · ${COMPONENTS.length} components, ${photoCount(inspection)} photos`,
      ),
    )
    dispatch(recordChange(`Intake completed — ${inspection.property.name}`))
    navigate(`/inspection/${id}/flags`)
  }

  const setCondition = (cond: ConditionId) =>
    dispatch(
      inspectionActions.setCondition({
        id,
        compId: comp.id,
        cond,
        allowed: CONDITION_BY_ID[cond].recs,
      }),
    )

  useHotkeys({
    arrowleft: () => compIdx > 0 && goto(compIdx - 1),
    arrowright: () => !isLast && goto(compIdx + 1),
    '1': () => setCondition('good'),
    '2': () => setCondition('fair'),
    '3': () => setCondition('poor'),
    '4': () => setCondition('failed'),
    p: () => dispatch(capturePhoto(id, comp.id)),
    s: () => saveExit(),
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 pt-4 pb-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15.5px] font-extrabold tracking-tight text-ink">
            {inspection.property.name}
          </h2>
          <p className="truncate text-[11px] text-ink-3">{inspection.property.addr}</p>
        </div>
        <span className="tnum hidden font-mono text-[10.5px] text-ink-2 sm:block">
          {progress.done} of {progress.total} components complete
        </span>
        <Button size="sm" onClick={saveExit}>
          Save &amp; exit
        </Button>
      </div>

      <div className="shrink-0 px-5">
        <ProgressBar value={progress.pct} label="Intake progress" />
      </div>

      {/* Component stepper. Horizontal scroll keeps all eight reachable on a tablet. */}
      <div className="scrollbar-none flex shrink-0 gap-1.5 overflow-x-auto px-5 py-3">
        {COMPONENTS.map((c, i) => {
          const done = inspection.data[c.id]?.done
          const active = i === compIdx
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => goto(i)}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex min-w-[76px] flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-all duration-150',
                active
                  ? 'border-brand-500 bg-card shadow-e1'
                  : done
                    ? 'border-transparent bg-brand-50 dark:bg-brand-950'
                    : 'border-transparent hover:bg-inset',
              )}
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[10.5px] font-extrabold',
                  done
                    ? 'bg-brand-600 text-white'
                    : active
                      ? 'bg-invert text-ink-invert'
                      : 'bg-inset text-ink-3',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'text-[10.5px] font-bold whitespace-nowrap',
                  active ? 'text-ink' : done ? 'text-brand-800 dark:text-brand-200' : 'text-ink-3',
                )}
              >
                {c.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 px-5 pb-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-w-0 overflow-y-auto pr-1">
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-xl font-extrabold tracking-tight text-ink">{comp.label}</h3>
            <Badge tone="brand" mono>
              § {comp.secNo}
            </Badge>
          </div>
          <p className="mt-1 mb-4 text-[12px] text-ink-3">{comp.hint}</p>

          <SectionLabel label="Type" note="inspector selects" tone="info" />
          <div className="mb-5 flex flex-wrap gap-2">
            {comp.types.map((t) => (
              <Chip
                key={t}
                selected={entry.type === t}
                onClick={() => dispatch(inspectionActions.setType({ id, compId: comp.id, type: t }))}
              >
                {t}
              </Chip>
            ))}
          </div>

          <SectionLabel label="Condition" note="standard scale · keys 1-4" tone="info" />
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {CONDITIONS.map((c) => {
              const selected = entry.cond === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCondition(c.id)}
                  style={
                    selected
                      ? { borderColor: CONDITION_COLOR[c.id], background: CONDITION_TINT[c.id] }
                      : undefined
                  }
                  className={cn(
                    'flex min-h-11 cursor-pointer flex-col items-start gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150',
                    !selected && 'border-line-2 bg-card hover:border-line-strong hover:bg-subtle',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: CONDITION_COLOR[c.id] }}
                    />
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: selected ? CONDITION_COLOR[c.id] : undefined }}
                    >
                      {c.label}
                    </span>
                  </span>
                  <span className="text-[10.5px] text-ink-3">{c.meaning}</span>
                </button>
              )
            })}
          </div>

          {entry.cond ? (
            <>
              <SectionLabel
                label="Recommendation"
                note={`standard options for “${CONDITION_BY_ID[entry.cond].label}”`}
              />
              <div className="mb-5 flex flex-wrap gap-2">
                {allowedRecs.map((recId) => (
                  <Chip
                    key={recId}
                    selected={entry.rec === recId}
                    onClick={() =>
                      dispatch(inspectionActions.setRecommendation({ id, compId: comp.id, rec: recId }))
                    }
                  >
                    {RECOMMENDATION_BY_ID[recId].label}
                  </Chip>
                ))}
              </div>
            </>
          ) : null}

          {requiresCost && entry.type ? (
            <div className="mb-5 rounded-xl border border-line bg-subtle p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold text-ink-2">Cost line</span>
                <Badge tone="info">entered</Badge>
                <Badge tone="warn">looked up</Badge>
                <Badge tone="success">calculated</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Input
                  label={`Quantity (${comp.unit})`}
                  inputMode="numeric"
                  placeholder="0"
                  value={entry.qty ? entry.qty.toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '')
                    dispatch(
                      inspectionActions.setQuantity({
                        id,
                        compId: comp.id,
                        qty: raw ? Number.parseInt(raw, 10) : null,
                      }),
                    )
                  }}
                  className="[&_input]:text-[15px] [&_input]:font-bold"
                />
                <ReadOut
                  label="Unit cost — RSMeans-style"
                  value={ce ? rate(ce.cost, comp.unit) : '—'}
                  tone="warn"
                />
                <ReadOut
                  label="Line cost = qty × unit"
                  value={line ? money(line.line) : '—'}
                  tone="success"
                />
                <ReadOut
                  label="Replacement year"
                  value={
                    entry.rec && RECOMMENDATION_BY_ID[entry.rec].year
                      ? `Yr ${RECOMMENDATION_BY_ID[entry.rec].year} · ${
                          BUCKET_SHORT[RECOMMENDATION_BY_ID[entry.rec].bucket!]
                        }`
                      : '—'
                  }
                  tone="success"
                />
              </div>
              <p className="mt-2.5 text-[10.5px] text-ink-3">
                Numbers are looked up and computed — never generated. Source: seeded cost book (Admin
                → Cost book).
              </p>
            </div>
          ) : null}

          <SectionLabel label="Observed conditions" note="approved bullets" tone="brand" />
          <div className="mb-5 flex flex-wrap gap-2">
            {comp.observations.map((o) => {
              const selected = entry.obs.includes(o.key)
              return (
                <Chip
                  key={o.key}
                  selected={selected}
                  title={o.sentence}
                  onClick={() =>
                    dispatch(inspectionActions.toggleObservation({ id, compId: comp.id, key: o.key }))
                  }
                >
                  {selected ? '✓ ' : ''}
                  {o.label}
                </Chip>
              )
            })}
          </div>

          <Textarea
            label="Field note (optional)"
            hint="Kept with the record for the reviewer; it is not inserted into the narrative."
            rows={2}
            value={entry.note ?? ''}
            onChange={(e) =>
              dispatch(inspectionActions.setNote({ id, compId: comp.id, note: e.target.value }))
            }
          />
        </div>

        <aside className="flex min-h-0 min-w-0 flex-col rounded-xl border border-line bg-card p-3.5">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="text-[12.5px] font-bold text-ink">Photos</h4>
            <span className="rounded bg-inset px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
              {entry.photos.length}
            </span>
          </div>
          <p className="mb-3 text-[10.5px] text-ink-3">
            {offline
              ? 'Stored on device — uploads when back online'
              : `Auto-tagged to ${comp.secNo} ${comp.reportTitle}`}
          </p>

          <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto">
            {entry.photos.map((ph) => (
              <PhotoThumb
                key={ph.id}
                name={ph.name}
                label={ph.label}
                seed={ph.seed}
                size="sm"
                offline={ph.capturedOffline}
                onRemove={() =>
                  dispatch(inspectionActions.removePhoto({ id, compId: comp.id, photoId: ph.id }))
                }
              />
            ))}
          </div>

          <Button
            variant="outline"
            fullWidth
            className="mt-3 min-h-12 border-dashed"
            onClick={() => dispatch(capturePhoto(id, comp.id))}
          >
            + Capture photo
          </Button>
        </aside>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-t border-line bg-card px-5 py-3">
        <Button onClick={() => goto(compIdx - 1)} disabled={compIdx === 0}>
          ← Back
        </Button>
        <div className="flex-1 text-center">
          <p className="tnum font-mono text-[10.5px] text-ink-3">
            Component {compIdx + 1} of {COMPONENTS.length}
          </p>
          {isLast && progress.done < progress.total ? (
            <p className="mt-0.5 text-[11px] font-semibold text-warn">
              Incomplete:{' '}
              {COMPONENTS.filter((c) => !inspection.data[c.id]?.done)
                .map((c) => c.label)
                .join(', ')}
            </p>
          ) : null}
        </div>
        <Button variant="primary" onClick={next}>
          {isLast ? 'Finish inspection ✓' : `Next: ${COMPONENTS[compIdx + 1].label} →`}
        </Button>
      </div>
    </div>
  )
}

const SectionLabel = ({
  label,
  note,
  tone = 'neutral',
}: {
  label: string
  note?: string
  tone?: 'neutral' | 'info' | 'brand'
}) => (
  <div className="mb-2 flex items-center gap-2">
    <span className="text-[12px] font-bold text-ink-2">{label}</span>
    {note ? (
      <Badge tone={tone === 'neutral' ? 'neutral' : tone}>{note}</Badge>
    ) : null}
  </div>
)

const ReadOut = ({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'warn' | 'success'
}) => (
  <div>
    <p
      className={cn(
        'mb-1.5 text-[10.5px] font-semibold',
        tone === 'warn' ? 'text-warn' : 'text-success',
      )}
    >
      {label}
    </p>
    <p
      className={cn(
        'tnum rounded-control border border-dashed px-3 py-2.5 text-[14px] font-bold',
        tone === 'warn' ? 'border-warn/40 bg-warn-tint text-warn' : 'border-success/40 bg-success-tint text-success',
      )}
    >
      {value}
    </p>
  </div>
)
