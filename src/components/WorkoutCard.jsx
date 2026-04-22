export default function WorkoutCard({ workout, onClick }) {
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  )

  const muscleGroups = [
    ...new Set(
      workout.exercises
        .flatMap((ex) => ex.exercise_muscles.map((m) => m.muscle_group))
        .filter(Boolean)
    ),
  ]

  const tagType = (muscle) => {
    if (['Chest', 'Shoulders', 'Triceps'].includes(muscle)) return 'push'
    if (['Back', 'Biceps'].includes(muscle)) return 'pull'
    if (['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle))
      return 'legs'
    return 'core'
  }

  return (
    <article className='workout-card' onClick={onClick}>
      <header className='workout-card-header'>
        <h3 className='workout-card-name'>{workout.name}</h3>
        <span className='workout-card-date'>{workout.date}</span>
      </header>
      {muscleGroups.length > 0 && (
        <div className='workout-card-tags'>
          {muscleGroups.map((muscle) => (
            <span key={muscle} className={`tag tag-${tagType(muscle)}`}>
              {muscle}
            </span>
          ))}
        </div>
      )}
      <p className='workout-card-meta'>
        {workout.exercises.length} exercises · {totalSets} sets
      </p>
    </article>
  )
}
