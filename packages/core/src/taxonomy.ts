import type {
  ComponentDef,
  ComponentId,
  ConditionDef,
  ConditionId,
  RecommendationDef,
  RecommendationId,
  BucketId,
} from './types'

/**
 * The assessment taxonomy: which components get walked, what can be selected
 * for each, and the approved sentence behind every selection.
 *
 * This is Sense content, not application logic. Everything the generated
 * narrative can say traces back to a string in this file (or to an admin
 * override of one), which is what makes the draft auditable.
 */

export const COMPONENTS: ComponentDef[] = [
  {
    id: 'roof',
    label: 'Roof',
    mono: 'RF',
    secNo: '4.1',
    groupNo: '4.0',
    group: 'Frame and Envelope',
    reportTitle: 'Roofing',
    shortName: 'Roofing',
    unit: 'sq ft',
    hint: 'Walk the roof field and perimeter. Select the membrane type first.',
    types: ['TPO', 'Modified Bitumen', 'Built-up (BUR)', 'Shingle (asphalt)', 'Metal', 'Tile'],
    observations: [
      { key: 'ponding', label: 'Ponding areas', sentence: 'Multiple areas of past ponding observed across the roof field.' },
      { key: 'delam', label: 'Foam delamination', sentence: 'Foam delamination and exposure at several locations.' },
      { key: 'pillow', label: 'Pillowing / moisture', sentence: 'Minor pillowing at several locations, indicating moisture intrusion.' },
      { key: 'ridge', label: 'Membrane ridging', sentence: 'Membrane ridging noted under the coating.' },
      { key: 'seams', label: 'Open seams / flashing', sentence: 'Open seams and flashing gaps observed at penetrations.' },
      { key: 'drains', label: 'Clogged drains', sentence: 'Debris accumulation at roof drains restricting drainage.' },
      { key: 'clear', label: 'Field in good order', sentence: 'The roof field and perimeter flashings were observed to be in serviceable condition.', benign: true },
    ],
  },
  {
    id: 'paint',
    label: 'Exterior Paint',
    mono: 'PT',
    secNo: '4.2',
    groupNo: '4.0',
    group: 'Frame and Envelope',
    reportTitle: 'Facades: Exterior Paint and Sealant',
    shortName: 'Exterior paint / sealant',
    unit: 'sq ft',
    hint: 'Review all elevations for coating and sealant condition.',
    types: ['Acrylic / elastomeric', 'Latex', 'Stucco coating', 'Sealant / waterproofing'],
    observations: [
      { key: 'fade', label: 'Fading / chalking', sentence: 'Fading and chalking of the painted finish on exposed elevations.' },
      { key: 'sealant', label: 'Cracked sealant', sentence: 'Cracked and separating sealant at window perimeters and control joints.' },
      { key: 'crack', label: 'Hairline cracking', sentence: 'Hairline cracking of the finish; no structural cracking observed.' },
      { key: 'peel', label: 'Peeling / blistering', sentence: 'Localized peeling and blistering of the coating.' },
      { key: 'efflor', label: 'Efflorescence', sentence: 'Efflorescence staining at isolated locations.' },
      { key: 'rust', label: 'Rust staining', sentence: 'Rust staining at fasteners and embedded metals.' },
      { key: 'clear', label: 'No structural cracking', sentence: 'No structural cracking of the substrate was observed.', benign: true },
    ],
  },
  {
    id: 'windows',
    label: 'Windows',
    mono: 'WN',
    secNo: '4.3',
    groupNo: '4.0',
    group: 'Frame and Envelope',
    reportTitle: 'Windows',
    shortName: 'Windows',
    unit: 'each',
    hint: 'Sample representative units on each elevation and floor.',
    types: ['Single-hung', 'Double-hung', 'Storefront / curtain wall', 'Fixed', 'Casement', 'Impact-rated'],
    observations: [
      { key: 'gasket', label: 'Gasket wear', sentence: 'Isolated gasket wear at a small number of units.' },
      { key: 'fog', label: 'Fogged glazing', sentence: 'Fogged insulated glazing units observed.' },
      { key: 'broken', label: 'Broken / cracked glass', sentence: 'Broken or cracked glazing observed.' },
      { key: 'hardware', label: 'Hardware wear', sentence: 'Operable hardware wear at several units.' },
      { key: 'perim', label: 'Perimeter sealant failure', sentence: 'Perimeter sealant failure at several openings.' },
      { key: 'none', label: 'No infiltration reported', sentence: 'No air or water infiltration reported by management.', benign: true },
    ],
  },
  {
    id: 'doors',
    label: 'Doors',
    mono: 'DR',
    secNo: '5.1',
    groupNo: '5.0',
    group: 'Interior Elements',
    reportTitle: 'Doors',
    shortName: 'Doors',
    unit: 'each',
    hint: 'Check entrances, service doors and representative suite doors.',
    types: ['Hollow metal', 'Wood', 'Aluminum / glass entry', 'Fire-rated', 'Overhead / roll-up'],
    observations: [
      { key: 'finish', label: 'Finish wear', sentence: 'Minor finish wear on service doors.' },
      { key: 'hw', label: 'Hardware wear', sentence: 'Hardware wear requiring adjustment at several doors.' },
      { key: 'weather', label: 'Weatherstripping loss', sentence: 'Deteriorated weatherstripping at exterior doors.' },
      { key: 'align', label: 'Alignment / binding', sentence: 'Alignment issues causing binding at several doors.' },
      { key: 'closers', label: 'Closers functional', sentence: 'Door closers functional; entrance doors operate smoothly.', benign: true },
      { key: 'frames', label: 'Frames / hardware OK', sentence: 'No damaged frames or failed hardware observed.', benign: true },
    ],
  },
  {
    id: 'hvac',
    label: 'HVAC',
    mono: 'HV',
    secNo: '6.1',
    groupNo: '6.0',
    group: 'Plumbing, Mechanical and Electrical',
    reportTitle: 'Heating, Ventilation and Air Conditioning (HVAC)',
    shortName: 'HVAC',
    unit: 'each',
    hint: 'Record unit ages and nameplate data; note end-of-life equipment.',
    types: ['Split system', 'Packaged rooftop unit (RTU)', 'Chiller', 'Air handler', 'Mini-split'],
    observations: [
      { key: 'eol', label: 'End-of-life units', sentence: 'Units at the end of their expected useful life.' },
      { key: 'corr', label: 'Cabinet corrosion', sentence: 'Cabinet corrosion at panel seams.' },
      { key: 'refr', label: 'Refrigerant leaks', sentence: 'Refrigerant leaks reported by management.' },
      { key: 'cond', label: 'Condensate issues', sentence: 'Condensate management issues observed.' },
      { key: 'air', label: 'Airflow complaints', sentence: 'Airflow or comfort complaints reported.' },
      { key: 'ok', label: 'Remaining units OK', sentence: 'Remaining units operate adequately and are within service life.', benign: true },
    ],
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    mono: 'PL',
    secNo: '6.2',
    groupNo: '6.0',
    group: 'Plumbing, Mechanical and Electrical',
    reportTitle: 'Plumbing and Domestic Water',
    shortName: 'Plumbing',
    unit: 'each',
    hint: 'Inspect the water heater room, representative fixtures and visible piping.',
    types: ['Copper supply', 'CPVC supply', 'Galvanized supply', 'Cast iron waste', 'PVC waste'],
    observations: [
      { key: 'heater', label: 'Water heater at EOL', sentence: 'Domestic water heaters are at or near the end of their expected useful life.' },
      { key: 'corrosion', label: 'Pipe corrosion', sentence: 'Surface corrosion observed on exposed supply piping.' },
      { key: 'leaks', label: 'Active leaks', sentence: 'Active leaks observed at visible piping and connections.' },
      { key: 'pressure', label: 'Pressure complaints', sentence: 'Low water-pressure complaints reported by tenants.' },
      { key: 'fixtures', label: 'Fixture wear', sentence: 'General wear of plumbing fixtures consistent with age.' },
      { key: 'ok', label: 'No leaks observed', sentence: 'No active leaks or staining were observed at accessible piping.', benign: true },
    ],
  },
  {
    id: 'electrical',
    label: 'Electrical',
    mono: 'EL',
    secNo: '6.3',
    groupNo: '6.0',
    group: 'Plumbing, Mechanical and Electrical',
    reportTitle: 'Electrical Service and Distribution',
    shortName: 'Electrical',
    unit: 'each',
    hint: 'Review the main switchgear, panels and any tenant sub-panels.',
    types: ['Main switchgear', 'Panelboards', 'Bus duct', 'Transformer'],
    observations: [
      { key: 'obsolete', label: 'Obsolete equipment', sentence: 'Distribution equipment is obsolete and replacement parts are no longer readily available.' },
      { key: 'clearance', label: 'Working clearance', sentence: 'Working clearance in front of electrical equipment is obstructed.' },
      { key: 'labeling', label: 'Missing labeling', sentence: 'Panel schedules and circuit labeling are incomplete.' },
      { key: 'heat', label: 'Heat / discoloration', sentence: 'Discoloration consistent with heating observed at terminations.' },
      { key: 'capacity', label: 'Capacity constrained', sentence: 'Available spare capacity is limited for additional tenant load.' },
      { key: 'ok', label: 'Equipment serviceable', sentence: 'Electrical equipment appeared serviceable and adequately maintained.', benign: true },
    ],
  },
  {
    id: 'pavement',
    label: 'Site & Paving',
    mono: 'SP',
    secNo: '7.1',
    groupNo: '7.0',
    group: 'Site Improvements',
    reportTitle: 'Pavement, Curbing and Parking',
    shortName: 'Pavement',
    unit: 'sq yd',
    hint: 'Walk the drive aisles, parking bays, curbing and accessible routes.',
    types: ['Asphalt', 'Concrete', 'Paver', 'Chip seal'],
    observations: [
      { key: 'alligator', label: 'Alligator cracking', sentence: 'Alligator cracking observed in the drive aisles, indicating base failure.' },
      { key: 'potholes', label: 'Potholes', sentence: 'Potholes observed in the parking field.' },
      { key: 'striping', label: 'Faded striping', sentence: 'Pavement striping and accessible-stall markings are faded.' },
      { key: 'curb', label: 'Curb damage', sentence: 'Spalling and damage observed at concrete curbing.' },
      { key: 'ponding', label: 'Site ponding', sentence: 'Ponding observed in the parking field following rainfall.' },
      { key: 'ok', label: 'Surface serviceable', sentence: 'The pavement surface was observed to be in serviceable condition.', benign: true },
    ],
  },
]

