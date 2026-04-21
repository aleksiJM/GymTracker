export default function WorkoutCard({ workout, onClick }) {
    return (
        <article className="workout-card" onClick={onClick}>
            <header className="workout-card-header">
                <h3 className="workout-card-name">{workout.name}</h3>
                <span className="workout-card-date">{workout.date}</span>
            </header>
            <div className="workout-card-tags">
                {workout.tags.map(tag => (
                    <span key={tag.label} className={`tag tag-${tag.type}`}>
                        {tag.label}
                    </span>
                ))}
            </div>
            <p className="workout-card-meta">
                {workout.exercises.length} exercises · {workout.exercises.reduce(
                    (sum, ex) => sum + ex.sets, 0)} sets
            </p>
        </article>
    )
}