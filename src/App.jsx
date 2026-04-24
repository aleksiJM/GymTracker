import { useState } from 'react'
import Navbar from './components/Navbar'
import History from './pages/History'
import LogWorkout from './pages/LogWorkout'
import Progress from './pages/Progress'

export default function App() {
  const [page, setPage] = useState('history')

  return (
    <div className='max-w-[430px] mx-auto min-h-screen bg-card relative'>
      <main className='pb-16'>
        {page === 'history' && <History />}
        {page === 'log' && <LogWorkout />}
        {page === 'progress' && <Progress />}
      </main>
      <Navbar currentPage={page} setPage={setPage} />
    </div>
  )
}
