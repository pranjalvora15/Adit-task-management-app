import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, LayoutList, LayoutGrid, CheckSquare, LogOut, User, Shield, Loader2, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/shared/store/uiStore'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutThunk, selectUser } from '@/features/auth/authSlice'

export function Header() {
  const { theme, viewMode, toggleTheme, setViewMode } = useUIStore()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)

  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setMenuOpen(false)
    await dispatch(logoutThunk())
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Task Manager</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none border-0"
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none border-0 border-l"
              onClick={() => setViewMode('card')}
              title="Card view"
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </Button>

          {user && (
            <div ref={menuRef} className="relative">
              <Button
                variant="outline"
                onClick={() => setMenuOpen((o) => !o)}
                disabled={isLoggingOut}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="gap-1.5 px-2 sm:px-3"
              >
                {isLoggingOut
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <User className="h-3.5 w-3.5" />
                }
                <span className="hidden sm:inline max-w-[8rem] truncate">{user.name}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', menuOpen && 'rotate-180')} />
              </Button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
                >
                  <div className="border-b px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      {user.role === 'admin' && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          admin
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="p-1">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      role="menuitem"
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent hover:text-destructive disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isLoggingOut
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <LogOut className="h-4 w-4" />
                      }
                      {isLoggingOut ? 'Logging out…' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
