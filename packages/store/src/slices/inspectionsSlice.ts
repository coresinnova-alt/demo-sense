import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { COMPONENTS, isComponentComplete, longDate } from '@sense/core'
import { seedInspections } from '@sense/mock'
import type {
  ComponentEntry,
  ComponentId,
  ConditionId,
  Draft,
  DraftField,
  Inspection,
  InspectionStatus,
  Photo,
  PropertyMeta,
  RecommendationId,
} from '@sense/core'

export type SortKey = 'updated' | 'name' | 'status' | 'progress'

export interface InspectionsState {
  items: Inspection[]
  activeId: string | null
  /** Index into COMPONENTS for the intake walk and the review sidebar. */
  compIdx: number
  query: string
  statusFilter: InspectionStatus | 'all'
  sort: SortKey
}

const initialState: InspectionsState = {
  items: seedInspections(),
  activeId: null,
  compIdx: 0,
  query: '',
  statusFilter: 'all',
  sort: 'updated',
}

const find = (state: InspectionsState, id: string) => state.items.find((i) => i.id === id)

/** Recomputes completeness and stamps the change time. */
const touch = (insp: Inspection, compId?: ComponentId) => {
  if (compId) insp.data[compId].done = isComponentComplete(insp.data[compId])
  insp.updatedAt = new Date().toISOString()
  insp.updated = 'Today'
}

