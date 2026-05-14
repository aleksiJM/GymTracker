import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'
import { AuthProvider } from './lib/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://bf5594bf1ba8ce6e430d29b6276bf712@o4511389790896128.ingest.de.sentry.io/4511389801447504',
  sendDefaultPii: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const savedTheme = localStorage.getItem('theme') || 'dark'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
