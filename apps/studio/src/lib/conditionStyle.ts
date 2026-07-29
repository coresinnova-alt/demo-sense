import { CONDITION_BY_ID } from '@sense/core'
import type { BucketId, ConditionId, InspectionStatus } from '@sense/core'
import type { BadgeTone } from '@sense/ui'

/**
 * The one place condition/bucket/status map onto visual tokens. Every use is
 * paired with a text label, so hue is a shortcut, never the message.
 */

export const CONDITION_TONE: Record<ConditionId, BadgeTone> = {
  good: 'good',
  fair: 'fair',
  poor: 'poor',
  failed: 'failed',
}

export const CONDITION_COLOR: Record<ConditionId, string> = {
  good: 'var(--cond-good)',
  fair: 'var(--cond-fair)',
  poor: 'var(--cond-poor)',
  failed: 'var(--cond-failed)',
}

export const CONDITION_TINT: Record<ConditionId, string> = {
  good: 'var(--cond-good-tint)',
  fair: 'var(--cond-fair-tint)',
  poor: 'var(--cond-poor-tint)',
  failed: 'var(--cond-failed-tint)',
}

/** Neutral swatch for a component that has not been assessed yet. */
export const UNASSESSED_COLOR = 'var(--line-2)'

export const conditionLabel = (id: ConditionId | null) =>
  id ? CONDITION_BY_ID[id].label : 'Not assessed'

export const BUCKET_TONE: Record<BucketId, BadgeTone> = {
  imm: 'danger',
  short: 'warn',
  cap: 'info',
}

export const BUCKET_COLOR: Record<BucketId, string> = {
  imm: 'var(--bucket-imm)',
  short: 'var(--bucket-short)',
  cap: 'var(--bucket-cap)',
}

export const STATUS_TONE: Record<InspectionStatus, BadgeTone> = {
  scheduled: 'neutral',
  field: 'info',
  ready: 'brand',
  review: 'warn',
  approved: 'success',
}
