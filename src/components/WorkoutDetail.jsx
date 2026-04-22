import { useEffect, useRef } from 'react'

export default function WorkoutDetail({ workout, onClose }) {
  const lastWorkout = useRef(null)

  useEffect(() => {
    if (workout) {
      lastWorkout.current = workout
    }
  }, [workout])

  const displayed = workout || lastWorkout.current

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
          </>
        )}
      </div>
    </div>
  )
}
