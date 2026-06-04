import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import taskReducer from '@/features/tasks/store/taskSlice'
import adminReducer from '@/features/admin/store/adminSlice'
import { sessionMiddleware } from './sessionMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sessionMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
