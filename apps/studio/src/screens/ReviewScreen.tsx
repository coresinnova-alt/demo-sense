import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  approveReport,
  ensureDraft,
  generateDraft,
  inspectionActions,
  recordChange,
  selectActiveReportModel,
  selectAllSectionsApproved,
  selectOverrides,
  uiActions,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import {
  BUCKET_SHORT,
  COMPONENTS,
  CONDITION_LANGUAGE,
  CONDITION_BY_ID,
  DESCRIPTIONS,
  RECOMMENDATION_LANGUAGE,
  STATUS_LABEL,
  computeCostLine,
  condRef,
  descRef,
  duration,
  money,
  obsRef,
  recRef,
} from '@sense/core'
import type { ComponentId, DraftField } from '@sense/core'
import { Badge, Button, Card, CardHeader, PhotoThumb, Textarea, cn } from '@sense/ui'
import { BUCKET_TONE, CONDITION_TONE } from '../lib/conditionStyle'
import { useActiveInspection } from '../lib/useActiveInspection'
import { useHotkeys } from '../lib/useHotkeys'

const FIELD_DEFS: { key: DraftField; label: string; rows: number }[] = [
  { key: 'desc', label: 'Type & description', rows: 2 },
  { key: 'cond', label: 'Condition & age notes', rows: 2 },
  { key: 'concerns', label: 'Concerns — one per line', rows: 4 },
  { key: 'rec', label: 'Recommendation', rows: 3 },
]

