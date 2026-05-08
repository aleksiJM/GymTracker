import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Log from './pages/Log'
import Progress from './pages/Progress'
import SignIn from './pages/SignIn'

export default function App() {
  const [page, setPage] = useState('home')
  const { user, loading } = useAuth()

  if (loading) return

  if (!user) return <SignIn />

  return (
    <div className='max-w-[430px] mx-auto min-h-screen bg-card relative'>
      <main className='pb-16'>
        {page === 'home' && <Home />}
        {page === 'log' && <Log />}
        {page === 'progress' && <Progress />}
      </main>
      <Navbar currentPage={page} setPage={setPage} />
    </div>
  )
}
