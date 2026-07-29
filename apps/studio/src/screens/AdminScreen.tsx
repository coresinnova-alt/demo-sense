import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import {
  contentActions,
  logAudit,
  recordChange,
  selectOverrides,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import type { AdminTab } from '@sense/store'
import {
  COMPONENTS,
  COMPONENT_BY_ID,
  CONDITIONS,
  CONDITION_LANGUAGE,
  COST_BOOK,
  DESCRIPTIONS,
  RECOMMENDATIONS,
  RECOMMENDATION_LANGUAGE,
  condRef,
  costEntry,
  descRef,
  rate,
  recRef,
} from '@sense/core'
import { ROLE_CAPABILITIES } from '@sense/mock'
import { Badge, Button, Card, Input, Tabs, Textarea, cn } from '@sense/ui'

interface Snippet {
  ref: string
  title: string
  fallback: string
}

export const AdminScreen = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)!
  const tab = useAppSelector((s) => s.content.adminTab)
  const filter = useAppSelector((s) => s.content.adminFilter)
  const overrides = useAppSelector(selectOverrides)
  const audit = useAppSelector((s) => s.content.audit)

  const snippets = useMemo<Snippet[]>(() => {
    if (filter === 'cond') {
      return CONDITIONS.map((c) => ({
        ref: condRef(c.id),
        title: `Condition language — ${c.label}`,
        fallback: CONDITION_LANGUAGE[c.id],
      }))
    }
    if (filter === 'rec') {
      return RECOMMENDATIONS.map((r) => ({
        ref: recRef(r.id),
        title: `Recommendation — ${r.label}`,
        fallback: RECOMMENDATION_LANGUAGE[r.id],
      }))
    }
    const comp = COMPONENTS.find((c) => c.id === filter) ?? COMPONENTS[0]
    return comp.types.map((t) => ({
      ref: descRef(comp.id, t),
      title: `Type description — ${t}`,
      fallback: DESCRIPTIONS[`${comp.id}|${t}`] ?? '',
    }))
  }, [filter])

  if (!ROLE_CAPABILITIES[user.role].admin) return <Navigate to="/" replace />

  const filters = [
    ...COMPONENTS.map((c) => ({ id: c.id as string, label: c.label })),
    { id: 'cond', label: 'Condition scale' },
    { id: 'rec', label: 'Recommendations' },
  ]

  return (
    <div className="animate-rise mx-auto max-w-[1160px] px-6 py-7 pb-16">
      <header className="mb-5">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
          Admin — content &amp; governance
        </h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Approved language and cost data are Sense content, editable here without a code change.
          Every generated line traces back to these sources.
        </p>
      </header>

      <Tabs
        className="mb-5"
        ariaLabel="Admin sections"
        value={tab}
        onChange={(id) => dispatch(contentActions.setAdminTab(id as AdminTab))}
        items={[
          { id: 'lang', label: 'Approved language' },
          { id: 'cost', label: 'Cost book' },
          { id: 'audit', label: 'Audit log', badge: <Badge tone="neutral">{audit.length}</Badge> },
        ]}
      />

      {tab === 'lang' ? (
        <Card className="p-5">
          <p className="mb-4 rounded-xl border border-line bg-subtle px-3.5 py-2.5 text-[11.5px] text-ink-3">
            This is the grounding source for drafting. Edits apply to the next generation run — no
            code change needed. Placeholder content: confirm wording with a Sense engineer before the
            pilot.
          </p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => dispatch(contentActions.setAdminFilter(f.id))}
                className={cn(
                  'cursor-pointer rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
                  filter === f.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-inset text-ink-2 hover:bg-line hover:text-ink',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3.5">
            {snippets.map((sn) => {
              const edited = overrides.snippets[sn.ref] !== undefined
              return (
                <div key={sn.ref}>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone="brand" mono>
                      {sn.ref}
                    </Badge>
                    <span className="text-[12px] font-bold text-ink-2">{sn.title}</span>
                    {edited ? (
                      <>
                        <Badge tone="warn">edited</Badge>
                        <button
                          type="button"
                          onClick={() => dispatch(contentActions.resetSnippet(sn.ref))}
                          className="cursor-pointer text-[10px] font-semibold text-ink-3 underline underline-offset-2 hover:text-ink"
                        >
                          reset
                        </button>
                      </>
                    ) : null}
                  </div>
                  <Textarea
                    rows={2}
                    aria-label={sn.title}
                    value={overrides.snippets[sn.ref] ?? sn.fallback}
                    onChange={(e) => {
                      dispatch(contentActions.setSnippet({ ref: sn.ref, text: e.target.value }))
                      dispatch(recordChange(`Snippet edited — ${sn.ref}`))
                    }}
                    onBlur={() => {
                      if (overrides.snippets[sn.ref] !== undefined) {
                        dispatch(logAudit('Approved language updated', sn.ref))
                      }
                    }}
                  />
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}

      {tab === 'cost' ? (
        <Card className="overflow-hidden">
          <p className="border-b border-line bg-subtle px-5 py-3 text-[11.5px] text-ink-3">
            RSMeans-style seeded cost data — static seed now, live source later. Unit costs and
            expected useful life are editable; line costs are always quantity × unit cost.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  {['Component', 'Type', 'Unit', 'Unit cost ($)', 'EUL (yrs)', 'Effective', ''].map(
                    (h, i) => (
                      <th
                        key={h || i}
                        className="px-5 py-2.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {Object.keys(COST_BOOK).map((key) => {
                  const [compId, type] = key.split('|')
                  const comp = COMPONENT_BY_ID[compId as keyof typeof COMPONENT_BY_ID]
                  const effective = costEntry(overrides, comp.id, type)
                  const edited =
                    overrides.costs[key] !== undefined || overrides.euls[key] !== undefined
                  return (
                    <tr key={key} className="border-b border-line last:border-0">
                      <td className="px-5 py-2 text-[12px] font-bold text-ink">{comp.label}</td>
                      <td className="px-5 py-2 text-[12px] text-ink-2">{type}</td>
                      <td className="px-5 py-2 font-mono text-[10.5px] text-ink-3">{comp.unit}</td>
                      <td className="w-32 px-5 py-2">
                        <Input
                          inputMode="decimal"
                          aria-label={`Unit cost for ${comp.label} ${type}`}
                          value={String(overrides.costs[key] ?? COST_BOOK[key].cost)}
                          onChange={(e) => {
                            const v = Number.parseFloat(e.target.value)
                            dispatch(
                              contentActions.setCost({ key, value: Number.isFinite(v) ? v : 0 }),
                            )
                            dispatch(recordChange(`Cost updated — ${key}`))
                          }}
                          onBlur={() => dispatch(logAudit('Cost item updated', key))}
                          className="[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-[12.5px]"
                        />
                      </td>
                      <td className="w-24 px-5 py-2">
                        <Input
                          inputMode="numeric"
                          aria-label={`EUL for ${comp.label} ${type}`}
                          value={String(overrides.euls[key] ?? COST_BOOK[key].eul)}
                          onChange={(e) => {
                            const v = Number.parseInt(e.target.value, 10)
                            dispatch(
                              contentActions.setEul({ key, value: Number.isFinite(v) ? v : 0 }),
                            )
                          }}
                          onBlur={() => dispatch(logAudit('EUL updated', key))}
                          className="[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-[12.5px]"
                        />
                      </td>
                      <td className="px-5 py-2 font-mono text-[10.5px] text-ink-2">
                        {rate(effective.cost, comp.unit)}
                      </td>
                      <td className="px-5 py-2 text-right">
                        {edited ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dispatch(contentActions.resetCostRow(key))}
                          >
                            Reset
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === 'audit' ? (
        <Card className="overflow-hidden">
          <p className="border-b border-line bg-subtle px-5 py-3 text-[11.5px] text-ink-3">
            Who did what, when. Entries marked “offline” were captured in the field without signal and
            synced later.
          </p>
          <ul>
            {audit.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[130px_150px_minmax(0,1fr)_80px] items-center gap-3 border-b border-line px-5 py-2.5 last:border-0"
              >
                <span className="font-mono text-[10.5px] text-ink-3">{a.ts}</span>
                <span className="truncate text-[12px] font-bold text-ink">{a.user}</span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-ink-2">{a.action}</span>
                  <span className="block truncate text-[11px] text-ink-3">{a.detail}</span>
                </span>
                <span className="text-right">
                  {a.off ? <Badge tone="warn">offline</Badge> : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
