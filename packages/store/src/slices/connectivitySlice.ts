import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface QueuedChange {
  id: string
  label: string
  ts: number
}

export interface ConnectivityState {
  /** The in-app "simulate offline" switch. */
  manualOffline: boolean
  /** The real browser online/offline state. */
  netOnline: boolean
  syncing: boolean
  queue: QueuedChange[]
  lastSyncedAt: number | null
}

const initialState: ConnectivityState = {
  manualOffline: false,
  netOnline: true,
  syncing: false,
  queue: [],
  lastSyncedAt: null,
}

const connectivitySlice = createSlice({
  name: 'connectivity',
  initialState,
  reducers: {
    setManualOffline(state, action: PayloadAction<boolean>) {
      state.manualOffline = action.payload
    },
    setNetOnline(state, action: PayloadAction<boolean>) {
      state.netOnline = action.payload
    },
    /**
     * Records a change that could not reach the office. Callers enqueue
     * unconditionally; the thunk layer decides whether the device is offline.
     */
    enqueue: {
      reducer(state, action: PayloadAction<QueuedChange>) {
        state.queue.push(action.payload)
      },
      prepare(label: string) {
        return { payload: { id: nanoid(6), label, ts: Date.now() } }
      },
    },
    startSync(state) {
      state.syncing = true
    },
    finishSync(state) {
      state.syncing = false
      state.queue = []
      state.lastSyncedAt = Date.now()
    },
  },
})

export const { setManualOffline, setNetOnline, enqueue, startSync, finishSync } =
  connectivitySlice.actions
export default connectivitySlice.reducer
