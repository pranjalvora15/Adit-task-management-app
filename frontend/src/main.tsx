import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { store } from './store/index'
import { useAppDispatch } from './store/hooks'
import { fetchMeThunk } from './features/auth/authSlice'
import { ErrorBoundary } from './shared/components/ErrorBoundary'

try {
  const stored = localStorage.getItem('ui-store')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
} catch {
  console.error('failed to access ui-store')
}

localStorage.removeItem('task-store')

function Root() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMeThunk())
  }, [dispatch])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Root />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)
