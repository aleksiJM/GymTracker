import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import Header from './Header'
import { useQueryClient } from '@tanstack/react-query'
import type { WorkoutWithRelations } from '@/types/workout'

type WorkoutDetailProps = {
  workout: WorkoutWithRelations | null
  onClose: () => void
  onDelete: (workoutId: string) => void
}

export default function WorkoutDetail({
  workout,
  onClose,
  onDelete,
}: WorkoutDetailProps) {
  const [lastWorkout, setLastWorkout] = useState<WorkoutWithRelations | null>(
    null
  )
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (workout) setLastWorkout(workout)
  }, [workout])

  const displayed = workout ?? lastWorkout

  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (!displayed) return
    setDeleting(true)
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', displayed.id)

    if (error) {
      console.error(error)
      setDeleting(false)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['workouts'] })
    setShowConfirm(false)
    setDeleting(false)
    onDelete(displayed.id)
    onClose()
  }

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
    <>
      <div
        className={`fixed top-0 left-1/2 w-full max-w-[430px] h-screen bg-card z-50 overflow-y-auto transition-transform duration-300
          ${workout ? '-translate-x-1/2' : 'translate-x-[calc(-50%+100%)]'}`}
      >
        <Header title={displayed?.name ?? ''} onClose={onClose} />

        <div className='px-6 py-5 select-none'>
          {!displayed ? (
            <div />
          ) : (
            <>
              <p className='text-sm text-primary mb-5'>
                {totalSets} sets · {totalReps} reps
              </p>

              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
                Exercises
              </p>

              <div className='border border-border rounded-xl overflow-hidden mb-4'>
                {displayed.exercises.map((exercise, i) => {
                  const firstSet = exercise.sets[0]
                  return (
                    <div
                      key={exercise.id}
                      className={`flex jusitify-between items-center px-4 py-3
                        ${i < displayed.exercises.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className='flex-1 min-w-0 pr-4'>
                        <div className='text-[0.9375rem] font-medium text-foreground'>
                          {exercise.name}
                        </div>
                        <div className='text-xs text-muted-foreground mt-0.5'>
                          {exercise.sets?.length || 0} sets ·{' '}
                          {exercise.sets?.reduce(
                            (sum, set) => sum + (set.reps || 0),
                            0
                          ) || 0}{' '}
                          reps
                        </div>
                      </div>
                      <div className='text-[0.9375rem] font-medium text-primary'>
                        {firstSet && (firstSet.weight ?? 0) > 0
                          ? `${firstSet.weight} kg`
                          : 'Bodyweight'}
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button
                variant='outline'
                className='w-full border-destructive text-destructive hover:bg-destructive/10 cursor-pointer'
                onClick={() => setShowConfirm(true)}
              >
                Delete workout
              </Button>
            </>
          )}
        </div>
      </div>

      {displayed && (
        <Dialog open={showConfirm}>
          <DialogContent className='max-w-[400px] bg-card border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                Delete workout?
              </DialogTitle>
            </DialogHeader>
            <p className='text-sm text-muted-foreground'>
              This will permanently delete &quot;{displayed.name}&quot; and all
              its exercises.
            </p>
            <DialogFooter className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                className='border-border text-muted-foreground cursor-pointer'
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className='bg-destructive text-white hover:opacity-90 cursor-pointer disabled:opacity-50'
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
