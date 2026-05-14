import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Log from './pages/Log'
import Progress from './pages/Progress'
import SignIn from './pages/SignIn'
import type { AppPage } from './types/app'
import * as Sentry from '@sentry/react'

function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('first error!')
      }}
    >
      error button
    </button>
  )
}

export default function App() {
  const [page, setPage] = useState<AppPage>('home')
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <SignIn />

  return (
    <div className='max-w-107.5 mx-auto min-h-screen bg-card relative'>
      <ErrorButton />
      <main className='pb-16'>
        {page === 'home' && <Home />}
        {page === 'log' && <Log />}
        {page === 'progress' && <Progress />}
      </main>
      <Navbar currentPage={page} setPage={setPage} />
    </div>
  )
}
