export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  initialAuthChecked: boolean
}