export const ReviewScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const inspection = useActiveInspection()
  const model = useAppSelector(selectActiveReportModel)
  const overrides = useAppSelector(selectOverrides)
  const allApproved = useAppSelector(selectAllSectionsApproved)
  const compIdx = useAppSelector((s) => s.inspections.compIdx)
  const [openRef, setOpenRef] = useState<string | null>(null)

  /* A record opened straight from a deep link may not have a draft yet. */
  useEffect(() => {
    if (inspection && !inspection.draft) dispatch(ensureDraft(inspection.id))
  }, [dispatch, inspection])

  const drafted = COMPONENTS.filter((c) => inspection?.draft?.comps[c.id])
  const activeComp = drafted[Math.min(compIdx, Math.max(drafted.length - 1, 0))] ?? drafted[0]

  useHotkeys({
    arrowup: () => dispatch(inspectionActions.setCompIdx(Math.max(compIdx - 1, 0))),
    arrowdown: () => dispatch(inspectionActions.setCompIdx(Math.min(compIdx + 1, drafted.length - 1))),
    a: () => {
      if (activeComp && inspection) {
        dispatch(
          inspectionActions.toggleSectionApproval({ id: inspection.id, compId: activeComp.id }),
        )
      }
    },
  })

  if (!inspection) return <Navigate to="/" replace />
  if (!inspection.draft || !activeComp || !model) {
    return (
      <div className="px-6 py-16 text-center text-[13px] text-ink-3">Preparing the draft…</div>
    )
  }

  const draftComp = inspection.draft.comps[activeComp.id]!
  const entry = inspection.data[activeComp.id]
  const line = computeCostLine(overrides, activeComp.id, entry)

  /* Provenance: the approved snippet behind each generated field. */
  const sources: Record<DraftField, { ref: string; text: string }> = {
    desc: {
      ref: descRef(activeComp.id, entry.type),
      text: DESCRIPTIONS[`${activeComp.id}|${entry.type}`] ?? '—',
    },
    cond: {
      ref: condRef(entry.cond),
      text: entry.cond ? CONDITION_LANGUAGE[entry.cond] : '—',
    },
    concerns: {
      ref: obsRef(activeComp.id, entry.obs.length),
      text:
        entry.obs
          .map((k) => `• ${activeComp.observations.find((o) => o.key === k)?.sentence ?? k}`)
          .join('\n') || '—',
    },
    rec: {
      ref: recRef(entry.rec),
      text: entry.rec ? RECOMMENDATION_LANGUAGE[entry.rec] : '—',
    },
  }

  const edit = (field: DraftField, value: string) => {
    dispatch(inspectionActions.editDraftField({ id: inspection.id, compId: activeComp.id, field, value }))
    dispatch(recordChange(`Edit saved — ${activeComp.secNo}`))
  }

  const pickSection = (compId: ComponentId) => {
    const idx = drafted.findIndex((c) => c.id === compId)
    dispatch(inspectionActions.setCompIdx(idx))
    setOpenRef(null)
  }

  const finalize = () => {
    if (!allApproved) {
      dispatch(uiActions.pushToast('Approve every section before finalizing', 'warn'))
      return
    }
    dispatch(approveReport(inspection.id))
    navigate(`/inspection/${inspection.id}/report`)
  }

  const totals = [
    model.imm.length > 0 && { label: 'Immediate needs', value: money(model.immTotal) },
    model.short.length > 0 && { label: 'Short-term (1-2 yrs)', value: money(model.shortTotal) },
    model.cap.length > 0 && { label: 'Capital plan (3-10 yrs)', value: money(model.capTotal) },
    { label: '10-yr reserves (uninflated)', value: money(model.reservesTotal) },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="animate-rise mx-auto max-w-[1300px] px-6 py-6 pb-16">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => navigate('/')}>
          ← Dashboard
        </Button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[17px] font-extrabold tracking-tight text-ink">
              {inspection.property.name}
            </h1>
            <Badge tone="warn" dot>
              {STATUS_LABEL[inspection.status]}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] text-ink-3">{inspection.proj}</span>
            <Badge tone="brand" mono>
              grounded retrieval · drafted in {duration(inspection.draft.genMs)}
            </Badge>
          </div>
        </div>
        <div className="flex-1" />
        <Button size="sm" onClick={() => void dispatch(generateDraft(inspection.id))}>
          ↻ Regenerate
        </Button>
        <Button size="sm" onClick={() => navigate(`/inspection/${inspection.id}/report`)}>
          Report preview
        </Button>
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" variant="primary" disabled={!allApproved} onClick={finalize}>
            Approve report ✓
          </Button>
          <span className="text-[10px] text-ink-3">
            {allApproved
              ? 'All sections approved — ready to finalize'
              : `Approve all ${drafted.length} sections to finalize`}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
        <nav className="lg:sticky lg:top-4 lg:self-start" aria-label="Report sections">
          <div className="flex flex-col gap-1 rounded-card border border-line bg-inset p-2">
            <p className="px-2.5 pt-1.5 pb-1 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
              Report sections
            </p>
            {drafted.map((c) => {
              const dc = inspection.draft!.comps[c.id]!
              const active = c.id === activeComp.id
              const edited = Object.keys(dc.edited).length > 0
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickSection(c.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-150',
                    active ? 'border-brand-500 bg-card shadow-e1' : 'border-transparent hover:bg-subtle',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6.5 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-semibold',
                      dc.approved ? 'bg-brand-600 text-white' : 'bg-card text-ink-2',
                    )}
                  >
                    {c.mono}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-ink">
                      {c.secNo} {c.label}
                    </span>
                    <span
                      className={cn(
                        'block text-[10.5px] font-semibold',
                        dc.approved ? 'text-success' : edited ? 'text-warn' : 'text-ink-3',
                      )}
                    >
                      {dc.approved ? 'Approved ✓' : edited ? 'Edited — re-approve' : 'Ready for review'}
                    </span>
                  </span>
                </button>
              )
            })}
            <p className="border-t border-line-2 px-2.5 pt-2.5 pb-1 text-[10.5px] text-ink-3">
              Every line is editable and traceable to an approved source. Approve each section, then
              the report.
            </p>
          </div>
        </nav>

        <div className="min-w-0">
          <Card className="mb-4">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
              <Badge tone="brand" mono>
                {activeComp.secNo}
              </Badge>
              <h2 className="text-base font-extrabold tracking-tight text-ink">
                {activeComp.reportTitle}
              </h2>
              {entry.cond ? (
                <Badge tone={CONDITION_TONE[entry.cond]} dot>
                  {CONDITION_BY_ID[entry.cond].label}
                </Badge>
              ) : null}
              <Badge tone={line ? BUCKET_TONE[line.bucket] : 'neutral'} mono>
                {line ? `${money(line.line)} · ${BUCKET_SHORT[line.bucket]}` : 'No cost carried'}
              </Badge>
              <span className="flex-1" />
              <Button
                size="sm"
                variant={draftComp.approved ? 'primary' : 'outline'}
                onClick={() => {
                  dispatch(
                    inspectionActions.toggleSectionApproval({
                      id: inspection.id,
                      compId: activeComp.id,
                    }),
                  )
                  if (!draftComp.approved) {
                    dispatch(recordChange(`Section approved — ${activeComp.secNo}`))
                  }
                }}
              >
                {draftComp.approved ? '✓ Section approved' : 'Approve section'}
              </Button>
            </div>

            <div className="flex flex-col gap-3.5 p-5">
              {FIELD_DEFS.map((f) => {
                const source = sources[f.key]
                const refKey = `${activeComp.id}|${f.key}`
                const value = f.key === 'concerns' ? draftComp.concerns.join('\n') : draftComp[f.key]
                return (
                  <div key={f.key}>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11.5px] font-bold text-ink-2">{f.label}</span>
                      <button
                        type="button"
                        title="Show the approved source snippet"
                        onClick={() => setOpenRef(openRef === refKey ? null : refKey)}
                        className="cursor-pointer rounded bg-brand-50 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-brand-800 transition-colors hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-200 dark:hover:bg-brand-900"
                      >
                        ⌁ {source.ref}
                      </button>
                      {draftComp.edited[f.key] ? <Badge tone="warn">edited</Badge> : null}
                    </div>
                    <Textarea
                      rows={f.rows}
                      value={value}
                      onChange={(e) => edit(f.key, e.target.value)}
                      aria-label={f.label}
                    />
                    {openRef === refKey ? (
                      <div className="mt-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 dark:border-brand-800 dark:bg-brand-950">
                        <p className="mb-1 font-mono text-[9.5px] font-semibold text-brand-800 dark:text-brand-200">
                          APPROVED SOURCE · {source.ref} · retrieval-grounded
                        </p>
                        <p className="text-[12px] leading-relaxed whitespace-pre-line text-ink-2">
                          {source.text}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-[11.5px] font-bold text-ink-2">Photos</span>
                <span className="rounded bg-inset px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
                  {entry.photos.length}
                </span>
                <span className="text-[10.5px] text-ink-3">
                  auto-placed in this section at capture
                </span>
              </div>
              {entry.photos.length ? (
                <div className="flex flex-wrap gap-2.5">
                  {entry.photos.map((ph) => (
                    <PhotoThumb
                      key={ph.id}
                      name={ph.name}
                      label={ph.label}
                      seed={ph.seed}
                      offline={ph.capturedOffline}
                      className="w-36"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-ink-3">No photos captured for this section.</p>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Expenditure table — whole report"
              description="quantity × unit cost · replacement-year logic"
              actions={<Badge tone="success">computed</Badge>}
            />
            {model.lines.length === 0 ? (
              <p className="px-5 py-4 text-[12.5px] text-ink-3">
                No cost lines — every component is in serviceable condition. They are described in the
                narrative but carry no cost, matching Sense practice.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-line text-left">
                      {['Repair item', 'Cost basis', 'Bucket', 'Sec.', 'Opinion of cost'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-5 py-2 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase',
                            h === 'Opinion of cost' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...model.imm, ...model.short, ...model.cap].map((row, i) => (
                      <tr key={`${row.item}-${i}`} className="border-b border-line last:border-0">
                        <td className="px-5 py-2.5 text-[12.5px] font-semibold text-ink">{row.item}</td>
                        <td className="px-5 py-2.5 font-mono text-[10.5px] text-ink-2">{row.basis}</td>
                        <td className="px-5 py-2.5">
                          <Badge tone={BUCKET_TONE[row.bucket]}>{BUCKET_SHORT[row.bucket]}</Badge>
                        </td>
                        <td className="px-5 py-2.5 font-mono text-[10.5px] text-ink-3">{row.sec}</td>
                        <td className="tnum px-5 py-2.5 text-right text-[13px] font-extrabold text-ink">
                          {row.cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-6 bg-subtle px-5 py-3.5">
              {totals.map((t) => (
                <div key={t.label} className="text-right">
                  <p className="font-mono text-[9px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
                    {t.label}
                  </p>
                  <p className="tnum mt-0.5 text-[15px] font-extrabold text-ink">{t.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
