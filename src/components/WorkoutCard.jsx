import { Badge } from '@/components/ui/badge'
import { MUSCLE_TAG_COLORS } from '@/constants/constants'

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

  return (
    <article
      className='bg-card border border-border rounded-xl px-4 py-3 mb-2 cursor-pointer hover:bg-secondary transition-colors active:scale-97 transition-all duration-100 select-none'
      onClick={onClick}
    >
      <div className='flex justify-between items-start'>
        <h3 className='text-[0.9375rem] font-medium text-foreground'>
          {workout.name}
        </h3>
        <span className='text-xs text-primary'>{workout.date}</span>
      </div>
      {muscleGroups.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mt-1'>
          {muscleGroups.map((muscle) => (
            <Badge
              key={muscle}
              className={`text-[0.6875rem] font-medium px-2 py-0.5 rounded-full border-none ${MUSCLE_TAG_COLORS(muscle)}`}
            >
              {muscle}
            </Badge>
          ))}
        </div>
      )}
      <p className='text-xs text-muted-foreground mt-1'>
        {workout.exercises.length} exercises · {totalSets} sets
      </p>
    </article>
  )
}
