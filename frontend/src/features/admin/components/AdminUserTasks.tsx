import { useState } from 'react'
import { Trash2, X, ClipboardList, Loader2, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn, formatDate } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAdminTasks,
  selectAdminTasksLoading,
  selectAdminSelectedUserId,
  selectAdminUsers,
  selectUserForTasks,
  deleteAdminTaskThunk,
  fetchAdminTasksThunk,
} from '../store/adminSlice'
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal'
import type { Task } from '@/features/tasks/types'

export function AdminUserTasks() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(selectAdminTasks)
  const isLoading = useAppSelector(selectAdminTasksLoading)
  const selectedUserId = useAppSelector(selectAdminSelectedUserId)
  const users = useAppSelector(selectAdminUsers)

  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)

  if (!selectedUserId) return null

  const selectedUser = users.find((u) => u.id === selectedUserId)

  const handleDeleteConfirm = async () => {
    if (!deleteCandidateId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await dispatch(deleteAdminTaskThunk(deleteCandidateId)).unwrap()
      setDeleteCandidateId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete task')
      dispatch(fetchAdminTasksThunk({ userId: selectedUserId }))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (isDeleting) return
    setDeleteCandidateId(null)
    setDeleteError(null)
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">
            Tasks for <span className="text-primary">{selectedUser?.name ?? 'user'}</span>
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({tasks.length})
            </span>
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => dispatch(selectUserForTasks(null))}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
            <ClipboardList className="h-10 w-10 opacity-30" />
            <p className="text-sm">This user has no tasks.</p>
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {tasks.map((task) => {
              const completed = task.status === 'completed'
              return (
                <div
                  key={task.id}
                  onClick={() => setDetailTask(task)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/30',
                    completed && 'opacity-60'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium',
                        completed && 'line-through text-muted-foreground'
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </div>
                  </div>
                  <Badge variant={task.priority} className="shrink-0">
                    {task.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0',
                      completed
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                    )}
                  >
                    {task.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setDeleteCandidateId(task.id) }}
                    title="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteCandidateId !== null} onOpenChange={(o) => !o && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteConfirm() }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
      />
    </>
  )
}
