import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type StepState = 'pending' | 'active' | 'done'

export interface GenStep {
  label: string
  /** The approved-language refs this step retrieves from. */
  ref: string
  state: StepState
}

export interface GenerationState {
  running: boolean
  steps: GenStep[]
  modeLabel: string
  inspectionId: string | null
}

const initialState: GenerationState = {
  running: false,
  steps: [],
  modeLabel: '',
  inspectionId: null,
}

const generationSlice = createSlice({
  name: 'generation',
  initialState,
  reducers: {
    start(
      state,
      action: PayloadAction<{ steps: GenStep[]; modeLabel: string; inspectionId: string }>,
    ) {
      state.running = true
      state.steps = action.payload.steps
      state.modeLabel = action.payload.modeLabel
      state.inspectionId = action.payload.inspectionId
      if (state.steps[0]) state.steps[0].state = 'active'
    },
    advance(state) {
      const idx = state.steps.findIndex((s) => s.state === 'active')
      if (idx === -1) return
      state.steps[idx].state = 'done'
      const next = state.steps[idx + 1]
      if (next) next.state = 'active'
    },
    finishAll(state) {
      for (const s of state.steps) s.state = 'done'
    },
    clear(state) {
      state.running = false
      state.steps = []
      state.inspectionId = null
    },
  },
})

export const { start, advance, finishAll, clear } = generationSlice.actions
export default generationSlice.reducer
