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
    <div className={`detail-panel ${workout ? 'open' : ''}`}>
      <div className='detail-header'>
        <button className='detail-back-btn' onClick={onClose}>
          {'\u2192'}
        </button>
        <span className='detail-title'>{displayed ? displayed.name : ''}</span>
      </div>
      <div className='detail-body'>
        {!displayed ? (
          <div className='empty-detail'></div>
        ) : (
          <>
            <p className='detail-meta'>
              {totalSets} sets · {totalSets} reps
            </p>
            <div className='detail-section-title'>Exercises</div>
            <div className='exercise-list'>
              {displayed.exercises.map((exercise) => {
                const firstSet = exercise.sets[0]

                return (
                  <div key={exercise.id} className='exercise-item'>
                    <div>
                      <div className='exercise-name'>{exercise.name}</div>
                      <div className='exercise-sets'>
                        {exercise.sets?.length || 0} sets
                      </div>
                    </div>
                    <div className='exercise-weight'>
                      {firstSet?.weight > 0
                        ? `${firstSet.weight} kg`
                        : `Bodyweight`}
                    </div>
                  </div>
                )
              })}
            </div>
            <button className='btn-delete' onClick={() => setShowConfirm(true)}>
              Delete workout
            </button>

            {showConfirm && (
              <div
                className='modal-overlay'
                onClick={() => setShowConfirm(false)}
              >
                <div className='modal-box' onClick={(e) => e.stopPropagation()}>
                  <div className='modal-title'>Delete workout?</div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary',
                      marginBottom: '1rem',
                    }}
                  >
                    This will permanently delete "{displayed.name}" and all its
                    exercises.
                  </p>
                  <div className='modal-actions'>
                    <button
                      className='modal-cancel'
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className='modal-confirm'
                      style={{ background: '#dc2626' }}
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
