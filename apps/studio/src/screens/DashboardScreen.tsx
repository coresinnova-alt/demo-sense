import { useNavigate } from 'react-router-dom'
import {
  inspectionActions,
  logAudit,
  recordChange,
  selectDashboardKpis,
  selectDashboardRows,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import type { SortKey } from '@sense/store'
import { COMPONENTS, STATUS_LABEL, moneyShort, relativeDay } from '@sense/core'
import type { InspectionStatus } from '@sense/core'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConditionDots,
  EmptyState,
  Input,
  ProgressBar,
  Select,
  StatTile,
  cn,
} from '@sense/ui'
import {
  CONDITION_COLOR,
  STATUS_TONE,
  UNASSESSED_COLOR,
  conditionLabel,
} from '../lib/conditionStyle'
import { ctaForInspection, routeForInspection } from '../lib/routeForInspection'

const STATUS_FILTERS: { value: InspectionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'field', label: 'In field' },
  { value: 'ready', label: 'Ready to generate' },
  { value: 'review', label: 'Awaiting review' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
]

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'updated', label: 'Last updated' },
  { value: 'name', label: 'Property name' },
  { value: 'status', label: 'Workflow status' },
  { value: 'progress', label: 'Completion' },
]

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export const DashboardScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)!
  const rows = useAppSelector(selectDashboardRows)
  const kpis = useAppSelector(selectDashboardKpis)
  const query = useAppSelector((s) => s.inspections.query)
  const statusFilter = useAppSelector((s) => s.inspections.statusFilter)
  const sort = useAppSelector((s) => s.inspections.sort)
  const inspections = useAppSelector((s) => s.inspections.items)

  const startNew = () => {
    const action = inspectionActions.create(user.name, inspections)
    dispatch(action)
    dispatch(logAudit('Inspection started', action.payload.proj))
    dispatch(recordChange(`Inspection started — ${action.payload.proj}`))
    navigate(`/inspection/${action.payload.id}/intake`)
  }

  const open = (id: string) => {
    const insp = inspections.find((i) => i.id === id)
    if (!insp) return
    if (insp.status === 'scheduled') {
      dispatch(inspectionActions.setStatus({ id, status: 'field' }))
      dispatch(logAudit('Inspection started', `${insp.proj} · ${insp.property.name}`))
    }
    // Resume at the first component that still needs work.
    const nextIdx = COMPONENTS.findIndex((c) => !insp.data[c.id]?.done)
    dispatch(inspectionActions.setActive({ id, compIdx: nextIdx === -1 ? 0 : nextIdx }))
    navigate(routeForInspection(insp))
  }

  return (
    <div className="animate-rise mx-auto max-w-[1240px] px-6 py-7 pb-16">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
            {greeting()}, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-3">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · Miami office · Property Condition Assessments
          </p>
        </div>
        <Button variant="primary" onClick={startNew} leading={<span className="text-base leading-none">+</span>}>
          New inspection
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Awaiting review"
          value={kpis.awaitingReview}
          sub="drafts ready for engineer sign-off"
          tone={kpis.awaitingReview > 0 ? 'warn' : 'default'}
        />
        <StatTile label="In the field" value={kpis.inField} sub="inspections in progress or ready" />
        <StatTile
          label="Identified spend"
          value={moneyShort(kpis.identified)}
          sub="across every assessed property"
        />
        <StatTile
          label="Sync queue"
          value={kpis.queued}
          sub={kpis.queued ? 'queued on this device — will sync' : 'all changes synced to office'}
          tone={kpis.queued ? 'warn' : 'default'}
        />
      </div>

      <Card elevation="floating" className="overflow-hidden">
        <CardHeader
          title="Inspections"
          eyebrow={`${rows.length} of ${inspections.length}`}
          description="Property Condition Assessment · ASTM E2018"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="search"
                placeholder="Search property, client or project no."
                value={query}
                onChange={(e) => dispatch(inspectionActions.setQuery(e.target.value))}
                aria-label="Search inspections"
                className="w-56"
              />
              <Select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) =>
                  dispatch(
                    inspectionActions.setStatusFilter(e.target.value as InspectionStatus | 'all'),
                  )
                }
                options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
                className="w-40"
              />
              <Select
                aria-label="Sort inspections"
                value={sort}
                onChange={(e) => dispatch(inspectionActions.setSort(e.target.value as SortKey))}
                options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
                className="w-36"
              />
            </div>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No inspections match"
            description="Try a different search term, or clear the status filter."
            action={
              <Button
                onClick={() => {
                  dispatch(inspectionActions.setQuery(''))
                  dispatch(inspectionActions.setStatusFilter('all'))
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  {['Property', 'Project', 'Components', 'Progress', 'Identified', 'Status', 'Updated', ''].map(
                    (h, i) => (
                      <th
                        key={h || i}
                        className={cn(
                          'px-5 py-2.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase',
                          (h === 'Identified' || h === '') && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ insp, progress, identified }) => {
                  const words = (insp.property.name || 'New Inspection').split(' ')
                  const tile = `${words[0]?.[0] ?? 'N'}${words[1]?.[0] ?? ''}`
                  return (
                    <tr
                      key={insp.id}
                      onClick={() => open(insp.id)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-subtle"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-[12px] font-extrabold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
                            {tile}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-bold text-ink">
                              {insp.property.name || 'New inspection (set-up pending)'}
                            </span>
                            <span className="block truncate text-[11px] text-ink-3">
                              {insp.property.addr || '—'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[10.5px] text-ink-2">{insp.proj}</td>
                      <td className="px-5 py-3">
                        <ConditionDots
                          dots={COMPONENTS.map((c) => {
                            const entry = insp.data[c.id]
                            const cond = entry?.done ? entry.cond : null
                            return {
                              id: c.id,
                              label: c.label,
                              condition: conditionLabel(cond),
                              color: cond ? CONDITION_COLOR[cond] : UNASSESSED_COLOR,
                            }
                          })}
                        />
                      </td>
                      <td className="w-28 px-5 py-3">
                        <ProgressBar value={progress.pct} size="sm" label={`${progress.pct}% complete`} />
                        <span className="tnum mt-1 block text-[10px] text-ink-3">
                          {progress.done}/{progress.total}
                        </span>
                      </td>
                      <td className="tnum px-5 py-3 text-right text-[12.5px] font-bold text-ink">
                        {identified ? moneyShort(identified) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={STATUS_TONE[insp.status]} dot>
                          {STATUS_LABEL[insp.status]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-[11.5px] text-ink-3">
                        {relativeDay(insp.updatedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant={insp.status === 'approved' ? 'secondary' : 'primary'}
                          onClick={(e) => {
                            e.stopPropagation()
                            open(insp.id)
                          }}
                        >
                          {ctaForInspection(insp)}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-3">
        <span className="font-semibold">Component condition:</span>
        {(['good', 'fair', 'poor', 'failed'] as const).map((id) => (
          <span key={id} className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-[3px]" style={{ background: CONDITION_COLOR[id] }} />
            {conditionLabel(id)}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[3px]" style={{ background: UNASSESSED_COLOR }} />
          Not assessed
        </span>
      </div>
    </div>
  )
}
