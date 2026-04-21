import { useState } from 'react'
import Navbar from './components/Navbar'
import History from './pages/History'
import LogWorkout from './pages/LogWorkout'
import Progress from './pages/Progress'

function App() {
  const [page, setPage] = useState('history')

  return (
    <div className="app">
      <main className="main-content">
        {page === 'history' && <History />}
        {page === 'log' && <LogWorkout />}
        {page === 'progress' && <Progress />}
      </main>
      <Navbar currentPage={page} setPage={setPage} />
    </div>
  )
}

export default App