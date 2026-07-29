/** Domain types for a Property Condition Assessment (ASTM E2018). */

export type ComponentId =
  | 'roof'
  | 'paint'
  | 'windows'
  | 'doors'
  | 'hvac'
  | 'plumbing'
  | 'electrical'
  | 'pavement'

export type ConditionId = 'good' | 'fair' | 'poor' | 'failed'

export type RecommendationId =
  | 'none'
  | 'routine'
  | 'monitor'
  | 'repair'
  | 'repair-now'
  | 'replace-5'
  | 'replace-now'
  | 'plan-5-10'

export type BucketId = 'imm' | 'short' | 'cap'

export type InspectionStatus = 'scheduled' | 'field' | 'ready' | 'review' | 'approved'

export type RoleId = 'inspector' | 'reviewer' | 'admin'

export type Unit = 'sq ft' | 'each' | 'sq yd' | 'linear ft'

export interface Observation {
  /** Stable key stored on the inspection record. */
  key: string
  /** Short label shown on the intake chip. */
  label: string
  /** Approved sentence injected into the report narrative. */
  sentence: string
  /**
   * Observations that describe an absence of defects. Used to keep "no issues
   * found" bullets out of the red/yellow flag roll-up.
   */
  benign?: boolean
}

export interface ComponentDef {
  id: ComponentId
  /** Display name in the field app. */
  label: string
  /** Two-letter monogram used in dense lists. */
  mono: string
  /** Report section number, e.g. "4.1". */
  secNo: string
  /** Parent group number, e.g. "4.0". */
  groupNo: string
  /** Parent group title. */
  group: string
  /** Heading used in the report body. */
  reportTitle: string
  /** Compact name used in cost tables. */
  shortName: string
  unit: Unit
  /** Guidance shown to the inspector at the top of the step. */
  hint: string
  /** Selectable system types; drives the cost book and the description snippet. */
  types: string[]
  observations: Observation[]
}

export interface ConditionDef {
  id: ConditionId
  label: string
  /** Plain-language meaning shown next to the choice. */
  meaning: string
  /** Recommendations permitted for this condition. */
  recs: RecommendationId[]
  /** Ordinal severity, 0 = best. Used for sorting and roll-ups. */
  severity: 0 | 1 | 2 | 3
}

export interface RecommendationDef {
  id: RecommendationId
  label: string
  /** Whether a quantity + cost line is required. */
  carriesCost: boolean
  /** Which expenditure table the cost lands in. */
  bucket: BucketId | null
  /** Year the expenditure is placed in the reserves table. */
  year: number | null
}

export interface CostBookEntry {
  /** Unit cost in USD. */
  cost: number
  /** Expected useful life, years. */
  eul: number
  /** Optional display override, e.g. "20-25". */
  eulLabel?: string
}

export interface Photo {
  id: string
  name: string
  /** Caption derived from the observation selected when it was captured. */
  label: string
  /** Deterministic seed for the generated placeholder thumbnail. */
  seed: number
  capturedOffline?: boolean
}

/** What the inspector recorded in the field for one component. */
export interface ComponentEntry {
  done: boolean
  type: string | null
  cond: ConditionId | null
  rec: RecommendationId | null
  qty: number | null
  obs: string[]
  photos: Photo[]
  /** Free-text note the inspector can add on site. */
  note?: string
}

/** The generated narrative for one component, post-editing. */
export interface DraftComponent {
  desc: string
  cond: string
  rec: string
  concerns: string[]
  approved: boolean
  edited: Partial<Record<DraftField, boolean>>
}

export type DraftField = 'desc' | 'cond' | 'concerns' | 'rec'

export interface Draft {
  mode: 'grounded-local'
  genMs: number
  generatedAt: string
  comps: Partial<Record<ComponentId, DraftComponent>>
}

export interface PropertyMeta {
  name: string
  addr: string
  type: string
  year: string
  gba: string
  client: string
  stories: string
  constr: string
}

export interface Inspection {
  id: string
  proj: string
  setupDone: boolean
  status: InspectionStatus
  property: PropertyMeta
  inspectedOn: string
  reportDate: string | null
  updated: string
  /** Sort key; ISO date of last change. */
  updatedAt: string
  assignee: string
  data: Record<ComponentId, ComponentEntry>
  figCaptions?: Partial<Record<ComponentId, string>>
  draft: Draft | null
}

export interface AuditEntry {
  id: string
  ts: string
  user: string
  action: string
  detail: string
  off: boolean
}

export interface User {
  role: RoleId
  label: string
  name: string
  title: string
  initials: string
  desc: string
  email: string
}

/* -------------------------------------------------------------------------- */
/* Derived shapes produced by the engine                                       */
/* -------------------------------------------------------------------------- */

export interface CostLine {
  qty: number
  unit: Unit
  /** Unit cost after any admin override. */
  cost: number
  /** qty x cost, rounded. */
  line: number
  eul: number
  eulLabel?: string
  bucket: BucketId
  year: number
}

export interface CostRow {
  item: string
  basis: string
  cost: string
  raw: number
  sec: string
  bucket: BucketId
}

export interface ReserveRow {
  component: string
  eul: string
  qty: string
  unit: string
  yr: string
  year: number
  cost: string
  raw: number
  sec: string
}

export interface ReportSub {
  id: ComponentId
  no: string
  title: string
  typeText: string
  condId: ConditionId | null
  condLabel: string
  condNotes: string
  concerns: string[]
  recText: string
  hasCost: boolean
  costText: string
  photos: Photo[]
  figCaption: string
}

export interface ReportGroup {
  no: string
  title: string
  subs: ReportSub[]
}

export interface ReportModel {
  overall: string
  exec: string
  propDesc: string
  imm: CostRow[]
  short: CostRow[]
  cap: CostRow[]
  immTotal: number
  shortTotal: number
  capTotal: number
  grandTotal: number
  reserves: ReserveRow[]
  reservesTotal: number
  /** Ten-year projection, index 0 = year 1. */
  reservesByYear: number[]
  groups: ReportGroup[]
  lines: { comp: ComponentDef; entry: ComponentEntry; line: CostLine }[]
}

export interface Flag {
  id: ComponentId
  title: string
  sub: string
  severity: number
}

export interface FlagSummary {
  red: Flag[]
  yellow: Flag[]
  clear: string[]
}

/** Admin overrides layered on top of the seeded content. */
export interface ContentOverrides {
  /** Approved-language snippet overrides, keyed by snippet ref. */
  snippets: Record<string, string>
  /** Unit-cost overrides, keyed by `componentId|type`. */
  costs: Record<string, number>
  /** EUL overrides, keyed by `componentId|type`. */
  euls: Record<string, number>
}
