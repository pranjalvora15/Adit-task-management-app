import { isRejected, type Middleware } from '@reduxjs/toolkit'
import { sessionExpired } from '@/features/auth/authSlice'

export const sessionMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  if (isRejected(action) && (action.error as { name?: string })?.name === 'AuthError') {
    if ((storeAPI.getState() as { auth: { user: unknown } }).auth.user) {
      storeAPI.dispatch(sessionExpired())
    }
  }
  return next(action)
}