export const COMPONENT_BY_ID: Record<ComponentId, ComponentDef> = Object.fromEntries(
  COMPONENTS.map((c) => [c.id, c]),
) as Record<ComponentId, ComponentDef>

export const CONDITIONS: ConditionDef[] = [
  {
    id: 'good',
    label: 'Good / New',
    meaning: 'No visible issues; near start of life',
    severity: 0,
    recs: ['none', 'routine'],
  },
  {
    id: 'fair',
    label: 'Fair',
    meaning: 'Functional, aging, watch item',
    severity: 1,
    recs: ['monitor', 'repair', 'plan-5-10'],
  },
  {
    id: 'poor',
    label: 'Poor',
    meaning: 'Deterioration, work needed soon',
    severity: 2,
    recs: ['repair-now', 'replace-now', 'replace-5'],
  },
  {
    id: 'failed',
    label: 'Failed / End of life',
    meaning: 'Not serviceable',
    severity: 3,
    recs: ['replace-now'],
  },
]

export const CONDITION_BY_ID: Record<ConditionId, ConditionDef> = Object.fromEntries(
  CONDITIONS.map((c) => [c.id, c]),
) as Record<ConditionId, ConditionDef>

export const RECOMMENDATIONS: RecommendationDef[] = [
  { id: 'none', label: 'No action', carriesCost: false, bucket: null, year: null },
  { id: 'routine', label: 'Routine maintenance', carriesCost: false, bucket: null, year: null },
  { id: 'monitor', label: 'Monitor', carriesCost: false, bucket: null, year: null },
  { id: 'repair', label: 'Repair', carriesCost: true, bucket: 'short', year: 1 },
  { id: 'repair-now', label: 'Repair now', carriesCost: true, bucket: 'imm', year: 1 },
  { id: 'replace-5', label: 'Replace within 5 yrs', carriesCost: true, bucket: 'cap', year: 3 },
  { id: 'replace-now', label: 'Replace immediately', carriesCost: true, bucket: 'imm', year: 1 },
  { id: 'plan-5-10', label: 'Plan replacement (5-10 yrs)', carriesCost: true, bucket: 'cap', year: 7 },
]

