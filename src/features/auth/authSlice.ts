import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from './authService'
import type { AuthState, User } from './types'
import type { RootState } from '@/store/index'

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const { user } = await authService.login(email, password)
    return user
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const { user } = await authService.register(name, email, password)
    return user
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

export const fetchMeThunk = createAsyncThunk('auth/fetchMe', async () => {
  const { user } = await authService.getMe()
  return user
})

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  initialAuthChecked: false,
}

function setPending(state: AuthState) {
  state.isLoading = true
  state.error = null
}

function setUser(state: AuthState, user: User) {
  state.user = user
  state.isLoading = false
  state.error = null
}

function setError(state: AuthState, message: string) {
  state.isLoading = false
  state.error = message
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    sessionExpired: (state) => {
      state.user = null
      state.isLoading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, setPending)
      .addCase(loginThunk.fulfilled, (state, action) => setUser(state, action.payload))
      .addCase(loginThunk.rejected, (state, action) => setError(state, action.error.message ?? 'Login failed'))

    builder
      .addCase(registerThunk.pending, setPending)
      .addCase(registerThunk.fulfilled, (state, action) => setUser(state, action.payload))
      .addCase(registerThunk.rejected, (state, action) => setError(state, action.error.message ?? 'Registration failed'))

    builder
      .addCase(logoutThunk.fulfilled, (state) => { state.user = null; state.isLoading = false })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null
        state.isLoading = false
      })

    builder
      .addCase(fetchMeThunk.pending, setPending)
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        setUser(state, action.payload)
        state.initialAuthChecked = true
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.user = null
        state.isLoading = false
        state.initialAuthChecked = true
      })
  },
})

export const { clearError, sessionExpired } = authSlice.actions

export const selectUser = (state: RootState) => state.auth.user
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectAuthError = (state: RootState) => state.auth.error
export const selectInitialAuthChecked = (state: RootState) => state.auth.initialAuthChecked

export default authSlice.reducer
