import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectUser, selectAuthLoading } from '../authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAppSelector(selectUser)
  const isLoading = useAppSelector(selectAuthLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
