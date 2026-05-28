import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/shared/components/Header'
import { TaskStats } from '@/shared/components/TaskStats'
import { SearchFilter } from '@/shared/components/SearchFilter'
import { TaskList } from '@/features/tasks/components/TaskList'
import { TaskFormModal } from '@/features/tasks/components/TaskFormModal'
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal'
import { DeleteConfirmDialog } from '@/features/tasks/components/DeleteConfirmDialog'
import { useFilteredTasks } from '@/features/tasks/hooks/useFilteredTasks'
import { useAppDispatch } from '@/store/hooks'
import { deleteTaskThunk, fetchTasksThunk } from '@/features/tasks/store/taskSlice'
import { useUIStore } from '@/shared/store/uiStore'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RegisterPage } from '@/features/auth/components/RegisterPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { RequireAdmin } from '@/features/auth/components/RequireAdmin'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { AdminPage } from '@/features/admin/components/AdminPage'
import type { FilterState, Task } from '@/features/tasks/types'

const DIALOG_FADE = 200
const ITEM_FADE = 300

const defaultFilters: FilterState = { search: '', status: 'all', priority: 'all' }

interface ModalState {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
}

function Dashboard() {
  const dispatch = useAppDispatch()
  const viewMode = useUIStore((state) => state.viewMode)

  const [rawSearch, setRawSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'create' })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [detailTask, setDetailTask] = useState<Task | null>(null)

  useEffect(() => {
    if (rawSearch === '') {
      setIsSearching(false)
      setFilters((f) => ({ ...f, search: '' }))
      return
    }
    setIsSearching(true)
    const id = setTimeout(() => {
      setFilters((f) => ({ ...f, search: rawSearch }))
      setIsSearching(false)
    }, 400)
    return () => clearTimeout(id)
  }, [rawSearch])

  const filteredTasks = useFilteredTasks(filters)

  const openCreate = () => setModal({ open: true, mode: 'create' })
  const openEdit = (task: Task) => setModal({ open: true, mode: 'edit', task })
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const openDetail = (task: Task) => setDetailTask(task)
  const closeDetail = () => setDetailTask(null)

  const handleDeleteConfirm = (taskId: string) => {
    setDeleteId(null)
    setTimeout(() => setDeletingId(taskId), DIALOG_FADE)
    setTimeout(async () => {
      setDeletingId(null)
      try {
        await dispatch(deleteTaskThunk(taskId)).unwrap()
      } catch {
        dispatch(fetchTasksThunk())
      }
    }, DIALOG_FADE + ITEM_FADE)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <TaskStats />

          <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <Button onClick={openCreate} size="sm" className="shrink-0">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Task
              </Button>
            </div>

            <SearchFilter
              filters={filters}
              searchInput={rawSearch}
              isSearching={isSearching}
              onSearchChange={setRawSearch}
              onChange={(f) => setFilters((prev) => ({ ...prev, status: f.status, priority: f.priority }))}
            />

            <div className={isSearching ? 'opacity-50 transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <TaskList
                tasks={filteredTasks}
                viewMode={viewMode}
                deletingId={deletingId}
                onEdit={openEdit}
                onDelete={setDeleteId}
                onView={openDetail}
              />
            </div>
          </div>
        </div>
      </main>

      <TaskFormModal
        open={modal.open}
        onClose={closeModal}
        mode={modal.mode}
        task={modal.task}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={closeDetail}
        onEdit={(task) => { closeDetail(); openEdit(task) }}
      />

      <DeleteConfirmDialog
        taskId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
