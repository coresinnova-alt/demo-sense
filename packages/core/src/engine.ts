import { COST_BOOK, costKey } from './costbook'
import {
  ALLOWANCES,
  BUCKET_LABEL,
  COMPONENTS,
  COMPONENT_BY_ID,
  CONDITION_BY_ID,
  RECOMMENDATION_BY_ID,
} from './taxonomy'
import { CONDITION_LANGUAGE, DESCRIPTIONS, RECOMMENDATION_LANGUAGE } from './language'
import { basis, money, pluralize, rate } from './format'
import type {
  BucketId,
  ComponentDef,
  ComponentEntry,
  ComponentId,
  ConditionId,
  ContentOverrides,
  CostLine,
  CostRow,
  Draft,
  DraftComponent,
  FlagSummary,
  Inspection,
  MediaKind,
  RecommendationId,
  ReportGroup,
  ReportModel,
  ReportSub,
  ReserveRow,
} from './types'

export const EMPTY_OVERRIDES: ContentOverrides = { snippets: {}, costs: {}, euls: {} }

/* -------------------------------------------------------------------------- */
/* Snippet references                                                          */
/* -------------------------------------------------------------------------- */

const slug = (t: string) =>
  String(t)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 22)

/**
 * Every generated sentence carries a ref back to the approved snippet it came
 * from. The review screen renders these as clickable provenance chips.
 */
export const descRef = (id: ComponentId, type: string | null) => `SNIP-${slug(id)}-${slug(type ?? 'TYPE')}`
export const condRef = (cond: ConditionId | null) => `SNIP-COND-${slug(cond ?? 'NONE')}`
export const recRef = (rec: RecommendationId | null) => `SNIP-REC-${slug(rec ?? 'NONE')}`
export const obsRef = (id: ComponentId, count: number) => `SNIP-OBS-${slug(id)} x${count}`

const resolve = (ov: ContentOverrides, ref: string, fallback: string) => {
  const o = ov.snippets[ref]
  return o !== undefined && o !== '' ? o : fallback
}

export const descText = (ov: ContentOverrides, id: ComponentId, type: string | null) =>
  resolve(ov, descRef(id, type), DESCRIPTIONS[costKey(id, type ?? '')] ?? `${type ?? 'System'} system.`)

export const condText = (ov: ContentOverrides, cond: ConditionId | null) =>
  cond ? resolve(ov, condRef(cond), CONDITION_LANGUAGE[cond]) : ''

export const recText = (ov: ContentOverrides, rec: RecommendationId | null) =>
  rec ? resolve(ov, recRef(rec), RECOMMENDATION_LANGUAGE[rec]) : ''

/* -------------------------------------------------------------------------- */
/* Cost computation                                                            */
/* -------------------------------------------------------------------------- */

/** Cost-book lookup with admin overrides applied. */
export const costEntry = (ov: ContentOverrides, id: ComponentId, type: string) => {
  const key = costKey(id, type)
  const base = COST_BOOK[key] ?? { cost: 0, eul: 20 }
  return {
    cost: ov.costs[key] ?? base.cost,
    eul: ov.euls[key] ?? base.eul,
    eulLabel: base.eulLabel,
  }
}

export const needsCost = (entry: ComponentEntry): boolean =>
  !!entry.rec && RECOMMENDATION_BY_ID[entry.rec].carriesCost

/** A component is complete once every required selection is present. */
export const isComponentComplete = (entry: ComponentEntry): boolean =>
  !!(entry.type && entry.cond && entry.rec && (!needsCost(entry) || (entry.qty ?? 0) > 0))

/**
 * The single place a dollar figure is produced: quantity x unit cost.
 * Returns null when the selections do not carry a cost.
 */
export const computeCostLine = (
  ov: ContentOverrides,
  id: ComponentId,
  entry: ComponentEntry,
): CostLine | null => {
  if (!entry.type || !entry.rec || !needsCost(entry) || !entry.qty) return null
  const rec = RECOMMENDATION_BY_ID[entry.rec]
  if (!rec.bucket || rec.year === null) return null
  const ce = costEntry(ov, id, entry.type)
  return {
    qty: entry.qty,
    unit: COMPONENT_BY_ID[id].unit,
    cost: ce.cost,
    line: Math.round(entry.qty * ce.cost),
    eul: ce.eul,
    eulLabel: ce.eulLabel,
    bucket: rec.bucket,
    year: rec.year,
  }
}

