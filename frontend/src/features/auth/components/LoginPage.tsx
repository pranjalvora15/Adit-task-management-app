import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginThunk, clearError, selectAuthLoading, selectAuthError } from '../authSlice'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(loginThunk({ email, password })).unwrap()
      navigate('/')
    } catch {
      return
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Task Manager</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full mt-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
