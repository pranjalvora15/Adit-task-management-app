import { Pencil, Trash2, GripVertical, CalendarDays, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import { useAppDispatch } from '@/store/hooks'
import { optimisticToggle, toggleStatusThunk } from '../store/taskSlice'
import type { Task } from '../types'

interface TaskListItemProps {
  task: Task
  isDeleting: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onView: (task: Task) => void
}

function isOverdue(dueDate: string, status: string) {
  return status === 'pending' && new Date(dueDate) < new Date(new Date().toDateString())
}

export function TaskListItem({ task, isDeleting, onEdit, onDelete, onView }: TaskListItemProps) {
  const dispatch = useAppDispatch()
  const [isToggling, setIsToggling] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const completed = task.status === 'completed'
  const overdue = isOverdue(task.dueDate, task.status)

  const handleToggle = async () => {
    setIsToggling(true)
    dispatch(optimisticToggle(task.id))
    try {
      await dispatch(toggleStatusThunk(task.id)).unwrap()
    } catch {
      return
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onView(task)}
      className={cn(
        'group flex cursor-pointer items-start gap-2 rounded-lg border bg-card p-3 shadow-sm transition-all duration-300 hover:bg-accent/30',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary',
        isDeleting && 'opacity-0 scale-95',
        completed && 'opacity-60'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 flex shrink-0 cursor-grab touch-none text-muted-foreground transition-opacity opacity-30 lg:opacity-0 lg:group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </button>

      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">
          <div className="shrink-0 flex items-center justify-center h-4 w-4" onClick={(e) => e.stopPropagation()}>
            {isToggling
              ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              : <Checkbox checked={completed} onCheckedChange={handleToggle} />
            }
          </div>
          <p className={cn('flex-1 truncate font-medium', completed && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
          <Badge variant={task.priority} className="shrink-0">{task.priority}</Badge>

          <div className="hidden lg:flex items-center gap-2">
            <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-destructive' : 'text-muted-foreground')}>
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <span title={completed ? 'Completed tasks cannot be edited' : 'Edit task'}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(task)}
                  disabled={completed}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
              >
                {isDeleting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </Button>
            </div>
          </div>
        </div>

        {task.description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{task.description}</p>
        )}

        <div className="mt-1.5 flex items-center gap-2 lg:hidden">
          <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-destructive' : 'text-muted-foreground')}>
            <CalendarDays className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </div>
          <div onClick={(e) => e.stopPropagation()} className="ml-auto flex gap-1">
            <span title={completed ? 'Completed tasks cannot be edited' : 'Edit task'}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(task)}
                disabled={completed}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
            >
              {isDeleting
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Trash2 className="h-3.5 w-3.5" />
              }
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
