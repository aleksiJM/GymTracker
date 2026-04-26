import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ActiveWorkout from '../components/ActiveWorkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Log() {
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [bodyweight, setBodyweight] = useState('')
  const [saving, setSaving] = useState(false)

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

      if (!error && data && data.length > 0)
        setBodyweight(String(data[0].weight))
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

  const handleSaveBodyweight = async () => {
    if (!bodyweight) return
    setSaving(true)

    const { error } = await supabase
      .from('bodyweight')
      .insert({ weight: parseFloat(bodyweight) })

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    setSaving(false)
  }

  if (loading) return

  return (
    <>
      <div className='px-6 pt-6 pb-4'>
        <h1 className='text-[1.375rem] font-medium text-foreground'>Log</h1>
        <p className='text-sm text-muted-foreground mb-5'>
          Start a new workout and track bodyweight
        </p>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
          Bodyweight
        </p>
        <div className='flex gap-2 mb-5'>
          <Input
            type='number'
            placeholder='e.g. 80.0'
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            className='bg-secondary border-border text-foreground flex-1 text-center'
          />
          <Button
            onClick={handleSaveBodyweight}
            disabled={saving}
            className='bg-primary text-primary-foreground flex-1 cursor-pointer hover:opacity-90 transition-opacity'
          >
            {saving ? 'Saving...' : 'Update'}
          </Button>
        </div>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
          Create workout
        </p>

        <Button
          className='p-6 w-full bg-primary text-primary-foreground rounded-xl text-[0.9375rem] font-medium cursor-pointer hover:opacity-90 transition-opacity mb-5'
          onClick={() => setShowNameModal(true)}
        >
          + Start new workout
        </Button>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
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
              className='bg-card border border-border rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-secondary active:scale-95 transition-all duration-100 select-none'
              onClick={() => repeatWorkout(workout)}
            >
              <div className='flex justify-between items-center'>
                <h3 className='text-[0.9375rem] font-medium text-foreground'>
                  {workout.name}
                </h3>
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
        <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
          <DialogContent className='bg-card border-border max-w-[400px]'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>New workout</DialogTitle>
            </DialogHeader>
            <Input
              type='text'
              placeholder='e.g. Push day'
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startNew()}
              className='bg-secondary border-border text-foreground'
              autoFocus
            />
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                className='border-border text-muted-foreground cursor-pointer'
                onClick={() => setShowNameModal(false)}
              >
                Cancel
              </Button>
              <Button
                className='bg-primary text-primary-foreground cursor-pointer hover:opacity-90'
                onClick={startNew}
              >
                Start
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
