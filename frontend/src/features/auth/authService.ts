import { apiRequest } from '@/lib/apiClient'
import type { User } from './types'

interface AuthResponse {
  user: User
}

export const authService = {
  register: (name: string, email: string, password: string) =>
    apiRequest<AuthResponse>('POST', '/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('POST', '/auth/login', { email, password }),

  logout: () =>
    apiRequest<{ message: string }>('POST', '/auth/logout'),

  getMe: () =>
    apiRequest<AuthResponse>('GET', '/auth/me'),
}
