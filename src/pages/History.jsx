import { useState } from 'react'
import WorkoutCard from '../components/WorkoutCard'
import WorkoutDetail from '../components/WorkoutDetail'

const mockStats = {
  overload: 4.2,
  bodweightChange: - 0.9,
}

const mockWorkouts = [
  {
    id: 1,
    name: 'Push day',
    date: 'Today',
    tags: [
      { label: 'Chest', type: 'push' },
      { label: 'Shoulders', type: 'push' },
      { label: 'Triceps', type: 'push' },
    ],
    exercises: [
      { name: 'Bench press', sets: 4, reps: 8, weight: 80 },
      { name: 'Overhead press', sets: 3, reps: 10, weight: 50 },
      { name: 'Incline dumbbell press', sets: 3, reps: 10, weight: 30 },
      { name: 'Lateral raises', sets: 3, reps: 15, weight: 12 },
      { name: 'Tricep pushdown', sets: 3, reps: 12, weight: 25 },
      { name: 'Overhead tricep extension', sets: 3, reps: 12, weight: 20 },
    ],
  },
  {
    id: 2,
    name: 'Pull day',
    date: 'Yesterday',
    tags: [
      { label: 'Back', type: 'pull' },
      { label: 'Biceps', type: 'pull' },
    ],
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 5, weight: 120 },
      { name: 'Pull ups', sets: 3, reps: 8, weight: 0 },
      { name: 'Barbell row', sets: 3, reps: 10, weight: 70 },
      { name: 'Face pulls', sets: 3, reps: 15, weight: 20 },
      { name: 'Barbell curl', sets: 3, reps: 12, weight: 35 },
    ],
  },
  {
    id: 3,
    name: 'Leg day',
    date: 'Thu',
    tags: [
      { label: 'Quads', type: 'legs' },
      { label: 'Hamstrings', type: 'legs' },
      { label: 'Calves', type: 'legs' },
    ],
    exercises: [
      { name: 'Squat', sets: 4, reps: 6, weight: 100 },
      { name: 'Romanian deadlift', sets: 3, reps: 10, weight: 80 },
      { name: 'Leg press', sets: 3, reps: 12, weight: 160 },
      { name: 'Leg curl', sets: 3, reps: 12, weight: 50 },
      { name: 'Calf raises', sets: 4, reps: 15, weight: 60 },
    ],
  },
  {
    id: 4,
    name: 'Push day',
    date: 'Tue',
    tags: [
      { label: 'Chest', type: 'push' },
      { label: 'Shoulders', type: 'push' },
      { label: 'Triceps', type: 'push' },
    ],
    exercises: [
      { name: 'Bench press', sets: 4, reps: 8, weight: 77.5 },
      { name: 'Overhead press', sets: 3, reps: 10, weight: 47.5 },
      { name: 'Incline dumbbell press', sets: 3, reps: 10, weight: 28 },
      { name: 'Lateral raises', sets: 3, reps: 15, weight: 12 },
      { name: 'Tricep pushdown', sets: 3, reps: 12, weight: 25 },
    ],
  },
]

export default function History() {
  const [selectedWorkout, setSelectedWorkout] = useState(null)

  const overloadPositive = mockStats.overload >= 0
  const bodyweightPositive = mockStats.bodweightChange >= 0

  return (
    <>
      <div className="history-header">
        <div className="history-title">Gym</div>
        <div className="history-subtitle">Week 18 · April 2026</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className={`stat-card-value ${overloadPositive ? 'positive' : 'negative'}`}>
            {overloadPositive ? '+ ' : ''}{mockStats.overload.toFixed(1)} %
          </div>
          <div className="stat-card-label">Avg progressive overload</div>
        </div>
        <div className="stat-card">
          <div className={`stat-card-value ${bodyweightPositive ? 'positive' : 'negative'}`}>
            {bodyweightPositive ? '+ ' : ''}{mockStats.bodweightChange.toFixed(1)} kg
          </div>
          <div className="stat-card-label">Bodyweight change this week</div>
        </div>
      </div>

      <div className="workout-list">
        <div className="workout-list-title">Sessions</div>
        {mockWorkouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onClick={() => setSelectedWorkout(workout)}
          />
        ))}
      </div>

      <WorkoutDetail
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </>
  )
}