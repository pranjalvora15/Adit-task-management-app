import { apiRequest } from '@/lib/apiClient'
import type { Task } from '../types'

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  totalPages: number
}

export interface GetTasksParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
}

export const taskService = {
  getTasks: (params: GetTasksParams = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') {
        query.set(k, String(v))
      }
    })
    const qs = query.toString()
    return apiRequest<TasksResponse>('GET', `/tasks${qs ? `?${qs}` : ''}`)
  },

  createTask: (task: Omit<Task, 'id' | 'order' | 'createdAt' | 'status'>) =>
    apiRequest<Task>('POST', '/tasks', task),

  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) =>
    apiRequest<Task>('PUT', `/tasks/${id}`, updates),

  deleteTask: (id: string) =>
    apiRequest<void>('DELETE', `/tasks/${id}`),

  patchStatus: (id: string) =>
    apiRequest<Task>('PATCH', `/tasks/${id}/status`),
}
