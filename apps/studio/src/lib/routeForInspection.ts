import type { Inspection } from '@sense/core'

/**
 * Where an inspection should open, based on where it is in the workflow.
 * Clicking a row in the dashboard should always land on the next useful step.
 */
export const routeForInspection = (insp: Inspection): string => {
  switch (insp.status) {
    case 'scheduled':
    case 'field':
      return `/inspection/${insp.id}/intake`
    case 'ready':
      return `/inspection/${insp.id}/flags`
    case 'review':
      return `/inspection/${insp.id}/review`
    case 'approved':
      return `/inspection/${insp.id}/report`
  }
}

export const ctaForInspection = (insp: Inspection): string => {
  switch (insp.status) {
    case 'scheduled':
      return 'Start inspection'
    case 'field':
      return insp.setupDone ? 'Resume intake' : 'Finish set-up'
    case 'ready':
      return 'Review flags'
    case 'review':
      return 'Review draft'
    case 'approved':
      return 'View report'
  }
}
