import { ClipboardList } from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskListItem } from './TaskListItem'
import { TaskCard } from './TaskCard'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { reorderTasksLocal, updateTaskThunk, selectTasks } from '../store/taskSlice'
import type { Task } from '../types'

interface TaskListProps {
  tasks: Task[]
  viewMode: 'list' | 'card'
  deletingId: string | null
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onView: (task: Task) => void
}

export function TaskList({ tasks, viewMode, deletingId, onEdit, onDelete, onView }: TaskListProps) {
  const dispatch = useAppDispatch()
  const allTasks = useAppSelector(selectTasks)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const sorted = [...allTasks].sort((a, b) => a.order - b.order)
    const fromIndex = sorted.findIndex((t) => t.id === active.id)
    const toIndex = sorted.findIndex((t) => t.id === over.id)

    if (fromIndex !== -1 && toIndex !== -1) {
      dispatch(reorderTasksLocal({ from: fromIndex, to: toIndex }))
      dispatch(updateTaskThunk({ id: active.id as string, updates: { order: toIndex } }))
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <ClipboardList className="h-12 w-12 opacity-30" />
        <p className="text-sm">No tasks found. Create one to get started!</p>
      </div>
    )
  }

  if (viewMode === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDeleting={task.id === deletingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              isDeleting={task.id === deletingId}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
