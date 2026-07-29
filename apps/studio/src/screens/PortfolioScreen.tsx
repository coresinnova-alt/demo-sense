import { useNavigate } from 'react-router-dom'
import { inspectionActions, selectPortfolio, useAppDispatch, useAppSelector } from '@sense/store'
import { money, moneyShort } from '@sense/core'
import { BarList, Card, CardBody, CardHeader, ColumnChart, StackedBar, StatTile } from '@sense/ui'
import { BUCKET_COLOR, CONDITION_COLOR } from '../lib/conditionStyle'
import { routeForInspection } from '../lib/routeForInspection'

export const PortfolioScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const stats = useAppSelector(selectPortfolio)
  const inspections = useAppSelector((s) => s.inspections.items)

  const immediate = stats.bucketTotals.find((b) => b.id === 'imm')?.total ?? 0
  const assessedComponents = stats.conditionMix.reduce((n, c) => n + c.count, 0)
  const needsAttention = stats.conditionMix
    .filter((c) => c.id === 'poor' || c.id === 'failed')
    .reduce((n, c) => n + c.count, 0)

  const openProperty = (id: string) => {
    const insp = inspections.find((i) => i.id === id)
    if (!insp) return
    dispatch(inspectionActions.setActive({ id, compIdx: 0 }))
    navigate(routeForInspection(insp))
  }

  return (
    <div className="animate-rise mx-auto max-w-[1240px] px-6 py-7 pb-16">
      <header className="mb-6">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Portfolio analytics</h1>
        <p className="mt-1 text-[12.5px] text-ink-3">
          Rolled up across {stats.assessedCount} assessed{' '}
          {stats.assessedCount === 1 ? 'property' : 'properties'}. Every figure is computed from the
          field selections and the cost book — none of it is generated.
        </p>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total identified"
          value={moneyShort(stats.totalIdentified)}
          sub="opinion of probable cost, uninflated"
        />
        <StatTile
          label="Immediate needs"
          value={moneyShort(immediate)}
          sub="due within the first year"
          tone={immediate > 0 ? 'danger' : 'default'}
        />
        <StatTile
          label="Components assessed"
          value={assessedComponents}
          sub={`${needsAttention} rated poor or failed`}
          tone={needsAttention > 0 ? 'warn' : 'default'}
        />
        <StatTile
          label="Average per property"
          value={moneyShort(stats.assessedCount ? stats.totalIdentified / stats.assessedCount : 0)}
          sub="identified spend per assessed asset"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Condition mix"
            description="Every completed component across the portfolio, by condition rating."
          />
          <CardBody>
            <StackedBar
              caption="Component count by condition rating"
              format={(v) => `${v}`}
              segments={stats.conditionMix.map((c) => ({
                id: c.id,
                label: c.label,
                value: c.count,
                color: CONDITION_COLOR[c.id],
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Spend by expenditure bucket"
            description="Where the identified cost lands in the client's budget."
          />
          <CardBody>
            <BarList
              format={money}
              emptyLabel="No cost lines identified yet"
              data={stats.bucketTotals.map((b) => ({
                id: b.id,
                label: b.label,
                value: b.total,
                color: BUCKET_COLOR[b.id],
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mb-5">
        <CardHeader
          title="Ten-year replacement reserve profile"
          description="Costs placed in the year each component reaches the end of its expected useful life."
        />
        <CardBody>
          <ColumnChart
            data={stats.reservesByYear.map((v, i) => ({
              label: `Yr ${i + 1}`,
              value: v,
              note: v ? 'scheduled expenditure' : 'no expenditure scheduled',
            }))}
            format={moneyShort}
            xLabel="Year of expenditure — uninflated"
            height={210}
          />
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Spend by component category"
            description="Which building systems are driving the cost."
          />
          <CardBody>
            <BarList
              format={money}
              emptyLabel="No cost lines identified yet"
              data={stats.byComponent.map((c) => ({ id: c.id, label: c.label, value: c.total }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Identified spend by property" description="Largest exposure first." />
          <CardBody className="p-0">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-5 py-2.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
                    Property
                  </th>
                  <th className="px-5 py-2.5 font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
                    Overall
                  </th>
                  <th className="px-5 py-2.5 text-right font-mono text-[9.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
                    Identified
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.byProperty.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openProperty(p.id)}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-subtle"
                  >
                    <td className="max-w-0 truncate px-5 py-2.5 text-[12.5px] font-semibold text-ink">
                      {p.name}
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-ink-2">{p.overall}</td>
                    <td className="tnum px-5 py-2.5 text-right text-[12.5px] font-bold text-ink">
                      {p.total ? money(p.total) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
