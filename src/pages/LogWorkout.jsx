import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ActiveWorkout from '../components/ActiveWorkout'
import BodyweightModal from '../components/BodyweightModal'

/*
const recentWorkouts = [
  {
    id: 1,
    name: 'Push day',
    exercises: [
      {
        name: 'Bench press',
        sets: Array.from({ length: 4 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Overhead press',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Incline dumbbell press',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Lateral raises',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Tricep pushdown',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
    ],
  },
  {
    id: 2,
    name: 'Pull day',
    exercises: [
      {
        name: 'Deadlift',
        sets: Array.from({ length: 4 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Pull ups',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Barbell row',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Face pulls',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Barbell curl',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
    ],
  },
  {
    id: 3,
    name: 'Leg day',
    exercises: [
      {
        name: 'Squat',
        sets: Array.from({ length: 4 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Romanian deadlift',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Leg press',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Leg curl',
        sets: Array.from({ length: 3 }, () => ({ reps: '', weight: '' })),
      },
      {
        name: 'Calf raises',
        sets: Array.from({ length: 4 }, () => ({ reps: '', weight: '' })),
      },
    ],
  },
]
  */

export default function LogWorkout() {
  const [bodyweight, setBodyweight] = useState(83.5)
  const [showBodyweightModal, setShowBodyweightModal] = useState(false)
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

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
        .limit(8)

      if (error) console.error(error)
      else setRecentWorkouts(data)
      setLoading(false)
    }

    fetchWorkouts()
  }, [])

  const startNew = () => {
    if (!newWorkoutName.trim()) return
    setActiveWorkout({ name: newWorkoutName.trim(), exercises: [] })
    setShowNameModal(false)
    setNewWorkoutName('')
  }

  const repeatWorkout = (workout) => {
    const exercises = workout.exercises.map((ex) => ({
      name: ex.name,
      muscles: ex.exercise_muscles || [],
      sets: Array.from({ length: ex.sets.length }, () => ({
        reps: '',
        weight: '',
      })),
    }))
    setActiveWorkout({ name: workout.name, exercises: workout.exercises })
  }

  const saveWorkout = async (workout) => {
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .insert({ name: workout.name })
      .select()
      .single()

    if (workoutError) {
      console.error(workoutError)
      return
    }

    for (const [i, exercise] of workout.exercises.entries()) {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          workout_id: workoutData.id,
          name: exercise.name,
          order_index: i,
        })
        .select()
        .single()

      if (exerciseError) {
        console.error(exerciseError)
        return
      }

      if (exercise.muscles.length > 0) {
        const musclesToInsert = exercise.muscles.map((m) => ({
          exercise_id: exerciseData.id,
          muscle_group: m.muscle_group,
          region: m.region || null,
        }))
        const { error: musclesError } = await supabase
          .from('exercise_muscles')
          .insert(musclesToInsert)
        if (musclesError) console.error(musclesError)
      }

      const setsToInsert = exercise.sets.map((set, j) => ({
        exercise_id: exerciseData.id,
        set_number: j + 1,
        reps: set.reps,
        weight: set.weight,
      }))

      const { error: setsError } = await supabase
        .from('sets')
        .insert(setsToInsert)

      if (setsError) {
        console.error(setsError)
        return
      }

      const { data: updatedWorkouts } = await supabase
        .from('workouts')
        .select(`*, exercises (*, sets (*), exercise_muscles (*))`)
        .order('created_at', { ascending: false })
        .limit(5)
    }

    if (updatedWorkouts) setRecentWorkout(updatedWorkouts)
    setActiveWorkout(null)
  }

  if (loading) return <div className='page'>Loading...</div>

  return (
    <>
      <div className='log-page'>
        <div className='log-title'>Log workout</div>
        <div className='log-subtitle'>
          Start a new session or repeat a previous one
        </div>

        <button
          className='btn-bodyweight'
          onClick={() => setShowBodyweightModal(true)}
        >
          <span>Bodyweight</span>
          <span className='bodyweight-value'>{bodyweight} kg</span>
          <span
            style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)' }}
          >
            &#x270E;
          </span>
        </button>

        <button className='btn-primary' onClick={() => setShowNameModal(true)}>
          + Start new workout
        </button>

        <div className='log-section-title'>Repeat previous</div>

        {loading ? (
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            Loading...
          </div>
        ) : recentWorkouts.length === 0 ? (
          <div
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            No previous workouts yet
          </div>
        ) : (
          recentWorkouts.map((workout) => (
            <div
              key={workout.id}
              className='workout-card'
              onClick={() => repeatWorkout(workout)}
            >
              <div className='workout-card-header'>
                <span className='workout-card-name'>{workout.name}</span>
                <span
                  style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}
                >
                  Repeat &rarr;
                </span>
              </div>
              <div className='workout-card-meta'>
                {workout.exercises.length} exercises
              </div>
            </div>
          ))
        )}

        {showNameModal && (
          <div
            className='modal-overlay'
            onClick={() => setShowNameModal(false)}
          >
            <div className='modal-box' onClick={(e) => e.stopPropagation()}>
              <div className='modal-title'>New workout</div>
              <input
                className='modal-input'
                type='text'
                placeholder='e.g. Push day'
                value={newWorkoutName}
                onChange={(e) => setNewWorkoutName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startNew()}
                autoFocus
              />
              <div className='modal-actions'>
                <button
                  className='modal-cancel'
                  onClick={() => setShowNameModal(false)}
                >
                  Cancel
                </button>
                <button className='modal-confirm' onClick={startNew}>
                  Start
                </button>
              </div>
            </div>
          </div>
        )}

        {showBodyweightModal && (
          <BodyweightModal
            current={bodyweight}
            onSave={(val) => {
              setBodyweight(val)
              setShowBodyweightModal(false)
            }}
            onClose={() => setShowBodyweightModal(false)}
          />
        )}
      </div>

      <ActiveWorkout
        workoutName={activeWorkout?.name ?? ''}
        initialExercises={activeWorkout?.exercises ?? []}
        onSave={saveWorkout}
        onCancel={() => setActiveWorkout(null)}
        isOpen={!!activeWorkout}
      />
    </>
  )
}
