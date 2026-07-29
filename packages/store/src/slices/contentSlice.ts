import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { timestamp } from '@sense/core'
import { seedAudit } from '@sense/mock'
import type { AuditEntry, ContentOverrides } from '@sense/core'

export type AdminTab = 'lang' | 'cost' | 'audit'

export interface ContentState extends ContentOverrides {
  audit: AuditEntry[]
  adminTab: AdminTab
  /** Which snippet family the language editor is showing. */
  adminFilter: string
}

const initialState: ContentState = {
  snippets: {},
  costs: {},
  euls: {},
  audit: seedAudit(),
  adminTab: 'lang',
  adminFilter: 'roof',
}

const MAX_AUDIT = 250

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSnippet(state, action: PayloadAction<{ ref: string; text: string }>) {
      state.snippets[action.payload.ref] = action.payload.text
    },
    resetSnippet(state, action: PayloadAction<string>) {
      delete state.snippets[action.payload]
    },
    setCost(state, action: PayloadAction<{ key: string; value: number }>) {
      state.costs[action.payload.key] = action.payload.value
    },
    setEul(state, action: PayloadAction<{ key: string; value: number }>) {
      state.euls[action.payload.key] = action.payload.value
    },
    resetCostRow(state, action: PayloadAction<string>) {
      delete state.costs[action.payload]
      delete state.euls[action.payload]
    },
    log: {
      reducer(state, action: PayloadAction<AuditEntry>) {
        state.audit.unshift(action.payload)
        if (state.audit.length > MAX_AUDIT) state.audit.length = MAX_AUDIT
      },
      prepare(user: string, action: string, detail = '', off = false) {
        return { payload: { id: nanoid(8), ts: timestamp(), user, action, detail, off } }
      },
    },
    setAdminTab(state, action: PayloadAction<AdminTab>) {
      state.adminTab = action.payload
    },
    setAdminFilter(state, action: PayloadAction<string>) {
      state.adminFilter = action.payload
    },
  },
})

export const {
  setSnippet,
  resetSnippet,
  setCost,
  setEul,
  resetCostRow,
  log,
  setAdminTab,
  setAdminFilter,
} = contentSlice.actions
export default contentSlice.reducer
