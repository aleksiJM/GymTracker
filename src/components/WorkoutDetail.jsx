import { supabase } from '../lib/supabase'
import { useEffect, useRef, useState } from 'react'

export default function WorkoutDetail({ workout, onClose, onDelete }) {
  const lastWorkout = useRef(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (workout) {
      lastWorkout.current = workout
    }
  }, [workout])

  const displayed = workout || lastWorkout.current

  const handleDelete = async () => {
    if (!displayed) return
    setDeleting(true)
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', displayed.id)

    if (error) {
      console.error(error)
      setDeleting(false)
      return
    }

    setShowConfirm(false)
    setDeleting(false)
    onDelete(displayed.id)
    onClose()
  }

  const totalSets = displayed
    ? displayed.exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0)
    : 0

  const totalReps = displayed
    ? displayed.exercises.reduce(
        (sum, ex) =>
          sum +
          (ex.sets?.reduce((setSum, set) => setSum + (set.reps || 0), 0) || 0),
        0
      )
    : 0

  return (
    <div
      className={`fixed top-0 left-1/2 w-full max-w-[430px] h-screen bg-card z-50 overflow-y-auto transition-transform duration-300
      ${workout ? '-translate-x-1/2' : 'translate-x-[calc(-50%+100%)]'}`}
    >
      <div className='flex items-center gap-3 px-6 py-5 border-b border-border sticky top-0 bg-card'>
        <button
          className='text-primary text-x1 bg-transparent border-none cursor-pointer'
          onClick={onClose}
        >
          {'\u2192'}
        </button>
        <span className='text-[1.0625rem] font-medium text-foreground'>
          {displayed ? displayed.name : ''}
        </span>
      </div>

      <div className='px-6 py-5'>
        {!displayed ? (
          <div />
        ) : (
          <>
            <p className='text-sm text-muted-foreground mb-5'>
              {totalSets} sets · {totalSets} reps
            </p>

            <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
              Exercises
            </p>

            <div className='border border-border rounded-x1 overflow-hidden mb-4'>
              {displayed.exercises.map((exercise, i) => {
                const firstSet = exercise.sets[0]
                return (
                  <div
                    key={exercise.id}
                    className={`flex justify-between items-center px-4 py-3
                      ${i < displayed.exercises.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <div>
                      <div className='text-[0.9375rem] font-medium text-foreground'>
                        {exercise.name}
                      </div>
                      {exercise.exercise_muscles?.length > 0 && (
                        <div className='text-xs text-muted-foreground mt-0.5'>
                          {exercise.exercise_muscles.map((m, i) => (
                            <span key={i}>
                              {m.muscle_group}
                              {m.region ? ` · ${m.region}` : ''}
                              {i < exercise.exercise_muscles.length - 1
                                ? ', '
                                : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        {exercise.sets?.length || 0} sets
                      </div>
                    </div>
                    <div className='text-[0.9375rem] font-medium text-primary'>
                      {firstSet?.weight > 0
                        ? `${firstSet.weight} kg`
                        : `Bodyweight`}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              className='w-full py-3.5 text-destructive border border-destructive rounded-x1 text-[0.9375rem] font-medium cursor-pointer hover:bg-destructive/10 transition-colors'
              onClick={() => setShowConfirm(true)}
            >
              Delete workout
            </button>

            {showConfirm && (
              <div
                className='fixed inset-0 bg-black/50 flex items-end justify-center z-50'
                onClick={() => setShowConfirm(false)}
              >
                <div
                  className='bg-card rounded-t-2x1 p-6 w-full max-w-[430px]'
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className='text-[1.0625rem] font-medium text-foreground mb-2'>
                    Delete workout?
                  </h3>
                  <p className='text-sm text-muted-foreground mb-5'>
                    This will permanently delete "{displayed.name}" and all its
                    exercises.
                  </p>
                  <div className='grid grid-cols-2 gap-3'>
                    <button
                      className='py-3 border border-border rounded-x1 text-muted-foreground cursor-pointer hover:bg-secondary transition-colors'
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className='py-3 bg-destructive text-white rounded-x1 font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50'
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
