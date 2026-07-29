import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ROLE_USERS } from '@sense/mock'
import type { RoleId, User } from '@sense/core'

export interface AuthState {
  user: User | null
  /** Role highlighted on the sign-in card before submitting. */
  pickedRole: RoleId
}

const initialState: AuthState = { user: null, pickedRole: 'inspector' }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    pickRole(state, action: PayloadAction<RoleId>) {
      state.pickedRole = action.payload
    },
    signIn(state, action: PayloadAction<{ role: RoleId; email?: string }>) {
      const base = ROLE_USERS[action.payload.role]
      state.user = { ...base, email: action.payload.email?.trim() || base.email }
    },
    signOut(state) {
      state.user = null
    },
    /** Rehydrated from localStorage on boot. */
    restoreSession(state, action: PayloadAction<User | null>) {
      state.user = action.payload
      if (action.payload) state.pickedRole = action.payload.role
    },
  },
})

export const { pickRole, signIn, signOut, restoreSession } = authSlice.actions
export default authSlice.reducer
