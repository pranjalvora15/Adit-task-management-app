import { useState } from 'react'
import { Trash2, Eye, Users as UsersIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectUser } from '@/features/auth/authSlice'
import {
  selectAdminUsers,
  selectAdminUsersLoading,
  selectAdminTasksLoading,
  selectAdminSelectedUserId,
  selectUserForTasks,
  deleteAdminUserThunk,
  fetchAdminUsersThunk,
  fetchAdminTasksThunk,
} from '../store/adminSlice'

export function AdminUsersTable() {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAdminUsers)
  const isLoading = useAppSelector(selectAdminUsersLoading)
  const isLoadingTasks = useAppSelector(selectAdminTasksLoading)
  const selectedUserId = useAppSelector(selectAdminSelectedUserId)
  const currentUser = useAppSelector(selectUser)

  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loadingTasksFor, setLoadingTasksFor] = useState<string | null>(null)

  const handleViewTasks = async (userId: string) => {
    if (selectedUserId === userId) {
      dispatch(selectUserForTasks(null))
      return
    }
    setLoadingTasksFor(userId)
    dispatch(selectUserForTasks(userId))
    try {
      await dispatch(fetchAdminTasksThunk({ userId })).unwrap()
    } finally {
      setLoadingTasksFor(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCandidateId) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await dispatch(deleteAdminUserThunk(deleteCandidateId)).unwrap()
      setDeleteCandidateId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete user')
      dispatch(fetchAdminUsersThunk())
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (isDeleting) return
    setDeleteCandidateId(null)
    setDeleteError(null)
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <UsersIcon className="h-12 w-12 opacity-30" />
        <p className="text-sm">No users found.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="hidden border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase text-muted-foreground sm:grid sm:grid-cols-[1.5fr_2fr_80px_120px_140px]">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Joined</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id
            const isSelected = u.id === selectedUserId

            return (
              <div
                key={u.id}
                className={cn(
                  'px-4 py-3 transition-colors',
                  'flex flex-col gap-2 sm:grid sm:grid-cols-[1.5fr_2fr_80px_120px_140px] sm:items-center sm:gap-0',
                  isSelected && 'bg-accent/40 ring-1 ring-primary'
                )}
              >
                <div className="font-medium">{u.name}</div>
                <div className="truncate text-sm text-muted-foreground">{u.email}</div>
                <div>
                  <span
                    className={cn(
                      'inline-block rounded px-1.5 py-0.5 text-xs font-medium',
                      u.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewTasks(u.id)}
                    disabled={loadingTasksFor === u.id}
                    title={isSelected ? 'Close tasks' : 'View tasks'}
                  >
                    {loadingTasksFor === u.id && isLoadingTasks
                      ? <Loader2 className="h-3.5 w-3.5 sm:mr-1 animate-spin" />
                      : <Eye className="h-3.5 w-3.5 sm:mr-1" />
                    }
                    <span className="hidden sm:inline">{isSelected ? 'Close' : 'Tasks'}</span>
                  </Button>
                  <span title={isSelf ? 'Cannot delete your own account' : 'Delete user'}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={isSelf}
                      onClick={() => setDeleteCandidateId(u.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog open={deleteCandidateId !== null} onOpenChange={(o) => !o && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all of their tasks. This action cannot be undone.
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
    </>
  )
}
