import { useEffect, useRef } from 'react'

export default function WorkoutDetail({ workout, onClose }) {
    const lastWorkout = useRef(null)

    useEffect(() => {
        if (workout) {
            lastWorkout.current = workout
        }
    }, [workout])

    const displayed = workout || lastWorkout.current

    return (
        <div className={`detail-panel ${workout ? 'open' : ''}`}>
            {displayed && (
                <>
                    <div className="detail-header">
                        <button className="detail-back-btn" onClick={onClose}>
                            {'\u2192'}
                        </button>
                        <span className="detail-title">{displayed.name}</span>
                    </div>
                    <div className="detail-body">
                        <p className="detail-meta">
                            {displayed.exercises.reduce(
                                (sum, ex) => sum + ex.sets, 0)} sets · {displayed.exercises.reduce(
                                    (sum, ex) => sum + ex.reps, 0)} reps
                        </p>
                        <div className="detail-section-title">Exercises</div>
                        <div className="exercise-list">
                            {displayed.exercises.map(exercise => (
                                <div key={exercise.name} className="exercise-item">
                                    <div>
                                        <div className="exercise-name">{exercise.name}</div>
                                        <div className="exercise-sets">
                                            {exercise.sets} sets &times; {exercise.reps} reps
                                        </div>
                                    </div>
                                    <div className="exercise-weight">
                                        {exercise.weight > 0 ? `${exercise.weight} kg` : `Bodyweight`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}