export const RECOMMENDATION_BY_ID: Record<RecommendationId, RecommendationDef> = Object.fromEntries(
  RECOMMENDATIONS.map((r) => [r.id, r]),
) as Record<RecommendationId, RecommendationDef>

export const BUCKET_LABEL: Record<BucketId, string> = {
  imm: 'Immediate Needs',
  short: 'Short-Term Costs (1 to 2 years)',
  cap: 'Capital Plan (3 to 10 years)',
}

export const BUCKET_SHORT: Record<BucketId, string> = {
  imm: 'Immediate',
  short: 'Short-term',
  cap: 'Capital plan',
}

export const BUCKET_ORDER: BucketId[] = ['imm', 'short', 'cap']

export const STATUS_LABEL = {
  scheduled: 'Scheduled',
  field: 'In field',
  ready: 'Ready to generate',
  review: 'Awaiting review',
  approved: 'Approved',
} as const

/** Ten-year reserve allowances applied when a component carries no repair cost. */
export const ALLOWANCES: Partial<Record<ComponentId, { label: string; yr: number; amt: number }>> = {
  windows: { label: 'Windows (gasket renewal allowance)', yr: 8, amt: 6000 },
  doors: { label: 'Doors (entrance refurbishment allowance)', yr: 9, amt: 8000 },
  pavement: { label: 'Pavement (seal coat and restriping allowance)', yr: 5, amt: 12000 },
}
