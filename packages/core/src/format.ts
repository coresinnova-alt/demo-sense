import type { CostLine, Unit } from './types'

export const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`

/** Compact money for axis ticks and dense tiles: $1.2M / $84k / $940. */
export const moneyShort = (n: number): string => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`
  if (abs >= 1_000) return `$${Math.round(n / 1000)}k`
  return `$${Math.round(n)}`
}

export const UNIT_ABBR: Record<Unit, string> = {
  'sq ft': 'SF',
  'sq yd': 'SY',
  'linear ft': 'LF',
  each: 'unit',
}

/** Per-unit rate. Area units read as a decimal rate, discrete units as a total. */
export const rate = (cost: number, unit: Unit): string =>
  unit === 'each' ? money(cost) : `$${cost.toFixed(2)}/${UNIT_ABBR[unit]}`

/** Human-readable cost basis, e.g. "11,500 SF @ $5.00/SF" or "2 units". */
export const basis = (line: CostLine | null): string => {
  if (!line) return ''
  const qty = line.qty.toLocaleString('en-US')
  if (line.unit === 'each') return `${qty} unit${line.qty === 1 ? '' : 's'}`
  return `${qty} ${UNIT_ABBR[line.unit]} @ ${rate(line.cost, line.unit)}`
}

/** Elapsed generation time, e.g. "2m 41s". */
export const duration = (ms: number): string => {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`
}

export const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const longDate = (d: Date = new Date()): string =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export const timestamp = (d: Date = new Date()): string =>
  `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit' },
  )}`

/** "Today" / "Yesterday" / "Jun 30" for list rows. */
export const relativeDay = (iso: string): string => {
  const then = new Date(iso)
  const now = new Date()
  const days = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) /
      86_400_000,
  )
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return shortDate(iso)
}

export const pluralize = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many)
