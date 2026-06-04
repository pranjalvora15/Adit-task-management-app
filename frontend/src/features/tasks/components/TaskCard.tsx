import { useState } from 'react'
import { Pencil, Trash2, CalendarDays, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import { useAppDispatch } from '@/store/hooks'
import { optimisticToggle, toggleStatusThunk } from '../store/taskSlice'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  isDeleting: boolean
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onView: (task: Task) => void
}

function isOverdue(dueDate: string, status: string) {
  return status === 'pending' && new Date(dueDate) < new Date(new Date().toDateString())
}

export function TaskCard({ task, isDeleting, onEdit, onDelete, onView }: TaskCardProps) {
  const dispatch = useAppDispatch()
  const [isToggling, setIsToggling] = useState(false)

  const completed = task.status === 'completed'
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <div
      onClick={() => onView(task)}
      className={cn(
        'flex cursor-pointer flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:bg-accent/30 hover:shadow-md',
        isDeleting && 'opacity-0 scale-95',
        completed && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex items-center justify-center h-4 w-4 mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isToggling
              ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              : <Checkbox
                  checked={completed}
                  onCheckedChange={async () => {
                    setIsToggling(true)
                    dispatch(optimisticToggle(task.id))
                    try {
                      await dispatch(toggleStatusThunk(task.id)).unwrap()
                    } catch {
                      return
                    } finally {
                      setIsToggling(false)
                    }
                  }}
                />
            }
          </div>
          <p className={cn('font-medium leading-tight', completed && 'line-through text-muted-foreground')}>
            {task.title}
          </p>
        </div>
        <Badge variant={task.priority} className="shrink-0">{task.priority}</Badge>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className={cn('flex items-center gap-1 text-xs', overdue ? 'text-destructive' : 'text-muted-foreground')}>
          <CalendarDays className="h-3 w-3" />
          {formatDate(task.dueDate)}
          {overdue && <span className="font-medium ml-1">Overdue</span>}
        </div>

        <div onClick={(e) => e.stopPropagation()} className="flex gap-1">
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
  )
}
