import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WorkoutCard from '../components/WorkoutCard'
import WorkoutDetail from '../components/WorkoutDetail'

const mockStats = {
  overload: 4.2,
  bodweightChange: -0.9,
}

export default function History() {
  const [workouts, setWorkouts] = useState([])
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bodyweightChange, setBodyweightChange] = useState(null)
  const [bodyweightView, setBodyweightView] = useState('week')

  const overloadPositive = mockStats.overload >= 0
  const bodyweightPositive = mockStats.bodweightChange >= 0

  const handleDelete = (deletedId) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== deletedId))
  }

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(
          `
          *,
          exercises (
            *,
            sets (*),
            exercise_muscles (*)
          )
        `
        )
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setWorkouts(data)
      setLoading(false)
    }

    const fetchBodyweight = async () => {
      const { data, error } = await supabase
        .from('bodyweight')
        .select('weight', 'created_at')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        const now = new Date()
        const oneWeekAgo = new Date()
        const oneMonthAgo = new Date()
        oneWeekAgo.setDate(now.getDate() - 7)
        oneMonthAgo.setDate(now.getDate() - 30)

        const avg = (arr) =>
          arr.reduce((sum, b) => sum + b.weight, 0) / arr.length

        const allTimeChange = parseFloat(
          (data[data.length - 1].weight - data[0].weight).toFixed(1)
        )

        const lastWeekData = data.filter(
          (b) => new Date(b.created_at) >= oneWeekAgo
        )
        const beforeLastWeek = data.filter(
          (b) => new Date(b.created_at) < oneWeekAgo
        )
        const weekChange =
          lastWeekData.length > 0 && beforeLastWeek.length > 0
            ? parseFloat((avg(lastWeekData) - avg(beforeLastWeek)).toFixed(1))
            : allTimeChange

        const lastMonthData = data.filter(
          (b) => new Date(b.created_at) >= oneMonthAgo
        )
        const beforeLastMonth = data.filter(
          (b) => new Date(b.created_at) < oneMonthAgo
        )
        const monthChange =
          lastMonthData.length > 0 && beforeLastMonth.length > 0
            ? parseFloat((avg(lastMonthData) - avg(beforeLastMonth)).toFixed(1))
            : allTimeChange

        setBodyweightChange({
          month: monthChange,
          week: weekChange,
          allTime: allTimeChange,
        })
      } else {
        setBodyweightChange({ month: 0, week: 0, allTime: 0 })
      }
    }

    fetchWorkouts()
    fetchBodyweight()
  }, [])

  if (loading) return <div className='page'>Loading...</div>

  return (
    <>
      <div className='history-header'>
        <div className='history-title'>Gym</div>
        <div className='history-subtitle'>Week 18 · April 2026</div>
      </div>

      <div className='stat-grid'>
        <div className='stat-card'>
          <div className='stat-card-value positive'>+ 4.2 %</div>
          <div className='stat-card-label'>Avg progressive overload</div>
        </div>
        <button
          className='stat-card'
          onClick={() =>
            setBodyweightView((v) => {
              if (v === 'week') return 'month'
              if (v === 'month') return 'allTime'
              return 'week'
            })
          }
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          {bodyweightChange !== null ? (
            <>
              <div className='stat-card-toggle'>
                <div
                  className={`stat-card-value ${bodyweightChange[bodyweightView] <= 0 ? 'positive' : 'negative'}`}
                >
                  {bodyweightChange[bodyweightView] > 0 ? '+ ' : '- '}
                  {Math.abs(bodyweightChange[bodyweightView]).toFixed(1)} kg
                </div>
                <div className='stat-card-label'>
                  Bodyweight change ·{' '}
                  {bodyweightView === 'week'
                    ? 'last 7 days'
                    : bodyweightView === 'month'
                      ? 'last 30 days'
                      : 'all time'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='stat-card-value' style={{ fontSize: '1rem' }}>
                No data
              </div>
              <div className='stat-card-label'>Bodyweight change this week</div>
            </>
          )}
        </button>
      </div>

      <div className='workout-list'>
        <div className='workout-list-title'>Sessions</div>
        {workouts.length === 0 ? (
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            No workouts yet
          </div>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={() => setSelectedWorkout(workout)}
            />
          ))
        )}
      </div>

      <WorkoutDetail
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onDelete={handleDelete}
      />
    </>
  )
}
