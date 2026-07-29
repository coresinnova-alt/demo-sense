/**
 * Design tokens, exposed to TypeScript.
 *
 * Values are `var(--token)` references rather than literal hex, so anything
 * drawn from them (inline SVG marks, canvas fallbacks, style attributes)
 * re-themes automatically when `.dark` is toggled on <html>. The literal hex
 * lives in one place only: `theme.css`.
 */

export const surface = {
  page: 'var(--srf-page)',
  card: 'var(--srf-card)',
  subtle: 'var(--srf-subtle)',
  inset: 'var(--srf-inset)',
} as const

export const ink = {
  primary: 'var(--ink-1)',
  secondary: 'var(--ink-2)',
  muted: 'var(--ink-3)',
} as const

/**
 * Categorical chart slots, in fixed order. Assign by entity, never by rank,
 * and never cycle past the last slot — fold extra series into "Other" or facet.
 */
export const vizCategorical = [
  'var(--viz-1)',
  'var(--viz-2)',
  'var(--viz-3)',
  'var(--viz-4)',
  'var(--viz-5)',
] as const

/** Single-hue ramp, light -> dark, for continuous magnitude. */
export const vizSequential = [
  'var(--viz-seq-1)',
  'var(--viz-seq-2)',
  'var(--viz-seq-3)',
  'var(--viz-seq-4)',
  'var(--viz-seq-5)',
  'var(--viz-seq-6)',
  'var(--viz-seq-7)',
] as const

export const vizChrome = {
  grid: 'var(--viz-grid)',
  axis: 'var(--viz-axis)',
  surface: 'var(--viz-surface)',
} as const

export type ConditionKey = 'good' | 'fair' | 'poor' | 'failed'

/** Ordered status palette. Always rendered alongside its text label. */
export const conditionColor: Record<ConditionKey, { fg: string; tint: string }> = {
  good: { fg: 'var(--cond-good)', tint: 'var(--cond-good-tint)' },
  fair: { fg: 'var(--cond-fair)', tint: 'var(--cond-fair-tint)' },
  poor: { fg: 'var(--cond-poor)', tint: 'var(--cond-poor-tint)' },
  failed: { fg: 'var(--cond-failed)', tint: 'var(--cond-failed-tint)' },
}

export type BucketKey = 'imm' | 'short' | 'cap'

export const bucketColor: Record<BucketKey, { fg: string; tint: string }> = {
  imm: { fg: 'var(--bucket-imm)', tint: 'var(--bucket-imm-tint)' },
  short: { fg: 'var(--bucket-short)', tint: 'var(--bucket-short-tint)' },
  cap: { fg: 'var(--bucket-cap)', tint: 'var(--bucket-cap-tint)' },
}

export const brand = {
  ring: '#2095D2',
  mid: '#127EC2',
  deep: '#0C51A1',
  dome: '#D81D24',
} as const

export const THEME_STORAGE_KEY = 'sense.theme'
