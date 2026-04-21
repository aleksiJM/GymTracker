export default function WorkoutDetail({ workout, onClose }) {
    return (
        <div className={`detail-panel ${workout ? 'open' : ''}`}>
            {workout && (
                <>
                    <div className="detail-header">
                        <button className="detail-back-btn" onClick={onClose}>
                            {'\u2192'}
                        </button>
                        <span className="detail-title">{workout.name}</span>
                    </div>
                    <div className="detail-body">
                        <p className="detail-meta">
                            {workout.exercises.reduce(
                                (sum, ex) => sum + ex.sets, 0)} sets · {workout.exercises.reduce(
                                    (sum, ex) => sum + ex.reps, 0)} reps
                        </p>
                        <div className="detail-section-title">Exercises</div>
                        <div className="exercise-list">
                            {workout.exercises.map(exercise => (
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