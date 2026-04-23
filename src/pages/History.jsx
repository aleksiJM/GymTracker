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

    fetchWorkouts()
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
          <div
            className={`stat-card-value ${overloadPositive ? 'positive' : 'negative'}`}
          >
            {overloadPositive ? '+ ' : '- '}
            {Math.abs(mockStats.overload).toFixed(1)} %
          </div>
          <div className='stat-card-label'>Avg progressive overload</div>
        </div>
        <div className='stat-card'>
          <div
            className={`stat-card-value ${bodyweightPositive ? 'positive' : 'negative'}`}
          >
            {bodyweightPositive ? '+ ' : '- '}
            {Math.abs(mockStats.bodweightChange).toFixed(1)} kg
          </div>
          <div className='stat-card-label'>Bodyweight change this week</div>
        </div>
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
