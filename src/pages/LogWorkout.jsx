import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ActiveWorkout from '../components/ActiveWorkout'
import BodyweightModal from '../components/BodyweightModal'

export default function LogWorkout() {
  const [showBodyweightModal, setShowBodyweightModal] = useState(false)
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [bodyweight, setBodyweight] = useState(null)

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

    const fetchBodyweight = async () => {
      const { data, error } = await supabase
        .from('bodyweight')
        .select('weight')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) setBodyweight(data[0].weight)
    }

    fetchWorkouts()
    fetchBodyweight()
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
    setActiveWorkout({ name: workout.name, exercises })
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

      if (exercise.muscles && exercise.muscles.length > 0) {
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
    }

    const { data: updatedWorkouts } = await supabase
      .from('workouts')
      .select(`*, exercises (*, sets (*), exercise_muscles (*))`)
      .order('created_at', { ascending: false })
      .limit(8)

    if (updatedWorkouts) setRecentWorkouts(updatedWorkouts)
    setActiveWorkout(null)
  }

  if (loading) return

  return (
    <>
      <div className='px-6 pt-6 pb-4'>
        <h1 className='text-[1.375rem] font-medium text-foreground'>
          Log workout
        </h1>
        <p className='text-sm text-muted-foreground mb-5'>
          Start a new session or repeat a previous one
        </p>

        <button
          className='flex items-center gap-2 w-50 px-4 py-3 bg-secondary border border-border rounded-xl text-sm text-foreground mb-3 cursor-pointer hover:opacity-80 transition-opacity'
          onClick={() => setShowBodyweightModal(true)}
        >
          <span className='text-muted-foreground'>Bodyweight</span>
          <span className='font-medium text-primary'>
            {bodyweight ? `${bodyweight} kg` : 'Not set'}
          </span>
          <span className='ml-auto text-muted-foreground'>&#x270E;</span>
        </button>

        <button
          className='w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-[0.9375rem] font-medium cursor-pointer hover:opacity-90 transition-opacity mb-5'
          onClick={() => setShowNameModal(true)}
        >
          + Start new workout
        </button>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Repeat previous
        </p>

        {recentWorkouts.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            No previous workouts yet
          </p>
        ) : (
          recentWorkouts.map((workout) => (
            <div
              key={workout.id}
              className='bg-card border border-border rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-secondary transition-colors'
              onClick={() => repeatWorkout(workout)}
            >
              <div className='flex justify-between items-center'>
                <span className='text-[0.9375rem] font-medium text-foreground'>
                  {workout.name}
                </span>
                <span className='text-xs text-primary'>Repeat &rarr;</span>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                {workout.exercises.length} exercises
              </p>
            </div>
          ))
        )}
      </div>

      {showNameModal && (
        <div
          className='fixed inset-0 bg-black/50 flex items-end justify-center z-50'
          onClick={() => setShowNameModal(false)}
        >
          <div
            className='bg-card rounded-t-2xl p-6 w-full max-w-[430px]'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-[1.0625rem] font-medium text-foreground mb-4'>
              New workout
            </h3>
            <input
              className='w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground text-[0.9375rem] mb-4 outline-none focus:border-primary'
              type='text'
              placeholder='e.g. Push day'
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNew()}
              autoFocus
            />
            <div className='grid grid-cols-2 gap-3'>
              <button
                className='py-3 border border-border rounded-xl text-muted-foreground cursor-pointer hover:bg-secondary transition-colors'
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </button>
              <button
                className='py-3 bg-primary text-primary-foreground rounded-xl font-medium cursor-pointer hover:opacity-90 transition-opacity'
                onClick={startNew}
              >
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