/* -------------------------------------------------------------------------- */
/* Flag roll-up                                                                */
/* -------------------------------------------------------------------------- */

export const summarizeFlags = (ov: ContentOverrides, insp: Inspection): FlagSummary => {
  const red: FlagSummary['red'] = []
  const yellow: FlagSummary['yellow'] = []
  const clear: string[] = []

  for (const comp of COMPONENTS) {
    const entry = insp.data[comp.id]
    if (!entry?.done || !entry.cond) continue
    const line = computeCostLine(ov, comp.id, entry)
    const rec = entry.rec ? RECOMMENDATION_BY_ID[entry.rec].label : '-'
    const sub = `${entry.type} · ${rec}${line ? ` · ${money(line.line)}` : ''}`
    const severity = CONDITION_BY_ID[entry.cond].severity
    const flag = { id: comp.id, title: `${comp.label} — ${CONDITION_BY_ID[entry.cond].label}`, sub, severity }
    if (severity >= 2) red.push(flag)
    else if (severity === 1) yellow.push(flag)
    else clear.push(comp.label)
  }
  red.sort((a, b) => b.severity - a.severity)
  return { red, yellow, clear }
}

export const overallCondition = (insp: Inspection): string => {
  let failed = 0
  let poor = 0
  let fair = 0
  let good = 0
  for (const comp of COMPONENTS) {
    const cond = insp.data[comp.id]?.cond
    if (!cond) continue
    const sev = CONDITION_BY_ID[cond].severity
    if (sev === 3) failed++
    else if (sev === 2) poor++
    else if (sev === 1) fair++
    else good++
  }
  if (failed) return 'Poor to Fair'
  if (poor && good) return 'Fair to Good'
  if (poor) return 'Fair'
  if (fair) return 'Good'
  return 'Good to Excellent'
}

export const completionOf = (insp: Inspection) => {
  const done = COMPONENTS.filter((c) => insp.data[c.id]?.done).length
  return { done, total: COMPONENTS.length, pct: Math.round((done / COMPONENTS.length) * 100) }
}

export const mediaCount = (insp: Inspection, kind?: MediaKind) =>
  COMPONENTS.reduce((n, c) => {
    const items = insp.data[c.id]?.media ?? []
    return n + (kind ? items.filter((m) => m.kind === kind).length : items.length)
  }, 0)

/** "12 photos, 3 clips, 2 voice notes" — omits whatever was not captured. */
export const mediaSummary = (insp: Inspection): string => {
  const parts: string[] = []
  const photos = mediaCount(insp, 'photo')
  const videos = mediaCount(insp, 'video')
  const audio = mediaCount(insp, 'audio')
  if (photos) parts.push(`${photos} ${pluralize(photos, 'photo')}`)
  if (videos) parts.push(`${videos} ${pluralize(videos, 'clip')}`)
  if (audio) parts.push(`${audio} voice ${pluralize(audio, 'note')}`)
  return parts.length ? parts.join(', ') : 'no media captured'
}

/* -------------------------------------------------------------------------- */
/* Draft assembly                                                              */
/* -------------------------------------------------------------------------- */

export const draftComponent = (
  ov: ContentOverrides,
  comp: ComponentDef,
  entry: ComponentEntry,
): DraftComponent => ({
  desc: descText(ov, comp.id, entry.type),
  cond: condText(ov, entry.cond),
  rec: recText(ov, entry.rec),
  concerns: entry.obs
    .map((key) => comp.observations.find((o) => o.key === key)?.sentence)
    .filter((s): s is string => !!s),
  approved: false,
  edited: {},
})

export const buildDraft = (ov: ContentOverrides, insp: Inspection, genMs: number): Draft => {
  const comps: Draft['comps'] = {}
  for (const comp of COMPONENTS) {
    const entry = insp.data[comp.id]
    if (entry?.done) comps[comp.id] = draftComponent(ov, comp, entry)
  }
  return { mode: 'grounded-local', genMs, generatedAt: new Date().toISOString(), comps }
}

