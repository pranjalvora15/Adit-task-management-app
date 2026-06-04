import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit'
import { taskService, type GetTasksParams } from '../services/taskService'
import type { Task } from '../types'
import type { RootState } from '@/store/index'

interface TasksState {
  tasks: Task[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
}

const initialState: TasksState = {
  tasks: [],
  total: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
}

export const fetchTasksThunk = createAsyncThunk(
  'tasks/fetchAll',
  async (params?: GetTasksParams) => taskService.getTasks(params ?? {})
)

export const createTaskThunk = createAsyncThunk(
  'tasks/create',
  async (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'status'>) =>
    taskService.createTask(task)
)

export const updateTaskThunk = createAsyncThunk(
  'tasks/update',
  async ({ id, updates }: { id: string; updates: Partial<Omit<Task, 'id' | 'createdAt'>> }) =>
    taskService.updateTask(id, updates)
)

export const deleteTaskThunk = createAsyncThunk(
  'tasks/delete',
  async (id: string) => {
    await taskService.deleteTask(id)
    return id
  }
)

export const toggleStatusThunk = createAsyncThunk(
  'tasks/toggleStatus',
  async (id: string) => taskService.patchStatus(id)
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    optimisticToggle: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending'
      }
    },

    reorderTasksLocal: (state, action: PayloadAction<{ from: number; to: number }>) => {
      const sorted = [...state.tasks].sort((a, b) => a.order - b.order)
      const [moved] = sorted.splice(action.payload.from, 1)
      sorted.splice(action.payload.to, 0, moved)
      state.tasks = sorted.map((t, i) => ({ ...t, order: i }))
    },

    clearTaskError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.tasks = action.payload.tasks
        state.total = action.payload.total
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
        state.isLoading = false
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Failed to load tasks'
      })

    builder
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
        state.total += 1
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create task'
      })

    builder
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.tasks[idx] = action.payload
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to update task'
      })

    builder
      .addCase(deleteTaskThunk.pending, (state, action) => {
        const id = action.meta.arg
        state.tasks = state.tasks
          .filter((t) => t.id !== id)
          .map((t, i) => ({ ...t, order: i }))
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(deleteTaskThunk.fulfilled, (_state, _action) => {
        return
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to delete task'
      })

    builder
      .addCase(toggleStatusThunk.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.tasks[idx] = action.payload
      })
      .addCase(toggleStatusThunk.rejected, (state, action) => {
        const id = action.meta.arg
        const task = state.tasks.find((t) => t.id === id)
        if (task) {
          task.status = task.status === 'pending' ? 'completed' : 'pending'
        }
        state.error = action.error.message ?? 'Failed to update status'
      })
  },
})

export const { optimisticToggle, reorderTasksLocal, clearTaskError } = taskSlice.actions

export const selectTasks = (state: RootState) => state.tasks.tasks
export const selectTasksLoading = (state: RootState) => state.tasks.isLoading
export const selectTasksError = (state: RootState) => state.tasks.error
export const selectTasksPagination = (state: RootState) => ({
  total: state.tasks.total,
  page: state.tasks.page,
  totalPages: state.tasks.totalPages,
})

export const selectTaskCounts = createSelector(selectTasks, (tasks) => ({
  total: tasks.length,
  completed: tasks.filter((t) => t.status === 'completed').length,
  pending: tasks.filter((t) => t.status === 'pending').length,
}))

export default taskSlice.reducer
