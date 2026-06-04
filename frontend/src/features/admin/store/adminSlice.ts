import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { adminService, type AdminUser, type AdminTask, type GetAdminTasksParams } from '../adminService'
import type { RootState } from '@/store/index'

interface AdminState {
  users: AdminUser[]
  totalUsers: number
  tasks: AdminTask[]
  totalTasks: number
  page: number
  totalPages: number
  selectedUserId: string | null
  isLoadingUsers: boolean
  isLoadingTasks: boolean
  error: string | null
}

const initialState: AdminState = {
  users: [],
  totalUsers: 0,
  tasks: [],
  totalTasks: 0,
  page: 1,
  totalPages: 1,
  selectedUserId: null,
  isLoadingUsers: false,
  isLoadingTasks: false,
  error: null,
}

export const fetchAdminUsersThunk = createAsyncThunk(
  'admin/fetchUsers',
  async () => adminService.getUsers()
)

export const fetchAdminTasksThunk = createAsyncThunk(
  'admin/fetchTasks',
  async (params?: GetAdminTasksParams) => adminService.getTasks(params ?? {})
)

export const deleteAdminUserThunk = createAsyncThunk(
  'admin/deleteUser',
  async (id: string) => {
    await adminService.deleteUser(id)
    return id
  }
)

export const deleteAdminTaskThunk = createAsyncThunk(
  'admin/deleteTask',
  async (id: string) => {
    await adminService.deleteTask(id)
    return id
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    selectUserForTasks: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload
      if (action.payload === null) {
        state.tasks = []
        state.totalTasks = 0
      }
    },
    clearAdminError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsersThunk.pending, (state) => {
        state.isLoadingUsers = true
        state.error = null
      })
      .addCase(fetchAdminUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload.users
        state.totalUsers = action.payload.total
        state.isLoadingUsers = false
      })
      .addCase(fetchAdminUsersThunk.rejected, (state, action) => {
        state.isLoadingUsers = false
        state.error = action.error.message ?? 'Failed to load users'
      })

    builder
      .addCase(fetchAdminTasksThunk.pending, (state) => {
        state.isLoadingTasks = true
        state.error = null
        state.tasks = []
        state.totalTasks = 0
      })
      .addCase(fetchAdminTasksThunk.fulfilled, (state, action) => {
        state.tasks = action.payload.tasks
        state.totalTasks = action.payload.total
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
        state.isLoadingTasks = false
      })
      .addCase(fetchAdminTasksThunk.rejected, (state, action) => {
        state.isLoadingTasks = false
        state.error = action.error.message ?? 'Failed to load tasks'
      })

    builder
      .addCase(deleteAdminUserThunk.pending, (state, action) => {
        const id = action.meta.arg
        state.users = state.users.filter((u) => u.id !== id)
        state.totalUsers = Math.max(0, state.totalUsers - 1)
        if (state.selectedUserId === id) {
          state.selectedUserId = null
          state.tasks = []
          state.totalTasks = 0
        }
      })
      .addCase(deleteAdminUserThunk.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete user'
      })

    builder
      .addCase(deleteAdminTaskThunk.pending, (state, action) => {
        const id = action.meta.arg
        state.tasks = state.tasks.filter((t) => t.id !== id)
        state.totalTasks = Math.max(0, state.totalTasks - 1)
      })
      .addCase(deleteAdminTaskThunk.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete task'
      })
  },
})

export const { selectUserForTasks, clearAdminError } = adminSlice.actions

export const selectAdminUsers = (state: RootState) => state.admin.users
export const selectAdminTotalUsers = (state: RootState) => state.admin.totalUsers
export const selectAdminTasks = (state: RootState) => state.admin.tasks
export const selectAdminTotalTasks = (state: RootState) => state.admin.totalTasks
export const selectAdminSelectedUserId = (state: RootState) => state.admin.selectedUserId
export const selectAdminUsersLoading = (state: RootState) => state.admin.isLoadingUsers
export const selectAdminTasksLoading = (state: RootState) => state.admin.isLoadingTasks
export const selectAdminError = (state: RootState) => state.admin.error

export default adminSlice.reducer
