import { createSelector } from '@reduxjs/toolkit'
import {
  COMPONENTS,
  buildPortfolioStats,
  buildReportModel,
  completionOf,
  computeCostLine,
  summarizeFlags,
} from '@sense/core'
import type { ContentOverrides, Inspection } from '@sense/core'
import type { RootState } from './store'

/* ------------------------------- primitives ------------------------------- */

export const selectUser = (s: RootState) => s.auth.user
export const selectTheme = (s: RootState) => s.ui.theme
export const selectToasts = (s: RootState) => s.ui.toasts
export const selectGeneration = (s: RootState) => s.generation
export const selectAudit = (s: RootState) => s.content.audit
export const selectInspections = (s: RootState) => s.inspections.items
export const selectActiveId = (s: RootState) => s.inspections.activeId
export const selectCompIdx = (s: RootState) => s.inspections.compIdx
export const selectQueue = (s: RootState) => s.connectivity.queue

/** Admin overrides in the shape the pure engine expects. */
export const selectOverrides = createSelector(
  [(s: RootState) => s.content.snippets, (s: RootState) => s.content.costs, (s: RootState) => s.content.euls],
  (snippets, costs, euls): ContentOverrides => ({ snippets, costs, euls }),
)

/**
 * Offline is true when the switch is flipped *or* the browser really is offline.
 * Everything that queues work reads this one selector.
 */
export const selectOffline = createSelector(
  [(s: RootState) => s.connectivity.manualOffline, (s: RootState) => s.connectivity.netOnline],
  (manual, online) => manual || !online,
)

export const selectActiveInspection = createSelector(
  [selectInspections, selectActiveId],
  (items, id): Inspection | null => items.find((i) => i.id === id) ?? null,
)

export const selectActiveComponent = createSelector(
  [selectCompIdx],
  (idx) => COMPONENTS[Math.max(0, Math.min(idx, COMPONENTS.length - 1))],
)

/* -------------------------------- derived --------------------------------- */

export const selectActiveReportModel = createSelector(
  [selectOverrides, selectActiveInspection],
  (ov, insp) => (insp ? buildReportModel(ov, insp) : null),
)

export const selectActiveFlags = createSelector(
  [selectOverrides, selectActiveInspection],
  (ov, insp) => (insp ? summarizeFlags(ov, insp) : null),
)

export const selectPortfolio = createSelector(
  [selectOverrides, selectInspections],
  (ov, items) => buildPortfolioStats(ov, items),
)

/** Rows for the dashboard table, after search, filter and sort. */
export const selectDashboardRows = createSelector(
  [
    selectInspections,
    selectOverrides,
    (s: RootState) => s.inspections.query,
    (s: RootState) => s.inspections.statusFilter,
    (s: RootState) => s.inspections.sort,
  ],
  (items, ov, query, statusFilter, sort) => {
    const q = query.trim().toLowerCase()
    const statusRank = { field: 0, ready: 1, review: 2, scheduled: 3, approved: 4 }

    const rows = items
      .filter((i) => statusFilter === 'all' || i.status === statusFilter)
      .filter((i) => {
        if (!q) return true
        return [i.property.name, i.property.addr, i.property.client, i.proj]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .map((insp) => {
        const progress = completionOf(insp)
        const identified = COMPONENTS.reduce((n, c) => {
          const entry = insp.data[c.id]
          if (!entry?.done) return n
          return n + (computeCostLine(ov, c.id, entry)?.line ?? 0)
        }, 0)
        return { insp, progress, identified }
      })

    rows.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.insp.property.name.localeCompare(b.insp.property.name)
        case 'status':
          return statusRank[a.insp.status] - statusRank[b.insp.status]
        case 'progress':
          return b.progress.pct - a.progress.pct
        default:
          return b.insp.updatedAt.localeCompare(a.insp.updatedAt)
      }
    })
    return rows
  },
)

export const selectDashboardKpis = createSelector(
  [selectInspections, selectPortfolio, selectQueue],
  (items, portfolio, queue) => ({
    awaitingReview: items.filter((i) => i.status === 'review').length,
    inField: items.filter((i) => i.status === 'field' || i.status === 'ready').length,
    approved: items.filter((i) => i.status === 'approved').length,
    identified: portfolio.totalIdentified,
    queued: queue.length,
  }),
)

/** True once every drafted section has been approved by the reviewer. */
export const selectAllSectionsApproved = createSelector([selectActiveInspection], (insp) => {
  if (!insp?.draft) return false
  const sections = Object.values(insp.draft.comps)
  return sections.length > 0 && sections.every((c) => c?.approved)
})