/* -------------------------------------------------------------------------- */
/* Report model                                                                */
/* -------------------------------------------------------------------------- */

/** Short action phrase used as the cost-table line item. */
const actionPhrase = (comp: ComponentDef, entry: ComponentEntry, line: CostLine): string => {
  const qty = line.qty.toLocaleString('en-US')
  const type = (entry.type ?? '').replace(' (BUR)', '').replace(' (RTU)', '')
  const isRepair = entry.rec === 'repair' || entry.rec === 'repair-now'
  switch (comp.id) {
    case 'roof':
      return isRepair ? 'localized membrane repairs' : `replace ${type.toLowerCase()} roof membrane`
    case 'paint':
      return 'recoat elevations and renew sealant'
    case 'windows':
      return isRepair ? 'glazing and gasket repairs' : `replace ${qty} units`
    case 'doors':
      return isRepair ? 'door and hardware repairs' : `replace ${qty} doors`
    case 'plumbing':
      return isRepair ? 'repair piping and replace water heaters' : `replace ${qty} ${pluralize(line.qty, 'system')}`
    case 'electrical':
      return isRepair ? 'refurbish distribution equipment' : `replace ${qty} ${pluralize(line.qty, 'assembly', 'assemblies')}`
    case 'pavement':
      return isRepair ? 'mill and overlay deficient areas' : `replace ${qty} SY of pavement`
    default:
      return isRepair ? 'repair equipment' : `replace ${qty} end-of-life ${pluralize(line.qty, 'unit')}`
  }
}

const RESERVE_TYPE_ABBR: Record<string, string> = {
  'Built-up (BUR)': 'BUR',
  'Modified Bitumen': 'Mod-Bit',
  'Shingle (asphalt)': 'Shingle',
  'Packaged rooftop unit (RTU)': 'RTU',
  'Storefront / curtain wall': 'Storefront',
  'Aluminum / glass entry': 'Entry',
  'Acrylic / elastomeric': 'Acrylic',
  'Sealant / waterproofing': 'Sealant',
}

const reserveLabel = (comp: ComponentDef, entry: ComponentEntry): string => {
  const type = RESERVE_TYPE_ABBR[entry.type ?? ''] ?? entry.type ?? comp.label
  if (comp.id === 'roof') return `Roofing (${type})`
  if (comp.id === 'paint') return 'Exterior paint / sealant'
  if (comp.id === 'hvac') return `${type} replacement`
  return `${comp.label} (${type})`
}

const ROOF_PHRASE: Record<string, string> = {
  TPO: 'a low-slope single-ply TPO system',
  'Modified Bitumen': 'a low-slope modified bitumen system',
  'Built-up (BUR)': 'a low-slope built-up system',
  'Shingle (asphalt)': 'a steep-slope asphalt shingle system',
  Metal: 'a standing-seam metal system',
  Tile: 'a steep-slope tile system',
}

const HVAC_PHRASE: Record<string, string> = {
  'Split system': 'split-system units',
  'Packaged rooftop unit (RTU)': 'roof-mounted packaged units and split systems',
  Chiller: 'a central chiller plant with air handlers',
  'Air handler': 'central air-handling units',
  'Mini-split': 'ductless mini-split systems',
}

/**
 * Assembles everything the report and the review screen need. Deterministic:
 * given the same selections and overrides it always returns the same model.
 */
