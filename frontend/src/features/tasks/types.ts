export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'completed'

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string
  status: Status
  order: number
  createdAt: string
}

export interface FilterState {
  search: string
  status: 'all' | Status
  priority: 'all' | Priority
}
