import {
  COMPONENTS,
  RECOMMENDATION_BY_ID,
  buildDraft,
  descRef,
  duration,
  recRef,
} from '@sense/core'
import type { ComponentId, Inspection } from '@sense/core'
import * as content from './slices/contentSlice'
import * as connectivity from './slices/connectivitySlice'
import * as generation from './slices/generationSlice'
import * as inspections from './slices/inspectionsSlice'
import * as ui from './slices/uiSlice'
import { selectOffline, selectOverrides } from './selectors'
import type { AppDispatch, RootState } from './store'

type Thunk<R = void> = (dispatch: AppDispatch, getState: () => RootState) => R

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/* -------------------------------------------------------------------------- */
/* Audit + offline queue                                                       */
/* -------------------------------------------------------------------------- */

/** Writes an audit row attributed to the signed-in user. */
export const logAudit =
  (action: string, detail = ''): Thunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = state.auth.user?.name ?? 'System'
    dispatch(content.log(user, action, detail, selectOffline(state)))
  }

/**
 * Records a change that would normally hit the server. Offline it goes to the
 * queue; online it is a no-op beyond the audit trail the caller already wrote.
 */
export const recordChange =
  (label: string): Thunk =>
  (dispatch, getState) => {
    if (selectOffline(getState())) dispatch(connectivity.enqueue(label))
  }

/** Flushes the queue once the device is back online. */
export const syncNow = (): Thunk<Promise<void>> => async (dispatch, getState) => {
  const state = getState()
  if (selectOffline(state) || state.connectivity.syncing || !state.connectivity.queue.length) return
  const count = state.connectivity.queue.length
  dispatch(connectivity.startSync())
  await sleep(1400)
  dispatch(connectivity.finishSync())
  dispatch(logAudit('Sync completed', `${count} queued change${count === 1 ? '' : 's'} uploaded`))
  dispatch(
    ui.pushToast(`Back online — ${count} change${count === 1 ? '' : 's'} synced`, 'success'),
  )
}

/* -------------------------------------------------------------------------- */
/* Drafting                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Builds a draft on demand for records that were seeded without one (or opened
 * straight from the report screen). Already-approved reports come back with
 * every section pre-approved so the reviewer is not asked to re-sign.
 */
export const ensureDraft =
  (id: string): Thunk =>
  (dispatch, getState) => {
    const state = getState()
    const insp = state.inspections.items.find((i) => i.id === id)
    if (!insp || insp.draft) return
    const draft = buildDraft(selectOverrides(state), insp, 185_000)
    if (insp.status === 'approved') {
      for (const dc of Object.values(draft.comps)) if (dc) dc.approved = true
    }
    dispatch(inspections.setDraft({ id, draft }))
  }

const stepsFor = (insp: Inspection) => {
  const steps = COMPONENTS.filter((c) => insp.data[c.id]?.done).map((c) => {
    const entry = insp.data[c.id]
    const rec = entry.rec ? RECOMMENDATION_BY_ID[entry.rec].label : '—'
    return {
      label: `${c.label} — ${entry.type} · ${rec}`,
      ref: `${descRef(c.id, entry.type)} + ${recRef(entry.rec)}`,
      state: 'pending' as const,
    }
  })
  steps.push({
    label: 'Assembling cost tables & placing photos',
    ref: 'deterministic — never generated',
    state: 'pending' as const,
  })
  return steps
}

/**
 * Runs the grounded drafting pass. Retrieval and narrative assembly are
 * simulated step by step so the demo shows *which* approved snippet each
 * sentence came from; the costs are computed, never drafted.
 */
export const generateDraft =
  (id: string): Thunk<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState()
    const insp = state.inspections.items.find((i) => i.id === id)
    if (!insp) return

    const offline = selectOffline(state)
    const steps = stepsFor(insp)
    const modeLabel = offline
      ? 'Offline — cached approved language'
      : 'Grounded retrieval · approved language library'

    dispatch(generation.start({ steps, modeLabel, inspectionId: id }))
    const startedAt = Date.now()

    for (let i = 0; i < steps.length; i++) {
      await sleep(380 + Math.random() * 160)
      dispatch(generation.advance())
    }
    dispatch(generation.finishAll())

    const elapsed = Date.now() - startedAt
    const draft = buildDraft(selectOverrides(getState()), insp, elapsed)
    dispatch(inspections.setDraft({ id, draft }))
    dispatch(inspections.setStatus({ id, status: 'review' }))
    dispatch(logAudit('Draft generated', `${insp.proj} · grounded retrieval · ${duration(elapsed)}`))
    dispatch(recordChange(`Draft generated — ${insp.property.name}`))

    await sleep(500)
    dispatch(generation.clear())
    dispatch(inspections.setCompIdx(0))
    dispatch(ui.pushToast('Draft ready for review', 'success', insp.proj))
  }

/* -------------------------------------------------------------------------- */
/* Intake                                                                      */
/* -------------------------------------------------------------------------- */

export const capturePhoto =
  (id: string, compId: ComponentId): Thunk =>
  (dispatch, getState) => {
    const state = getState()
    const insp = state.inspections.items.find((i) => i.id === id)
    const comp = COMPONENTS.find((c) => c.id === compId)
    if (!insp || !comp) return
    const entry = insp.data[compId]
    // The caption defaults to the most recent observation, which is almost
    // always what the inspector just photographed.
    const lastKey = entry.obs[entry.obs.length - 1]
    const label = comp.observations.find((o) => o.key === lastKey)?.label ?? 'General view'
    const offline = selectOffline(state)
    dispatch(inspections.addPhoto(id, compId, entry.photos.length, label, offline))
    dispatch(recordChange(`Photo captured — ${compId}`))
  }

export const approveReport =
  (id: string): Thunk =>
  (dispatch, getState) => {
    const insp = getState().inspections.items.find((i) => i.id === id)
    if (!insp) return
    dispatch(inspections.approveReport(id))
    dispatch(logAudit('Report approved', `${insp.proj} · ${insp.property.name}`))
    dispatch(recordChange(`Report approved — ${insp.proj}`))
    dispatch(ui.pushToast('Report approved — deliverable ready', 'success', insp.proj))
  }

export const toggleOffline = (): Thunk => (dispatch, getState) => {
  const next = !getState().connectivity.manualOffline
  dispatch(connectivity.setManualOffline(next))
  dispatch(logAudit(next ? 'Went offline' : 'Back online', 'connection simulation'))
  if (!next) void dispatch(syncNow())
}
