import type { CostBookEntry } from './types'

/**
 * Seeded RSMeans-style unit costs, keyed by `componentId|type`.
 *
 * Costs are looked up and multiplied — never generated. The admin screen can
 * override any unit cost or EUL, and every override is written to the audit log.
 */
export const COST_BOOK: Record<string, CostBookEntry> = {
  'roof|TPO': { cost: 12.0, eul: 20 },
  'roof|Modified Bitumen': { cost: 9.5, eul: 18 },
  'roof|Built-up (BUR)': { cost: 5.0, eul: 25, eulLabel: '20-25' },
  'roof|Shingle (asphalt)': { cost: 6.5, eul: 15 },
  'roof|Metal': { cost: 14.0, eul: 25 },
  'roof|Tile': { cost: 18.0, eul: 25 },

  'paint|Acrylic / elastomeric': { cost: 1.1, eul: 7 },
  'paint|Latex': { cost: 0.85, eul: 7 },
  'paint|Stucco coating': { cost: 1.6, eul: 12 },
  'paint|Sealant / waterproofing': { cost: 2.25, eul: 8 },

  'windows|Single-hung': { cost: 650, eul: 25 },
  'windows|Double-hung': { cost: 750, eul: 25 },
  'windows|Storefront / curtain wall': { cost: 2400, eul: 30 },
  'windows|Fixed': { cost: 500, eul: 25 },
  'windows|Casement': { cost: 820, eul: 25 },
  'windows|Impact-rated': { cost: 1350, eul: 25 },

  'doors|Hollow metal': { cost: 980, eul: 25 },
  'doors|Wood': { cost: 650, eul: 20 },
  'doors|Aluminum / glass entry': { cost: 3200, eul: 15 },
  'doors|Fire-rated': { cost: 1450, eul: 25 },
  'doors|Overhead / roll-up': { cost: 2800, eul: 20 },

  'hvac|Split system': { cost: 6400, eul: 15 },
  'hvac|Packaged rooftop unit (RTU)': { cost: 10800, eul: 20 },
  'hvac|Chiller': { cost: 85000, eul: 20 },
  'hvac|Air handler': { cost: 14500, eul: 20 },
  'hvac|Mini-split': { cost: 3800, eul: 12 },

  'plumbing|Copper supply': { cost: 4200, eul: 40 },
  'plumbing|CPVC supply': { cost: 3100, eul: 30 },
  'plumbing|Galvanized supply': { cost: 5600, eul: 40 },
  'plumbing|Cast iron waste': { cost: 6800, eul: 50 },
  'plumbing|PVC waste': { cost: 3400, eul: 40 },

  'electrical|Main switchgear': { cost: 48000, eul: 30 },
  'electrical|Panelboards': { cost: 7200, eul: 30 },
  'electrical|Bus duct': { cost: 26000, eul: 35 },
  'electrical|Transformer': { cost: 32000, eul: 30 },

  'pavement|Asphalt': { cost: 42, eul: 20 },
  'pavement|Concrete': { cost: 78, eul: 30 },
  'pavement|Paver': { cost: 96, eul: 30 },
  'pavement|Chip seal': { cost: 24, eul: 10 },
}

export const costKey = (componentId: string, type: string) => `${componentId}|${type}`
