import { apiRequest } from '@/lib/apiClient'
import type { Task } from '@/features/tasks/types'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface AdminTask extends Task {
  userId: { id: string; name: string; email: string } | string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
}

export interface AdminTasksResponse {
  tasks: AdminTask[]
  total: number
  page: number
  totalPages: number
}

export interface GetAdminTasksParams {
  userId?: string
  page?: number
  limit?: number
  status?: 'pending' | 'completed'
  priority?: 'low' | 'medium' | 'high'
}

export const adminService = {
  getUsers: () => apiRequest<AdminUsersResponse>('GET', '/admin/users'),

  getTasks: (params: GetAdminTasksParams = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') {
        query.set(k, String(v))
      }
    })
    const qs = query.toString()
    return apiRequest<AdminTasksResponse>('GET', `/admin/tasks${qs ? `?${qs}` : ''}`)
  },

  deleteUser: (id: string) => apiRequest<void>('DELETE', `/admin/users/${id}`),

  deleteTask: (id: string) => apiRequest<void>('DELETE', `/admin/tasks/${id}`),
}
