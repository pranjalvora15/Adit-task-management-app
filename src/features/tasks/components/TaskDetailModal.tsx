import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Task } from '../types'

interface TaskDetailModalProps {
  task: Task | null
  onClose: () => void
  onEdit?: (task: Task) => void
}

function isOverdue(dueDate: string, status: string) {
  return status === 'pending' && new Date(dueDate) < new Date(new Date().toDateString())
}

export function TaskDetailModal({ task, onClose, onEdit }: TaskDetailModalProps) {
  return (
    <Dialog open={task !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        {task && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-6 text-xl leading-snug">{task.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant={task.priority}>{task.priority}</Badge>
              <Badge
                variant="outline"
                className={cn(
                  'flex items-center gap-1',
                  task.status === 'completed'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                )}
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {task.status}
              </Badge>
            </div>

            {task.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {task.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No description provided.</p>
            )}

            <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-sm">
              <div
                className={cn(
                  'flex items-center gap-2',
                  isOverdue(task.dueDate, task.status) ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>Due {task.dueDate}</span>
                {isOverdue(task.dueDate, task.status) && (
                  <span className="font-medium">· Overdue</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onEdit && (
                <Button
                  onClick={() => onEdit(task)}
                  disabled={task.status === 'completed'}
                  title={task.status === 'completed' ? 'Completed tasks cannot be edited' : undefined}
                >
                  Edit
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
