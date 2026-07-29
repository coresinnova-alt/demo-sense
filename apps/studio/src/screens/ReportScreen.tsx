import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ensureDraft,
  logAudit,
  selectActiveReportModel,
  useAppDispatch,
  useAppSelector,
} from '@sense/store'
import {
  REPORT_BOILERPLATE,
  STATUS_LABEL,
  money,
  toReservesCsv,
  toWordHtml,
} from '@sense/core'
import type { CostRow, ReportModel } from '@sense/core'
import { Badge, Button, PhotoThumb } from '@sense/ui'
import { CONDITION_COLOR, STATUS_TONE } from '../lib/conditionStyle'
import { downloadBlob } from '../lib/download'
import { useActiveInspection } from '../lib/useActiveInspection'

export const ReportScreen = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const inspection = useActiveInspection()
  const model = useAppSelector(selectActiveReportModel)

  useEffect(() => {
    if (inspection && !inspection.draft) dispatch(ensureDraft(inspection.id))
  }, [dispatch, inspection])

  if (!inspection) return <Navigate to="/" replace />
  if (!model || !inspection.draft) {
    return <div className="px-6 py-16 text-center text-[13px] text-ink-3">Assembling the report…</div>
  }

  const p = inspection.property
  const exportWord = () => {
    downloadBlob(
      toWordHtml(inspection, model),
      `${inspection.proj} PCA Report.doc`,
      'application/msword',
    )
    dispatch(logAudit('Report exported', `${inspection.proj} · Word (.doc)`))
  }
  const exportCsv = () => {
    downloadBlob(
      toReservesCsv(inspection, model),
      `${inspection.proj} Reserves.csv`,
      'text/csv;charset=utf-8',
    )
    dispatch(logAudit('Report exported', `${inspection.proj} · Reserves CSV`))
  }
  const exportPdf = () => {
    dispatch(logAudit('Report exported', `${inspection.proj} · PDF (print)`))
    setTimeout(() => window.print(), 120)
  }

  const metaRows = [
    ['Property Name', p.name],
    ['Address', p.addr],
    ['Property Type', p.type],
    ['Year Built', p.year],
    ['Gross Building Area', `${p.gba || '—'} SF`],
    ['Date of Inspection', inspection.inspectedOn],
    ['Overall Condition', model.overall],
  ]

  return (
    <div className="animate-rise mx-auto max-w-[1000px] px-6 py-6 pb-16">
      <div className="no-print mb-4 flex flex-wrap items-center gap-2.5">
        <Button size="sm" onClick={() => navigate(`/inspection/${inspection.id}/review`)}>
          ← Review
        </Button>
        <Badge tone={STATUS_TONE[inspection.status]} dot>
          {STATUS_LABEL[inspection.status]}
        </Badge>
        <span className="text-[11px] text-ink-3">
          {inspection.status === 'approved' ? 'Approved deliverable' : 'Draft — pending approval'}
        </span>
        <span className="flex-1" />
        <Button size="sm" onClick={exportCsv}>
          ↓ Reserves (.csv)
        </Button>
        <Button size="sm" onClick={exportWord}>
          ↓ Word (.doc)
        </Button>
        <Button size="sm" variant="primary" onClick={exportPdf}>
          Export PDF / Print
        </Button>
      </div>

      {/* The deliverable itself. Serif body, print-safe, rendered on paper stock. */}
      <article className="paper rounded-xl border border-line bg-paper px-14 py-14 font-serif leading-relaxed text-paper-ink shadow-e3">
        <header className="flex items-center justify-between border-b-[2.5px] border-paper-rule pb-2.5">
          <span className="font-sans text-[10.5px] font-extrabold tracking-[0.22em] text-brand-800">
            SENSE ENGINEERING
          </span>
          <span className="font-mono text-[9.5px] text-ink-3">ASTM E2018 · PCR</span>
        </header>

        <div className="mt-11 text-center">
          <h1 className="font-sans text-[22px] font-extrabold tracking-[0.14em]">
            PROPERTY CONDITION ASSESSMENT
          </h1>
          <p className="mt-1.5 text-[13px] italic text-ink-2">
            Property Condition Report (PCR) · ASTM E2018
          </p>
          <p className="mt-7 text-[28px] font-bold tracking-tight">{p.name}</p>
          <p className="mt-1 text-[14.5px] text-ink-2">{p.addr}</p>
        </div>

        <figure className="mt-7">
          <PhotoThumb
            name="cover.jpg"
            label="Subject property, primary elevation"
            seed={7431}
            size="hero"
            showCaption={false}
          />
          <figcaption className="mt-2 text-center text-[12px] italic text-ink-3">
            Subject property, primary elevation
          </figcaption>
        </figure>

        <div className="mt-8 text-center text-[13.5px]">
          <p>
            <span className="text-ink-3">Prepared for:</span>{' '}
            <span className="font-semibold">{p.client || '—'}</span>
          </p>
          <p className="mt-0.5">
            <span className="text-ink-3">Prepared by:</span>{' '}
            <span className="font-semibold">Sense Engineering, Miami Office</span>
          </p>
          <p className="mt-3 font-mono text-[11px] text-ink-2">
            Project No. {inspection.proj} · Report Date:{' '}
            {inspection.reportDate ?? 'pending approval'}
          </p>
        </div>

        <hr className="my-11 border-line" />

        <SectionHeading>1.0&nbsp;&nbsp;&nbsp;EXECUTIVE SUMMARY</SectionHeading>
        <h3 className="mb-2 font-sans text-[12px] font-bold">1.1&nbsp;&nbsp;Property Summary</h3>
        <div className="mb-4 overflow-hidden rounded border border-line">
          {metaRows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[210px_1fr] border-b border-line last:border-0">
              <div className="bg-subtle px-3 py-1.5 text-[12px] text-ink-2">{k}</div>
              <div className="px-3 py-1.5 text-[12.5px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
        <p className="mb-5 text-[13px] text-pretty">{model.exec}</p>

        {model.imm.length ? (
          <CostTable title="Immediate Needs" rows={model.imm} total={model.immTotal} totalLabel="Immediate needs total" />
        ) : null}
        {model.short.length ? (
          <CostTable
            title="Short-Term Costs (1 to 2 years)"
            rows={model.short}
            total={model.shortTotal}
            totalLabel="Short-term total"
          />
        ) : null}
        {model.cap.length ? (
          <CostTable
            title="Capital Plan (3 to 10 years)"
            rows={model.cap}
            total={model.capTotal}
            totalLabel="Capital plan total"
          />
        ) : null}

        <p className="mt-4 text-[12.5px] text-ink-2 text-pretty">
          A ten-year Replacement Reserves Table appears in Appendix D, projecting capital
          expenditures by system across the hold period.
        </p>

        <SectionHeading className="mt-9">2.0&nbsp;&nbsp;&nbsp;PURPOSE, SCOPE AND LIMITATIONS</SectionHeading>
        <p className="mb-3 text-[13px] text-pretty">{REPORT_BOILERPLATE.scope1}</p>
        <p className="mb-2.5 text-[13px] text-pretty">{REPORT_BOILERPLATE.scope2}</p>
        <ul className="mb-3 pl-5">
          {REPORT_BOILERPLATE.ratings.map((r) => (
            <li key={r.k} className="mb-1 text-[12.5px]">
              <span className="font-bold">{r.k}:</span> {r.v}
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-pretty">{REPORT_BOILERPLATE.scope3}</p>

        <SectionHeading className="mt-9">3.0&nbsp;&nbsp;&nbsp;PROPERTY DESCRIPTION</SectionHeading>
        <p className="text-[13px] text-pretty">{model.propDesc}</p>

        {model.groups.map((group) => (
          <section key={group.no}>
            <SectionHeading className="mt-9">
              {group.no}&nbsp;&nbsp;&nbsp;{group.title.toUpperCase()}
            </SectionHeading>
            {group.subs.map((sub) => (
              <div key={sub.id} className="mb-7 break-inside-avoid">
                <h3 className="mb-2 font-sans text-[12.5px] font-bold">
                  {sub.no}&nbsp;&nbsp;{sub.title}
                </h3>
                <p className="mb-1 text-[13px]">
                  <span className="font-bold">Type:</span> {sub.typeText}
                </p>
                <p className="mb-1 text-[13px]">
                  <span className="font-bold">General Condition:</span>{' '}
                  <span
                    className="font-bold"
                    style={{ color: sub.condId ? CONDITION_COLOR[sub.condId] : undefined }}
                  >
                    {sub.condLabel}
                  </span>
                </p>
                <p className="mb-2 text-[13px]">
                  <span className="font-bold">Age / Last Action:</span> {sub.condNotes}
                </p>
                {sub.concerns.length ? (
                  <>
                    <p className="mb-1 text-[13px] font-bold">Concerns:</p>
                    <ul className="mb-2.5 list-disc pl-6">
                      {sub.concerns.map((c, i) => (
                        <li key={i} className="mb-0.5 text-[12.5px]">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className="mb-1.5 text-[13px] text-pretty">
                  <span className="font-bold">Recommendation:</span> {sub.recText}
                </p>
                {sub.hasCost ? (
                  <p className="mb-1.5 text-[13px]">
                    <span className="font-bold">Opinion of Probable Cost:</span>{' '}
                    <span className="font-bold text-brand-800">{sub.costText}</span>
                  </p>
                ) : null}
                {sub.photos.length ? (
                  <>
                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                      {sub.photos.map((ph) => (
                        <PhotoThumb
                          key={ph.id}
                          name={ph.name}
                          label={ph.label}
                          seed={ph.seed}
                          className="w-40"
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11.5px] italic text-ink-3">{sub.figCaption}</p>
                  </>
                ) : null}
              </div>
            ))}
          </section>
        ))}

        <SectionHeading className="mt-9">
          APPENDIX D: REPLACEMENT RESERVES TABLE (10-YEAR)
        </SectionHeading>
        <p className="mb-3 text-[12.5px] text-ink-2 text-pretty">{REPORT_BOILERPLATE.reservesNote}</p>
        <div className="overflow-x-auto rounded border border-line break-inside-avoid">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="bg-paper-rule text-white">
                {['Component', 'EUL (yrs)', 'Quantity', 'Unit cost', 'Yr due', 'Line cost', 'Section'].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-2.5 py-1.5 text-left font-sans text-[10px] font-bold ${
                        h === 'Line cost' || h === 'Section' ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {model.reserves.map((r, i) => (
                <tr key={`${r.component}-${i}`} className="border-b border-line last:border-0">
                  <td className="px-2.5 py-1.5 text-[12px]">{r.component}</td>
                  <td className="px-2.5 py-1.5 text-[11.5px] text-ink-2">{r.eul}</td>
                  <td className="px-2.5 py-1.5 text-[11.5px] text-ink-2">{r.qty}</td>
                  <td className="px-2.5 py-1.5 text-[11.5px] text-ink-2">{r.unit}</td>
                  <td className="px-2.5 py-1.5 text-[11.5px] font-semibold">{r.yr}</td>
                  <td className="tnum px-2.5 py-1.5 text-right text-[12px] font-bold">{r.cost}</td>
                  <td className="px-2.5 py-1.5 text-right text-[11.5px] text-ink-3">{r.sec}</td>
                </tr>
              ))}
              <tr className="bg-subtle">
                <td colSpan={5} className="px-2.5 py-1.5 text-[12.5px] font-bold">
                  10-year total (uninflated)
                </td>
                <td className="tnum px-2.5 py-1.5 text-right text-[12.5px] font-extrabold">
                  {money(model.reservesTotal)}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-9 border-t border-line pt-3 text-[11px] italic text-ink-3 text-pretty">
          Generated by Sense Report Studio from the guided inspection of {inspection.inspectedOn}.
          Narrative grounded in Sense-approved language with per-line source references; costs
          computed from the seeded cost book; photos auto-placed at capture. Reviewed and approved by
          a Sense engineer before delivery.
        </p>
      </article>
    </div>
  )
}

const SectionHeading = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <h2
    className={`mb-3.5 border-b-[1.5px] border-paper-rule pb-1.5 font-sans text-[14px] font-extrabold tracking-[0.04em] ${className}`}
  >
    {children}
  </h2>
)

const CostTable = ({
  title,
  rows,
  total,
  totalLabel,
}: {
  title: string
  rows: CostRow[]
  total: ReportModel['immTotal']
  totalLabel: string
}) => (
  <div className="mb-4">
    <h3 className="mb-1.5 font-sans text-[12px] font-bold">{title}</h3>
    <div className="overflow-hidden rounded border border-line break-inside-avoid">
      <div className="grid grid-cols-[1fr_190px_130px] bg-paper-rule text-white">
        <div className="px-3 py-1.5 font-sans text-[10.5px] font-bold">Repair item</div>
        <div className="px-3 py-1.5 font-sans text-[10.5px] font-bold">Cost basis</div>
        <div className="px-3 py-1.5 text-right font-sans text-[10.5px] font-bold">Opinion of cost</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_190px_130px] border-b border-line">
          <div className="px-3 py-1.5 text-[12.5px]">{r.item}</div>
          <div className="px-3 py-1.5 text-[12px] text-ink-2">{r.basis}</div>
          <div className="tnum px-3 py-1.5 text-right text-[12.5px] font-bold">{r.cost}</div>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_130px] bg-subtle">
        <div className="px-3 py-1.5 text-[12.5px] font-bold">{totalLabel}</div>
        <div className="tnum px-3 py-1.5 text-right text-[12.5px] font-extrabold">{money(total)}</div>
      </div>
    </div>
  </div>
)
