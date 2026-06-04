import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectTasks, fetchTasksThunk } from '../store/taskSlice'
import type { FilterState } from '../types'

export function useFilteredTasks(filters: FilterState) {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(selectTasks)

  useEffect(() => {
    dispatch(fetchTasksThunk())
  }, [dispatch])

  return useMemo(() => {
    const sorted = [...tasks].sort((a, b) => a.order - b.order)

    return sorted.filter((task) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) {
          return false
        }
      }
      if (filters.status !== 'all' && task.status !== filters.status) return false
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      return true
    })
  }, [tasks, filters])
}
