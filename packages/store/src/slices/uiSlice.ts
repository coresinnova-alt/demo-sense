import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ToastTone = 'default' | 'success' | 'warn' | 'danger'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
  /** Optional second line, e.g. the affected project number. */
  detail?: string
}

export type ThemeMode = 'light' | 'dark'

export interface UiState {
  theme: ThemeMode
  toasts: Toast[]
  commandOpen: boolean
  /** Shows the keyboard-shortcut cheat sheet. */
  shortcutsOpen: boolean
}

const initialState: UiState = {
  theme: 'light',
  toasts: [],
  commandOpen: false,
  shortcutsOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        // Keep the stack shallow; the newest message is the one that matters.
        state.toasts = [...state.toasts.slice(-2), action.payload]
      },
      prepare(message: string, tone: ToastTone = 'default', detail?: string) {
        return { payload: { id: nanoid(6), message, tone, detail } }
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    setCommandOpen(state, action: PayloadAction<boolean>) {
      state.commandOpen = action.payload
    },
    setShortcutsOpen(state, action: PayloadAction<boolean>) {
      state.shortcutsOpen = action.payload
    },
  },
})

export const {
  setTheme,
  toggleTheme,
  pushToast,
  dismissToast,
  setCommandOpen,
  setShortcutsOpen,
} = uiSlice.actions
export default uiSlice.reducer
