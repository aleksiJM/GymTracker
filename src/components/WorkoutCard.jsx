export default function WorkoutCard({ workout, onClick }) {
    const totalSets = workout.exercises.reduce(
        (sum, ex) => sum + ex.sets.length, 0
    )

    return (
        <article className="workout-card" onClick={onClick}>
            <header className="workout-card-header">
                <h3 className="workout-card-name">{workout.name}</h3>
                <span className="workout-card-date">{workout.date}</span>
            </header>
            <p className="workout-card-meta">
                {workout.exercises.length} exercises · {totalSets} sets
            </p>
        </article>
    )
}