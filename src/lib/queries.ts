import { supabase } from './supabase'

export const fetchWorkouts = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .select(
      `
            *,
            exercises (
                *,
                sets (*),
                exercise_muscles (*)
            )
        `
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const fetchBodyweight = async () => {
  const { data, error } = await supabase
    .from('bodyweight')
    .select('weight, created_at')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export const fetchExerciseLibrary = async () => {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*, exercise_library_muscles(*)')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const fetchWorkoutsForProgress = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .select(`date, created_at, exercises ( name, sets ( weight, reps ) )`)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

export const fetchExercisesForProgress = async () => {
  const { data, error } = await supabase
    .from('exercises')
    .select(`name, workout:workouts ( date )`)

  if (error) throw error
  return data
}

export const fetchExerciseProgress = async (exerciseName: string) => {
  const { data, error } = await supabase
    .from('exercises')
    .select(`workout:workouts ( date ), sets ( weight, reps )`)
    .eq('name', exerciseName)

  if (error) throw error
  return data
}
