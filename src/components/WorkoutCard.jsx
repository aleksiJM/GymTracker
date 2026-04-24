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

  const tagColor = (muscle) => {
    if (['Chest', 'Shoulders', 'Triceps'].includes(muscle))
      return 'bg-emerald-950 text-emerald-400'
    if (['Back', 'Biceps'].includes(muscle)) return 'bg-blue-950 text-blue-400'
    if (['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle))
      return 'bg-red-950 text-red-400'
    return 'bg-yellow-950 text-yellow-400'
  }

  return (
    <article
      className='bg-card border border-border rounded-x1 px-4 py-3 mb-2 cursor-pointer hover:bg-secondary transition-colors'
      onClick={onClick}
    >
      <header className='flex justify-between items-start'>
        <h3 className='text-[0.9375rem] font-medium text-foreground'>
          {workout.name}
        </h3>
        <span className='text-xs text-muted-foreground'>{workout.date}</span>
      </header>
      {muscleGroups.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mt-2'>
          {muscleGroups.map((muscle) => (
            <span
              key={muscle}
              className={`text-[0.6875rem] font-medium px-2 py-0.5 rounded-full ${tagColor(muscle)}`}
            >
              {muscle}
            </span>
          ))}
        </div>
      )}
      <p className='text-xs text-muted-foreground mt-2'>
        {workout.exercises.length} exercises · {totalSets} sets
      </p>
    </article>
  )
}