const blankEntry = (): ComponentEntry => ({
  done: false,
  type: null,
  cond: null,
  rec: null,
  qty: null,
  obs: [],
  photos: [],
})

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState,
  reducers: {
    restore(state, action: PayloadAction<Inspection[]>) {
      if (action.payload.length) state.items = action.payload
    },

    create: {
      reducer(state, action: PayloadAction<{ id: string; proj: string; assignee: string }>) {
        const { id, proj, assignee } = action.payload
        const data = Object.fromEntries(COMPONENTS.map((c) => [c.id, blankEntry()])) as Record<
          ComponentId,
          ComponentEntry
        >
        state.items.unshift({
          id,
          proj,
          setupDone: false,
          status: 'field',
          assignee,
          property: {
            name: '',
            addr: '',
            type: 'Multi-tenant office',
            year: '',
            gba: '',
            client: '',
            stories: '',
            constr: 'concrete masonry unit and steel frame with a stucco exterior',
          },
          inspectedOn: longDate(),
          reportDate: null,
          updated: 'Today',
          updatedAt: new Date().toISOString(),
          data,
          draft: null,
        })
        state.activeId = id
        state.compIdx = 0
      },
      prepare(assignee: string, existing: Inspection[]) {
        // Continue the demo's project numbering rather than restarting at 1.
        const nums = existing.map((i) => Number.parseInt(i.id.slice(-4), 10) || 0)
        const next = Math.max(...nums, 168) + 3 + Math.floor(Math.random() * 4)
        const suffix = String(next).padStart(4, '0')
        return { payload: { id: `INS-2026-${suffix}`, proj: `SE-2026-${suffix}`, assignee } }
      },
    },

    remove(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload)
      if (state.activeId === action.payload) state.activeId = null
    },

    updateProperty(state, action: PayloadAction<{ id: string; patch: Partial<PropertyMeta> }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      Object.assign(insp.property, action.payload.patch)
      touch(insp)
    },

    completeSetup(state, action: PayloadAction<string>) {
      const insp = find(state, action.payload)
      if (!insp) return
      insp.setupDone = true
      touch(insp)
    },

    setStatus(state, action: PayloadAction<{ id: string; status: InspectionStatus }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.status = action.payload.status
      touch(insp)
    },

    /* ------------------------------ field intake ------------------------------ */

    setType(state, action: PayloadAction<{ id: string; compId: ComponentId; type: string }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.data[action.payload.compId].type = action.payload.type
      touch(insp, action.payload.compId)
    },

    setCondition(
      state,
      action: PayloadAction<{ id: string; compId: ComponentId; cond: ConditionId; allowed: RecommendationId[] }>,
    ) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      const entry = insp.data[action.payload.compId]
      entry.cond = action.payload.cond
      // A recommendation that no longer fits the new condition is cleared, so
      // the inspector cannot leave an impossible pairing behind.
      if (entry.rec && !action.payload.allowed.includes(entry.rec)) entry.rec = null
      touch(insp, action.payload.compId)
    },

    setRecommendation(
      state,
      action: PayloadAction<{ id: string; compId: ComponentId; rec: RecommendationId }>,
    ) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.data[action.payload.compId].rec = action.payload.rec
      touch(insp, action.payload.compId)
    },

    setQuantity(
      state,
      action: PayloadAction<{ id: string; compId: ComponentId; qty: number | null }>,
    ) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.data[action.payload.compId].qty = action.payload.qty
      touch(insp, action.payload.compId)
    },

    setNote(state, action: PayloadAction<{ id: string; compId: ComponentId; note: string }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.data[action.payload.compId].note = action.payload.note
      touch(insp, action.payload.compId)
    },

    toggleObservation(
      state,
      action: PayloadAction<{ id: string; compId: ComponentId; key: string }>,
    ) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      const entry = insp.data[action.payload.compId]
      entry.obs = entry.obs.includes(action.payload.key)
        ? entry.obs.filter((k) => k !== action.payload.key)
        : [...entry.obs, action.payload.key]
      touch(insp, action.payload.compId)
    },

    addPhoto: {
      reducer(state, action: PayloadAction<{ id: string; compId: ComponentId; photo: Photo }>) {
        const insp = find(state, action.payload.id)
        if (!insp) return
        insp.data[action.payload.compId].photos.push(action.payload.photo)
        touch(insp, action.payload.compId)
      },
      prepare(id: string, compId: ComponentId, index: number, label: string, offline: boolean) {
        const photo: Photo = {
          id: nanoid(8),
          name: `${compId}_${String(index + 1).padStart(2, '0')}.jpg`,
          label,
          seed: Math.floor(Math.random() * 100000),
          capturedOffline: offline,
        }
        return { payload: { id, compId, photo } }
      },
    },

    removePhoto(state, action: PayloadAction<{ id: string; compId: ComponentId; photoId: string }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      const entry = insp.data[action.payload.compId]
      entry.photos = entry.photos.filter((p) => p.id !== action.payload.photoId)
      touch(insp, action.payload.compId)
    },

    /* -------------------------------- drafting -------------------------------- */

    setDraft(state, action: PayloadAction<{ id: string; draft: Draft }>) {
      const insp = find(state, action.payload.id)
      if (!insp) return
      insp.draft = action.payload.draft
      touch(insp)
    },

    editDraftField(
      state,
      action: PayloadAction<{ id: string; compId: ComponentId; field: DraftField; value: string }>,
    ) {
      const insp = find(state, action.payload.id)
      const dc = insp?.draft?.comps[action.payload.compId]
      if (!insp || !dc) return
      if (action.payload.field === 'concerns') {
        dc.concerns = action.payload.value.split('\n').map((x) => x.replace(/^[-•]\s*/, ''))
      } else {
        dc[action.payload.field] = action.payload.value
      }
      dc.edited[action.payload.field] = true
      // Editing a section invalidates its approval; it has to be re-read.
      dc.approved = false
      touch(insp)
    },

    toggleSectionApproval(state, action: PayloadAction<{ id: string; compId: ComponentId }>) {
      const insp = find(state, action.payload.id)
      const dc = insp?.draft?.comps[action.payload.compId]
      if (!insp || !dc) return
      dc.approved = !dc.approved
      touch(insp)
    },

    approveAllSections(state, action: PayloadAction<string>) {
      const insp = find(state, action.payload)
      if (!insp?.draft) return
      for (const dc of Object.values(insp.draft.comps)) if (dc) dc.approved = true
      touch(insp)
    },

    approveReport(state, action: PayloadAction<string>) {
      const insp = find(state, action.payload)
      if (!insp) return
      insp.status = 'approved'
      insp.reportDate = longDate()
      touch(insp)
    },

    /* -------------------------------- navigation ------------------------------ */

    setActive(state, action: PayloadAction<{ id: string | null; compIdx?: number }>) {
      state.activeId = action.payload.id
      if (action.payload.compIdx !== undefined) state.compIdx = action.payload.compIdx
    },
    setCompIdx(state, action: PayloadAction<number>) {
      state.compIdx = Math.max(0, Math.min(action.payload, COMPONENTS.length - 1))
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload
    },
    setStatusFilter(state, action: PayloadAction<InspectionStatus | 'all'>) {
      state.statusFilter = action.payload
    },
    setSort(state, action: PayloadAction<SortKey>) {
      state.sort = action.payload
    },
  },
})

export const {
  restore,
  create,
  remove,
  updateProperty,
  completeSetup,
  setStatus,
  setType,
  setCondition,
  setRecommendation,
  setQuantity,
  setNote,
  toggleObservation,
  addPhoto,
  removePhoto,
  setDraft,
  editDraftField,
  toggleSectionApproval,
  approveAllSections,
  approveReport,
  setActive,
  setCompIdx,
  setQuery,
  setStatusFilter,
  setSort,
} = inspectionsSlice.actions
export default inspectionsSlice.reducer
