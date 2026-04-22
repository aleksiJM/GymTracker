import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import History from './pages/History'
import LogWorkout from './pages/LogWorkout'
import Progress from './pages/Progress'

function App() {
  const [page, setPage] = useState('history')

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('workouts').select('*')
      if (error) console.error('Supabase error:', error)
      else console.log('Supabase connected! Data:', data)
    }
    test()
  }, [])

  return (
    <div className='app'>
      <main className='main-content'>
        {page === 'history' && <History />}
        {page === 'log' && <LogWorkout />}
        {page === 'progress' && <Progress />}
      </main>
      <Navbar currentPage={page} setPage={setPage} />
    </div>
  )
}

export default App
