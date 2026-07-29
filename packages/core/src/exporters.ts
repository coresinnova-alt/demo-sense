import { REPORT_BOILERPLATE } from './language'
import { money } from './format'
import type { CostRow, Inspection, ReportModel } from './types'

const esc = (t: unknown) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Word-compatible HTML. Word opens an HTML payload served as
 * `application/msword` and preserves headings, tables and inline styles, which
 * is what the office team needs for final formatting.
 */
export const toWordHtml = (insp: Inspection, m: ReportModel): string => {
  const p = insp.property
  const table = (rows: CostRow[], total: number, totalLabel: string) =>
    `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:11pt">` +
    `<tr><th align="left">Repair item</th><th align="left">Cost basis</th><th align="right">Opinion of cost</th></tr>` +
    rows
      .map(
        (r) =>
          `<tr><td>${esc(r.item)}</td><td>${esc(r.basis)}</td><td align="right">${esc(r.cost)}</td></tr>`,
      )
      .join('') +
    `<tr><td><b>${esc(totalLabel)}</b></td><td></td><td align="right"><b>${esc(money(total))}</b></td></tr></table>`

  const out: string[] = []
  out.push(
    `<html><head><meta charset="utf-8"><title>${esc(insp.proj)}</title></head>` +
      `<body style="font-family:Georgia,serif;font-size:11pt;line-height:1.5">`,
  )
  out.push(`<p style="font-size:9pt;letter-spacing:2px"><b>SENSE ENGINEERING · MIAMI OFFICE</b></p>`)
  out.push(`<h1 style="font-size:20pt;margin:6pt 0">PROPERTY CONDITION ASSESSMENT</h1>`)
  out.push(`<p>Property Condition Report (PCR) · ASTM E2018</p>`)
  out.push(`<h2 style="font-size:15pt">${esc(p.name)}</h2><p>${esc(p.addr)}</p>`)
  out.push(
    `<p>Prepared for: ${esc(p.client)}<br>Prepared by: Sense Engineering, Miami Office<br>` +
      `Project No. ${esc(insp.proj)} · Report Date: ${esc(insp.reportDate ?? insp.inspectedOn)}</p><hr>`,
  )

  out.push(`<h2>1.0 Executive Summary</h2>`)
  out.push(
    `<p>Property: ${esc(p.name)} · ${esc(p.type)} · Year built ${esc(p.year)} · ${esc(p.gba)} SF · ` +
      `Overall condition: <b>${esc(m.overall)}</b></p>`,
  )
  out.push(`<p>${esc(m.exec)}</p>`)
  if (m.imm.length) out.push(`<h3>Immediate Needs</h3>${table(m.imm, m.immTotal, 'Immediate needs total')}`)
  if (m.short.length)
    out.push(`<h3>Short-Term Costs (1 to 2 years)</h3>${table(m.short, m.shortTotal, 'Short-term total')}`)
  if (m.cap.length)
    out.push(`<h3>Capital Plan (3 to 10 years)</h3>${table(m.cap, m.capTotal, 'Capital plan total')}`)

  out.push(`<h2>2.0 Purpose, Scope and Limitations</h2>`)
  out.push(`<p>${esc(REPORT_BOILERPLATE.scope1)}</p><p>${esc(REPORT_BOILERPLATE.scope2)}</p>`)
  out.push(
    `<ul>${REPORT_BOILERPLATE.ratings
      .map((r) => `<li><b>${esc(r.k)}:</b> ${esc(r.v)}</li>`)
      .join('')}</ul>`,
  )
  out.push(`<p>${esc(REPORT_BOILERPLATE.scope3)}</p>`)
  out.push(`<h2>3.0 Property Description</h2><p>${esc(m.propDesc)}</p>`)

  for (const g of m.groups) {
    out.push(`<h2>${esc(`${g.no} ${g.title}`)}</h2>`)
    for (const sb of g.subs) {
      out.push(`<h3>${esc(`${sb.no} ${sb.title}`)}</h3>`)
      out.push(
        `<p><b>Type:</b> ${esc(sb.typeText)}<br><b>General Condition:</b> ${esc(sb.condLabel)}<br>` +
          `<b>Age / Last Action:</b> ${esc(sb.condNotes)}</p>`,
      )
      out.push(
        `<p><b>Concerns:</b></p><ul>${sb.concerns.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`,
      )
      out.push(`<p><b>Recommendation:</b> ${esc(sb.recText)}</p>`)
      if (sb.hasCost) out.push(`<p><b>Opinion of Probable Cost:</b> ${esc(sb.costText)}</p>`)
      if (sb.media.length) {
        out.push(
          `<p style="font-size:9.5pt;color:#555"><i>Figures: ${sb.media
            .map((ph) => esc(ph.name))
            .join(', ')} — ${esc(sb.figCaption)}</i></p>`,
        )
      }
    }
  }

  out.push(`<h2>Appendix D: Replacement Reserves Table (10-Year)</h2>`)
  out.push(`<p style="font-size:10pt">${esc(REPORT_BOILERPLATE.reservesNote)}</p>`)
  out.push(
    `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:10pt">` +
      `<tr><th align="left">Component</th><th>EUL (yrs)</th><th>Quantity</th><th>Unit cost</th>` +
      `<th>Yr due</th><th align="right">Line cost</th><th>Section</th></tr>` +
      m.reserves
        .map(
          (r) =>
            `<tr><td>${esc(r.component)}</td><td align="center">${esc(r.eul)}</td>` +
            `<td align="center">${esc(r.qty)}</td><td align="center">${esc(r.unit)}</td>` +
            `<td align="center">${esc(r.yr)}</td><td align="right">${esc(r.cost)}</td>` +
            `<td align="center">${esc(r.sec)}</td></tr>`,
        )
        .join('') +
      `<tr><td><b>10-year total (uninflated)</b></td><td></td><td></td><td></td><td></td>` +
      `<td align="right"><b>${esc(money(m.reservesTotal))}</b></td><td></td></tr></table>`,
  )
  out.push(`</body></html>`)
  return out.join('')
}

const csvCell = (v: unknown) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Reserve schedule as CSV, for the client's own capital-planning model. */
export const toReservesCsv = (insp: Inspection, m: ReportModel): string => {
  const rows: string[][] = [
    ['Project', 'Property', 'Component', 'Section', 'EUL (yrs)', 'Quantity', 'Unit cost', 'Year due', 'Line cost'],
    ...m.reserves.map((r) => [
      insp.proj,
      insp.property.name,
      r.component,
      r.sec,
      r.eul,
      r.qty,
      r.unit,
      String(r.year),
      String(r.raw),
    ]),
    ['', '', '10-year total (uninflated)', '', '', '', '', '', String(m.reservesTotal)],
  ]
  return rows.map((r) => r.map(csvCell).join(',')).join('\n')
}