export const buildReportModel = (ov: ContentOverrides, insp: Inspection): ReportModel => {
  const lines: ReportModel['lines'] = []
  for (const comp of COMPONENTS) {
    const entry = insp.data[comp.id]
    if (!entry?.done) continue
    const line = computeCostLine(ov, comp.id, entry)
    if (line) lines.push({ comp, entry, line })
  }

  const rowsFor = (bucket: BucketId): CostRow[] =>
    lines
      .filter((x) => x.line.bucket === bucket)
      .map((x) => ({
        item: `${x.comp.shortName}: ${actionPhrase(x.comp, x.entry, x.line)}`,
        basis: basis(x.line),
        cost: money(x.line.line),
        raw: x.line.line,
        sec: x.comp.secNo,
        bucket,
      }))

  const imm = rowsFor('imm')
  const short = rowsFor('short')
  const cap = rowsFor('cap')
  const sum = (rows: CostRow[]) => rows.reduce((n, r) => n + r.raw, 0)
  const immTotal = sum(imm)
  const shortTotal = sum(short)
  const capTotal = sum(cap)

  /* Reserves: every cost line, plus allowances for components that carry none. */
  const reserves: ReserveRow[] = lines.map((x) => ({
    component: reserveLabel(x.comp, x.entry),
    eul: x.line.eulLabel ?? String(x.line.eul),
    qty: basis(x.line).split(' @ ')[0],
    unit: rate(x.line.cost, x.line.unit),
    yr: `Yr ${x.line.year}`,
    year: x.line.year,
    cost: money(x.line.line),
    raw: x.line.line,
    sec: x.comp.secNo,
  }))

  for (const comp of COMPONENTS) {
    const entry = insp.data[comp.id]
    if (!entry?.done) continue
    const allowance = ALLOWANCES[comp.id]
    if (allowance && !computeCostLine(ov, comp.id, entry)) {
      const ce = entry.type ? costEntry(ov, comp.id, entry.type) : { eul: 25 }
      reserves.push({
        component: allowance.label,
        eul: String(ce.eul),
        qty: 'allowance',
        unit: 'n/a',
        yr: `Yr ${allowance.yr}`,
        year: allowance.yr,
        cost: money(allowance.amt),
        raw: allowance.amt,
        sec: comp.secNo,
      })
    }
  }
  reserves.sort((a, b) => a.year - b.year || b.raw - a.raw)

  const reservesByYear = Array.from({ length: 10 }, (_, i) =>
    reserves.filter((r) => r.year === i + 1).reduce((n, r) => n + r.raw, 0),
  )
  const reservesTotal = reserves.reduce((n, r) => n + r.raw, 0)

  /* Executive summary, composed from counts rather than invented prose. */
  const overall = overallCondition(insp)
  const parts: string[] = []
  if (imm.length) {
    parts.push(
      imm.length === 1
        ? `One immediate-need item was identified (${imm[0].item.split(':')[0].toLowerCase()})`
        : `${imm.length} immediate-need items were identified`,
    )
  }
  if (short.length) {
    parts.push(
      `${imm.length ? 'along with ' : ''}${
        short.length === 1 ? 'one short-term repair' : `${short.length} short-term repairs`
      }`,
    )
  }
  if (cap.length) parts.push(`${parts.length ? 'plus ' : ''}capital-plan items within the hold period`)
  const flagSentence = parts.length
    ? `${parts.join(', ')}.`
    : 'No immediate or short-term repair needs were identified.'
  const exec =
    `Based on the walk-through survey conducted by Sense Engineering, the subject property is in ` +
    `${overall.toLowerCase()} overall condition for its age. ${flagSentence} The observations and ` +
    `opinions of probable cost are summarized in the tables below and detailed in the sections that follow.`

  const p = insp.property
  const roofType = insp.data.roof?.type ?? ''
  const hvacType = insp.data.hvac?.type ?? ''
  const propDesc =
    `The subject property is a ${p.stories || 'multi'}-story, ${(p.type || 'commercial').toLowerCase()} ` +
    `building of approximately ${p.gba || '—'} gross square feet, constructed in ${p.year || '—'} on a ` +
    `${p.constr}. The roofing is ${ROOF_PHRASE[roofType] ?? 'a low-slope membrane system'}. Heating and ` +
    `cooling are provided by ${HVAC_PHRASE[hvacType] ?? 'packaged equipment'}. The building is served by ` +
    `municipal water, sanitary sewer, and electrical service.`

  /* Body sections, grouped by report group number. */
  const groupOrder: [string, string][] = []
  for (const comp of COMPONENTS) {
    if (!groupOrder.some(([no]) => no === comp.groupNo)) groupOrder.push([comp.groupNo, comp.group])
  }

  const groups: ReportGroup[] = []
  for (const [no, title] of groupOrder) {
    const subs: ReportSub[] = []
    for (const comp of COMPONENTS) {
      if (comp.groupNo !== no) continue
      const entry = insp.data[comp.id]
      const dc = insp.draft?.comps[comp.id]
      if (!entry?.done || !dc) continue
      const line = computeCostLine(ov, comp.id, entry)
      subs.push({
        id: comp.id,
        no: comp.secNo,
        title: comp.reportTitle,
        typeText: dc.desc,
        condId: entry.cond,
        condLabel: entry.cond ? CONDITION_BY_ID[entry.cond].label : '—',
        condNotes: dc.cond,
        concerns: dc.concerns.filter((t) => t.trim() !== ''),
        recText: dc.rec,
        hasCost: !!line,
        costText: line ? `${money(line.line)}   (${basis(line)})` : '',
        media: entry.media,
        figCaption:
          insp.figCaptions?.[comp.id] ?? `${comp.label} — representative condition photographs`,
      })
    }
    if (subs.length) groups.push({ no, title, subs })
  }

  return {
    overall,
    exec,
    propDesc,
    imm,
    short,
    cap,
    immTotal,
    shortTotal,
    capTotal,
    grandTotal: immTotal + shortTotal + capTotal,
    reserves,
    reservesTotal,
    reservesByYear,
    groups,
    lines,
  }
}

