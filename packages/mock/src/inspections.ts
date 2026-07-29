import { COMPONENTS } from '@sense/core'
import type { ComponentEntry, ComponentId, Inspection, MediaAsset, MediaKind } from '@sense/core'

/* Fixtures are written relative to "today" so the demo never looks stale. */
const day = 86_400_000
const now = Date.now()
const iso = (daysAgo: number) => new Date(now - daysAgo * day).toISOString()
const longDate = (daysAgo: number) =>
  new Date(now - daysAgo * day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

let mediaSeq = 0
const asset = (
  kind: MediaKind,
  name: string,
  label: string,
  extra: Partial<MediaAsset> = {},
): MediaAsset => ({
  id: `md-${++mediaSeq}`,
  kind,
  name,
  label,
  seed: (mediaSeq * 2654435761) % 100000,
  ...extra,
})

const photo = (name: string, label: string, capturedOffline = false) =>
  asset('photo', name, label, { capturedOffline })

const video = (name: string, label: string, durationSec: number, capturedOffline = false) =>
  asset('video', name, label, { durationSec, capturedOffline })

const voice = (name: string, label: string, durationSec: number, transcript: string) =>
  asset('audio', name, label, { durationSec, transcript })

const blankEntry = (): ComponentEntry => ({
  done: false,
  type: null,
  cond: null,
  rec: null,
  qty: null,
  obs: [],
  media: [],
})

/** Every inspection carries an entry for every component, complete or not. */
const blankData = (): Record<ComponentId, ComponentEntry> =>
  Object.fromEntries(COMPONENTS.map((c) => [c.id, blankEntry()])) as Record<
    ComponentId,
    ComponentEntry
  >

const withData = (
  filled: Partial<Record<ComponentId, Partial<ComponentEntry>>>,
): Record<ComponentId, ComponentEntry> => {
  const data = blankData()
  for (const [id, patch] of Object.entries(filled)) {
    data[id as ComponentId] = { ...data[id as ComponentId], ...patch, done: true }
  }
  return data
}

/* -------------------------------------------------------------------------- */

/** Delivered last month — the reference "what good looks like" report. */
const bayview: Inspection = {
  id: 'INS-2026-0142',
  proj: 'SE-2026-0142',
  setupDone: true,
  status: 'approved',
  assignee: 'Marco Torres',
  property: {
    name: 'Bayview Professional Center',
    addr: '1450 Brickell Avenue, Miami, FL 33131',
    type: 'Multi-tenant office',
    year: '1998',
    gba: '42,000',
    client: 'Meridian Capital Partners',
    stories: 'four',
    constr: 'concrete masonry unit and steel frame with a stucco exterior',
  },
  inspectedOn: longDate(34),
  reportDate: longDate(28),
  updated: 'Jun 30',
  updatedAt: iso(28),
  data: withData({
    roof: {
      type: 'Built-up (BUR)',
      cond: 'poor',
      rec: 'replace-now',
      qty: 11500,
      obs: ['ponding', 'delam', 'pillow', 'ridge'],
      media: [
        photo('roof_01.jpg', 'Roof field — ponding', true),
        photo('roof_02.jpg', 'Foam delamination', true),
        photo('roof_03.jpg', 'Pillowing at membrane', true),
        video('roof_04.mp4', 'Roof field walk-through, north to south', 42, true),
        voice(
          'roof_05.m4a',
          'Inspector note — membrane condition',
          31,
          'Walking the roof field now. Ponding across most of the north half, foam coating has delaminated in at least four places, and there is clear pillowing near the drains. This membrane is past its life — recommending full replacement, not a recoat.',
        ),
      ],
    },
    paint: {
      type: 'Acrylic / elastomeric',
      cond: 'fair',
      rec: 'repair',
      qty: 18000,
      obs: ['fade', 'sealant', 'crack'],
      media: [
        photo('paint_01.jpg', 'South elevation fading', true),
        photo('paint_02.jpg', 'Cracked perimeter sealant'),
      ],
    },
    windows: {
      type: 'Impact-rated',
      cond: 'good',
      rec: 'routine',
      obs: ['gasket', 'none'],
      media: [photo('win_01.jpg', 'Representative window ribbon')],
    },
    doors: {
      type: 'Aluminum / glass entry',
      cond: 'good',
      rec: 'routine',
      obs: ['finish', 'closers', 'frames'],
      media: [photo('door_01.jpg', 'Main storefront entrance')],
    },
    hvac: {
      type: 'Packaged rooftop unit (RTU)',
      cond: 'fair',
      rec: 'repair',
      qty: 2,
      obs: ['eol', 'corr', 'ok'],
      media: [
        photo('hvac_01.jpg', 'RTU cabinet corrosion'),
        voice(
          'hvac_02.m4a',
          'Inspector note — unit ages',
          18,
          'Two of the original packaged units are still up here, both showing cabinet corrosion at the seams. The rest were replaced between 2019 and 2021 and look fine.',
        ),
      ],
    },
    plumbing: {
      type: 'Copper supply',
      cond: 'good',
      rec: 'routine',
      obs: ['fixtures', 'ok'],
      media: [photo('plumb_01.jpg', 'Water heater room')],
    },
    electrical: {
      type: 'Panelboards',
      cond: 'fair',
      rec: 'monitor',
      obs: ['labeling', 'capacity'],
      media: [photo('elec_01.jpg', 'Main distribution panel')],
    },
    pavement: {
      type: 'Asphalt',
      cond: 'poor',
      rec: 'repair-now',
      qty: 2400,
      obs: ['alligator', 'striping', 'curb'],
      media: [
        photo('pave_01.jpg', 'Alligator cracking, east aisle'),
        photo('pave_02.jpg', 'Faded accessible-stall striping'),
        video('pave_03.mp4', 'Drive aisle pan showing cracking extent', 26),
      ],
    },
  }),
  figCaptions: {
    roof: 'Typical roof surface showing ponding, foam delamination, and pillowing',
    paint: 'South elevation showing paint fading and cracked perimeter sealant',
    windows: 'Representative window ribbon, glazing and gaskets in serviceable condition',
    doors: 'Main storefront entrance, doors and hardware operating properly',
    hvac: 'Roof-mounted packaged unit showing cabinet corrosion at panel seams',
    plumbing: 'Domestic water heaters and copper supply piping in the service room',
    electrical: 'Main distribution panelboards with incomplete circuit labeling',
    pavement: 'East drive aisle showing alligator cracking and faded striping',
  },
  draft: {
    mode: 'grounded-local',
    genMs: 161_000,
    generatedAt: iso(34),
    comps: {
      roof: {
        desc: 'Low-slope, built-up roof (BUR) membrane with a foam coating and elastomeric finish; internal roof drains and metal parapet coping.',
        cond: 'Original membrane in excess of 20 years old; foam coating reportedly applied 2007.',
        rec: 'Based on the observed conditions and the expected useful life of the system, replacement of the built-up roof membrane is recommended immediately. A coating is not advised as the underlying membrane has deteriorated. The opinion of probable cost is carried to the Immediate Needs table.',
        concerns: [
          'Multiple areas of past ponding observed across the roof field.',
          'Foam delamination and exposure at several locations.',
          'Minor pillowing at five to six locations, indicating moisture intrusion.',
          'Membrane ridging noted under the coating.',
        ],
        approved: true,
        edited: {},
      },
      paint: {
        desc: 'Painted stucco exterior with sealant at joints and partial glass curtain wall at the main entrance.',
        cond: 'Exterior reportedly last painted 2018.',
        rec: 'Recoat the faded elevations and replace deteriorated perimeter sealant within the short term to protect the envelope from moisture intrusion. Cost carried to the Short-Term Costs table.',
        concerns: [
          'Fading and chalking of the painted stucco on the south and west elevations.',
          'Cracked and separating sealant at several window perimeters and control joints.',
          'No structural cracking of the stucco observed.',
        ],
        approved: true,
        edited: {},
      },
      windows: {
        desc: 'Fixed and operable aluminum-framed, double-glazed windows, organized in horizontal ribbons; impact-rated units at lower floors.',
        cond: 'Original to construction; glazing gaskets serviceable.',
        rec: 'No immediate or short-term repairs required. Monitor gaskets and address as part of routine maintenance. No cost carried.',
        concerns: [
          'No broken or fogged glazing observed.',
          'Isolated gasket wear at a small number of units, addressable as routine maintenance.',
          'No air or water infiltration reported by management.',
        ],
        approved: true,
        edited: {},
      },
      doors: {
        desc: 'Aluminum-and-glass storefront entrance doors; hollow-metal service and stair doors; solid-core wood tenant-suite doors.',
        cond: 'Storefront entrance reportedly refurbished 2019.',
        rec: 'No immediate or short-term repairs required. Finish wear may be addressed as routine maintenance. No cost carried.',
        concerns: [
          'Entrance doors operate smoothly; closers functional.',
          'Minor finish wear on a few service doors.',
          'No damaged frames or failed hardware observed.',
        ],
        approved: true,
        edited: {},
      },
      hvac: {
        desc: 'Roof-mounted packaged units (RTUs) serving upper floors and split systems serving lower floors; R-410A refrigerant.',
        cond: 'Mixed ages; several units replaced 2019 to 2021, two original units remain.',
        rec: 'Replace the two end-of-life packaged units within the short term. Maintain remaining units under the existing service contract. Cost carried to the Short-Term Costs table.',
        concerns: [
          'Two original packaged units are at the end of their expected useful life and show corrosion.',
          'Remaining units operate adequately and are within service life.',
          'No tenant comfort complaints reported.',
        ],
        approved: true,
        edited: {},
      },
      plumbing: {
        desc: 'Copper domestic water supply piping with gas-fired water heaters serving the occupied floors.',
        cond: 'Water heaters reportedly replaced 2021; supply piping original to construction.',
        rec: 'No immediate or short-term repairs required. General fixture wear may be addressed as part of routine maintenance. No cost carried.',
        concerns: [
          'General wear of plumbing fixtures consistent with age.',
          'No active leaks or staining were observed at accessible piping.',
        ],
        approved: true,
        edited: {},
      },
      electrical: {
        desc: 'Circuit-breaker panelboards serving house and tenant loads, fed from the main distribution section.',
        cond: 'Original distribution equipment; house panels reportedly upgraded 2015.',
        rec: 'Monitor the condition and address findings as part of routine maintenance. Complete panel schedules as a housekeeping item. No cost carried at this time.',
        concerns: [
          'Panel schedules and circuit labeling are incomplete.',
          'Available spare capacity is limited for additional tenant load.',
        ],
        approved: true,
        edited: {},
      },
      pavement: {
        desc: 'Asphalt-paved drive aisles and parking field with concrete curbing and painted striping.',
        cond: 'Original asphalt; last seal coat reportedly 2016.',
        rec: 'Immediate repair of the deficient areas is recommended, including mill-and-overlay of the failed drive aisle and restriping of accessible stalls. Cost carried to the Immediate Needs table.',
        concerns: [
          'Alligator cracking observed in the drive aisles, indicating base failure.',
          'Pavement striping and accessible-stall markings are faded.',
          'Spalling and damage observed at concrete curbing.',
        ],
        approved: true,
        edited: {},
      },
    },
  },
}

/** Drafted, sitting with the reviewer — the "review me" demo path. */
const coralGables: Inspection = {
  id: 'INS-2026-0157',
  proj: 'SE-2026-0157',
  setupDone: true,
  status: 'review',
  assignee: 'Marco Torres',
  property: {
    name: 'Coral Gables Medical Plaza',
    addr: '2801 Salzedo Street, Coral Gables, FL 33134',
    type: 'Medical office',
    year: '2004',
    gba: '28,500',
    client: 'Palmline Health Partners',
    stories: 'three',
    constr: 'cast-in-place concrete frame with a stucco exterior',
  },
  inspectedOn: longDate(4),
  reportDate: null,
  updated: 'Jul 3',
  updatedAt: iso(3),
  data: withData({
    roof: {
      type: 'TPO',
      cond: 'fair',
      rec: 'monitor',
      obs: ['drains'],
      media: [photo('roof_01.jpg', 'TPO field at drains'), photo('roof_02.jpg', 'Roof overview')],
    },
    paint: {
      type: 'Stucco coating',
      cond: 'fair',
      rec: 'repair',
      qty: 9500,
      obs: ['crack', 'sealant'],
      media: [photo('paint_01.jpg', 'Hairline cracking, west')],
    },
    windows: {
      type: 'Storefront / curtain wall',
      cond: 'fair',
      rec: 'monitor',
      obs: ['hardware'],
      media: [photo('win_01.jpg', 'Storefront glazing')],
    },
    doors: {
      type: 'Hollow metal',
      cond: 'good',
      rec: 'routine',
      obs: ['finish', 'frames'],
      media: [photo('door_01.jpg', 'Service corridor doors')],
    },
    hvac: {
      type: 'Split system',
      cond: 'poor',
      rec: 'replace-5',
      qty: 4,
      obs: ['eol', 'refr'],
      media: [
        photo('hvac_01.jpg', 'Condensing units, roof'),
        photo('hvac_02.jpg', 'Nameplate detail'),
        video('hvac_03.mp4', 'Condensing unit bank, roof level', 19),
        voice(
          'hvac_04.m4a',
          'Inspector note — refrigerant leaks',
          24,
          'Management reports recurring refrigerant leaks on the split systems. Four units are at end of life. Recommending replacement within five years, carried to the capital plan.',
        ),
      ],
    },
    plumbing: {
      type: 'CPVC supply',
      cond: 'fair',
      rec: 'repair',
      qty: 3,
      obs: ['heater', 'pressure'],
      media: [photo('plumb_01.jpg', 'Water heaters at end of life')],
    },
    electrical: {
      type: 'Main switchgear',
      cond: 'fair',
      rec: 'plan-5-10',
      qty: 1,
      obs: ['obsolete', 'labeling'],
      media: [photo('elec_01.jpg', 'Main switchgear section')],
    },
    pavement: {
      type: 'Concrete',
      cond: 'good',
      rec: 'routine',
      obs: ['ok'],
      media: [photo('pave_01.jpg', 'Parking field overview')],
    },
  }),
  draft: null,
}

/** Half-walked — resumes mid-intake to show the offline field flow. */
const wynwood: Inspection = {
  id: 'INS-2026-0163',
  proj: 'SE-2026-0163',
  setupDone: true,
  status: 'field',
  assignee: 'Marco Torres',
  property: {
    name: 'Wynwood Lofts',
    addr: '2210 NW 2nd Avenue, Miami, FL 33127',
    type: 'Mixed-use residential',
    year: '2016',
    gba: '61,200',
    client: 'Harbor Peak Investments',
    stories: 'eight',
    constr: 'reinforced concrete frame with painted stucco and metal panel exterior',
  },
  inspectedOn: longDate(1),
  reportDate: null,
  updated: 'Yesterday',
  updatedAt: iso(1),
  data: withData({
    roof: {
      type: 'TPO',
      cond: 'fair',
      rec: 'monitor',
      obs: ['drains'],
      media: [
        photo('roof_01.jpg', 'TPO field', true),
        video('roof_02.mp4', 'TPO field sweep', 33, true),
      ],
    },
    paint: {
      type: 'Latex',
      cond: 'fair',
      rec: 'repair',
      qty: 6400,
      obs: ['fade'],
      media: [photo('paint_01.jpg', 'North elevation fading', true)],
    },
    windows: {
      type: 'Impact-rated',
      cond: 'good',
      rec: 'none',
      obs: ['none'],
      media: [photo('win_01.jpg', 'Typical window bay', true)],
    },
  }),
  draft: null,
}

/** Not started — the "start an inspection" demo path. */
const aventura: Inspection = {
  id: 'INS-2026-0168',
  proj: 'SE-2026-0168',
  setupDone: true,
  status: 'scheduled',
  assignee: 'Marco Torres',
  property: {
    name: 'Aventura Retail Center',
    addr: '19501 Biscayne Blvd, Aventura, FL 33180',
    type: 'Retail strip center',
    year: '2001',
    gba: '35,700',
    client: 'Solstice Retail Group',
    stories: 'one',
    constr: 'CMU bearing walls with steel joists and a stucco finish',
  },
  inspectedOn: `Scheduled ${longDate(-3)}`,
  reportDate: null,
  updated: 'Jul 1',
  updatedAt: iso(5),
  data: blankData(),
  draft: null,
}

/** A second approved report, so the portfolio view has real spread. */
const doralLogistics: Inspection = {
  id: 'INS-2026-0129',
  proj: 'SE-2026-0129',
  setupDone: true,
  status: 'approved',
  assignee: 'Ethos Delgado',
  property: {
    name: 'Doral Logistics Park — Building C',
    addr: '8400 NW 33rd Street, Doral, FL 33122',
    type: 'Industrial / warehouse',
    year: '1989',
    gba: '96,400',
    client: 'Northgate Industrial Trust',
    stories: 'one',
    constr: 'tilt-up concrete panels with a steel joist roof structure',
  },
  inspectedOn: longDate(62),
  reportDate: longDate(55),
  updated: 'May 28',
  updatedAt: iso(55),
  data: withData({
    roof: {
      type: 'Modified Bitumen',
      cond: 'failed',
      rec: 'replace-now',
      qty: 96400,
      obs: ['seams', 'ponding', 'drains'],
      media: [
        photo('roof_01.jpg', 'Open seams at penetrations'),
        photo('roof_02.jpg', 'Standing water'),
        video('roof_03.mp4', 'Full roof walk, seam failures', 58),
        voice(
          'roof_04.m4a',
          'Inspector note — end of life',
          22,
          'Seams are open at nearly every penetration and there is standing water two days after rain. This roof has failed. Immediate replacement across the full ninety-six thousand square feet.',
        ),
      ],
    },
    paint: {
      type: 'Sealant / waterproofing',
      cond: 'poor',
      rec: 'repair-now',
      qty: 21000,
      obs: ['sealant', 'efflor', 'rust'],
      media: [photo('paint_01.jpg', 'Failed panel joint sealant')],
    },
    windows: {
      type: 'Fixed',
      cond: 'good',
      rec: 'routine',
      obs: ['none'],
      media: [photo('win_01.jpg', 'Office storefront')],
    },
    doors: {
      type: 'Overhead / roll-up',
      cond: 'fair',
      rec: 'repair',
      qty: 14,
      obs: ['hw', 'align'],
      media: [photo('door_01.jpg', 'Dock door binding')],
    },
    hvac: {
      type: 'Mini-split',
      cond: 'fair',
      rec: 'plan-5-10',
      qty: 8,
      obs: ['air', 'ok'],
      media: [photo('hvac_01.jpg', 'Office mini-split heads')],
    },
    plumbing: {
      type: 'Galvanized supply',
      cond: 'poor',
      rec: 'replace-5',
      qty: 2,
      obs: ['corrosion', 'pressure'],
      media: [photo('plumb_01.jpg', 'Corroded galvanized riser')],
    },
    electrical: {
      type: 'Bus duct',
      cond: 'fair',
      rec: 'monitor',
      obs: ['labeling', 'clearance'],
      media: [photo('elec_01.jpg', 'Bus duct riser')],
    },
    pavement: {
      type: 'Asphalt',
      cond: 'poor',
      rec: 'replace-5',
      qty: 9800,
      obs: ['potholes', 'alligator', 'ponding'],
      media: [photo('pave_01.jpg', 'Truck court pavement failure')],
    },
  }),
  draft: null,
}

export const seedInspections = (): Inspection[] => [
  wynwood,
  coralGables,
  aventura,
  bayview,
  doralLogistics,
]
