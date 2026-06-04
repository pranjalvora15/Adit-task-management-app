import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'
type ViewMode = 'list' | 'card'

interface UIStore {
  theme: Theme
  viewMode: ViewMode
  toggleTheme: () => void
  setViewMode: (mode: ViewMode) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      viewMode: 'list',

      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },

      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'ui-store' }
  )
)