export const bucketLabel = (b: BucketId) => BUCKET_LABEL[b]

/* -------------------------------------------------------------------------- */
/* Portfolio analytics                                                         */
/* -------------------------------------------------------------------------- */

export interface PortfolioStats {
  /** Component count per condition, across every completed component. */
  conditionMix: { id: ConditionId; label: string; count: number }[]
  /** Identified spend per expenditure bucket. */
  bucketTotals: { id: BucketId; label: string; total: number }[]
  /** Ten-year reserve profile, summed across the portfolio. */
  reservesByYear: number[]
  /** Per-property identified spend, largest first. */
  byProperty: { id: string; name: string; total: number; overall: string }[]
  /** Spend per component category, largest first. */
  byComponent: { id: ComponentId; label: string; total: number }[]
  totalIdentified: number
  assessedCount: number
}

export const buildPortfolioStats = (
  ov: ContentOverrides,
  inspections: Inspection[],
): PortfolioStats => {
  const conditionCounts: Record<ConditionId, number> = { good: 0, fair: 0, poor: 0, failed: 0 }
  const bucketTotals: Record<BucketId, number> = { imm: 0, short: 0, cap: 0 }
  const componentTotals = new Map<ComponentId, number>()
  const reservesByYear = Array.from({ length: 10 }, () => 0)
  const byProperty: PortfolioStats['byProperty'] = []
  let totalIdentified = 0
  let assessedCount = 0

  for (const insp of inspections) {
    let propertyTotal = 0
    let touched = false
    for (const comp of COMPONENTS) {
      const entry = insp.data[comp.id]
      if (!entry?.done) continue
      touched = true
      if (entry.cond) conditionCounts[entry.cond]++
      const line = computeCostLine(ov, comp.id, entry)
      if (!line) continue
      bucketTotals[line.bucket] += line.line
      componentTotals.set(comp.id, (componentTotals.get(comp.id) ?? 0) + line.line)
      reservesByYear[line.year - 1] += line.line
      propertyTotal += line.line
    }
    if (touched) {
      assessedCount++
      totalIdentified += propertyTotal
      byProperty.push({
        id: insp.id,
        name: insp.property.name || 'Untitled property',
        total: propertyTotal,
        overall: overallCondition(insp),
      })
    }
  }

  byProperty.sort((a, b) => b.total - a.total)

  return {
    conditionMix: (['good', 'fair', 'poor', 'failed'] as ConditionId[]).map((id) => ({
      id,
      label: CONDITION_BY_ID[id].label,
      count: conditionCounts[id],
    })),
    bucketTotals: (['imm', 'short', 'cap'] as BucketId[]).map((id) => ({
      id,
      label: BUCKET_LABEL[id],
      total: bucketTotals[id],
    })),
    reservesByYear,
    byProperty,
    byComponent: [...componentTotals.entries()]
      .map(([id, total]) => ({ id, label: COMPONENT_BY_ID[id].label, total }))
      .sort((a, b) => b.total - a.total),
    totalIdentified,
    assessedCount,
  }
}
