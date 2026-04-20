import { useState } from 'react'

const mockStats = {
  overload: 4.2,
  bodweightChange: -0.9,
}

const mockWorkouts = [
  {
    id: 1,
    name: 'Push day',
    date: 'Today',
    duration: 52,
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
    duration: 48,
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
    duration: 60,
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
    duration: 50,
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
            {overloadPositive ? '+' : ''}{mockStats.overload.toFixed(1)}%
          </div>
          <div className="stat-card-label">Avg progressive overload</div>
        </div>
        <div className="stat-card">
          <div className={`stat-card-value ${bodyweightPositive ? 'negative' : 'positive'}`}>
            {bodyweightPositive ? '+' : ''}{mockStats.bodweightChange.toFixed(1)} kg
          </div>
          <div className="stat-card-label">Bodyweight change this week</div>
        </div>
      </div>

      <div className="workout-list">
        <div className="workout-list-title">Sessions</div>
        {mockWorkouts.map(workout => (
          <div
            key={workout.id}
            className="workout-card"
            onClick={() => setSelectedWorkout(workout)}
          >
            <div className="workout-card-header">
              <span className="workout-card-name">{workout.name}</span>
              <span className="workout-card-date">{workout.date}</span>
            </div>
            <div className="workout-card-tags">
              {workout.tags.map(tag => (
                <span key={tag.label} className={`tag tag-${tag.type}`}>
                  {tag.label}
                </span>
              ))}
            </div>
            <div className="workout-card-meta">
              {workout.exercises.length} exercises · {workout.duration} min
            </div>
          </div>
        ))}
      </div>

      <div className={`detail-panel ${selectedWorkout ? 'open' : ''}`}>
        {selectedWorkout && (
          <>
            <div className="detail-header">
              <button
                className="detail-back-btn"
                onClick={() => setSelectedWorkout(null)}
              >
                {'\u2192'}
              </button>
              <span className="detail-title">{selectedWorkout.name}</span>
            </div>
            <div className="detail-body">
              <div className="detail-meta">
                {selectedWorkout.date} · {selectedWorkout.duration} min
              </div>
              <div className="detail-section-title">Exercises</div>
              <div className="exercise-list">
                {selectedWorkout.exercises.map(exercise => (
                  <div key={exercise.name} className="exercise-item">
                    <div>
                      <div className="exercise-name">{exercise.name}</div>
                      <div className="exercise-sets">
                        {exercise.sets} sets × {exercise.reps} reps
                      </div>
                    </div>
                    <div className="exercise-weight">
                      {exercise.weight > 0 ? `${exercise.weight} kg` : 'Bodyweight'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}