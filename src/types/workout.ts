import type { Tables } from '@/lib/database.types'

export type ExerciseMuscleRow = Tables<'exercise_muscles'>
export type SetRow = Tables<'sets'>
export type ExerciseRow = Tables<'exercises'>

export type ExerciseWithRelations = ExerciseRow & {
  sets: SetRow[]
  exercise_muscles: ExerciseMuscleRow[]
}

export type WorkoutWithRelations = Tables<'workouts'> & {
  exercises: ExerciseWithRelations[]
}

export type ExerciseLibraryMuscleRow = Tables<'exercise_library_muscles'>
export type ExerciseLibraryRow = Tables<'exercise_library'> & {
  exercise_library_muscles?: ExerciseLibraryMuscleRow[]
}

export type BodyweightRow = Pick<
  Tables<'bodyweight'>,
  'weight' | 'created_at'
>

export type MuscleDraft = {
  muscle_group: string
  region: string | null
}

/** Log / ActiveWorkout draft: string fields in inputs until save */
export type DraftSet = { reps: string; weight: string }

export type DraftExercise = {
  name: string
  muscles: MuscleDraft[]
  sets: DraftSet[]
}

export type ActiveWorkoutDraft = {
  name: string
  exercises: DraftExercise[]
}
