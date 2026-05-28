import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectUser, selectInitialAuthChecked } from '../authSlice'

interface GuestRouteProps {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const user = useAppSelector(selectUser)
  const initialAuthChecked = useAppSelector(selectInitialAuthChecked)

  if (!initialAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
