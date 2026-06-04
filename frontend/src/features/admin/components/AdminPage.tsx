import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { Header } from '@/shared/components/Header'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAdminUsersThunk, selectAdminError } from '../store/adminSlice'
import { AdminStats } from './AdminStats'
import { AdminUsersTable } from './AdminUsersTable'
import { AdminUserTasks } from './AdminUserTasks'

export function AdminPage() {
  const dispatch = useAppDispatch()
  const error = useAppSelector(selectAdminError)

  useEffect(() => {
    dispatch(fetchAdminUsersThunk())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                admin
              </span>
            </div>
          </div>

          <AdminStats />

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Users</h2>
            <AdminUsersTable />
          </div>

          <AdminUserTasks />
        </div>
      </main>
    </div>
  )
}
