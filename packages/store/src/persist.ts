import type { Middleware } from '@reduxjs/toolkit'
import type { AuditEntry, Inspection, User } from '@sense/core'
import type { QueuedChange } from './slices/connectivitySlice'
import type { ThemeMode } from './slices/uiSlice'

export const STORAGE_KEY = 'senseReportStudio.v2'

/**
 * The subset of state that survives a reload. Transient things — toasts, the
 * generation stepper, the command palette — are deliberately left out.
 */
export interface PersistedState {
  user: User | null
  inspections: Inspection[]
  audit: AuditEntry[]
  snippets: Record<string, string>
  costs: Record<string, number>
  euls: Record<string, number>
  manualOffline: boolean
  queue: QueuedChange[]
  theme: ThemeMode
}

export const loadPersisted = (): Partial<PersistedState> | null => {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : null
  } catch {
    // A corrupt or unreadable payload should never block boot.
    return null
  }
}

export const clearPersisted = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/** Writes on a trailing edge so a burst of keystrokes costs one write. */
export const createPersistMiddleware = (
  select: (state: unknown) => PersistedState,
  waitMs = 400,
): Middleware => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (store) => (next) => (action) => {
    const result = next(action)
    if (typeof localStorage === 'undefined') return result
    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(select(store.getState())))
      } catch {
        /* quota exceeded or private mode — the app keeps working in memory */
      }
    }, waitMs)
    return result
  }
}
