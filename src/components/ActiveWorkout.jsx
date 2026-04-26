import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ExercisePicker from './ExercisePicker'

function ExerciseBlock({ exercise, onChange, onRemove }) {
  const addSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1]
    onChange({
      ...exercise,
      sets: [
        ...exercise.sets,
        { reps: lastSet?.reps || '', weight: lastSet?.weight || '' },
      ],
    })
  }

  const removeSet = (index) => {
    if (exercise.sets.length === 1) return
    onChange({
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== index),
    })
  }

  const updateSet = (index, field, value) => {
    const updatedSets = exercise.sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    )
    onChange({ ...exercise, sets: updatedSets })
  }

  const blockInvalidKeys = (e) => {
    const allowed = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      '.',
    ]
    if (!allowed.includes(e.key) && isNaN(Number(e.key))) e.preventDefault()
  }

  const blockInvalidKeysNoDecimal = (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
    if (!allowed.includes(e.key) && isNaN(Number(e.key))) e.preventDefault()
  }

  return (
    <div className='bg-secondary border border-border rounded-x1 p-4 mb-3'>
      <div className='flex justify-between items-center mb-3'>
        <span className='text-[0.9375rem] font-medium text-foreground'>
          {exercise.name}
        </span>
        <Button
          variant='outline'
          size='sm'
          className='border-destructive text-destructive hover:bg-destructive/10 cursor-pointer'
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>

      <div className='grid grid-cols-[1fr_1fr_1.5rem] gap-2 mb-1'>
        <div className='text-xs text-muted-foreground text-center'>Reps</div>
        <div className='text-xs text-muted-foreground text-center'>
          Weight (kg)
        </div>
        <div />
      </div>

      {exercise.sets.map((set, index) => (
        <div
          key={index}
          className='grid grid-cols-[1fr_1fr_1.5rem] gap-2 mb-2 items-center'
        >
          <Input
            type='number'
            min='1'
            value={set.reps}
            placeholder='0'
            onKeyDown={blockInvalidKeysNoDecimal}
            className='bg-card border-border text-foreground text-center'
            onChange={(e) => updateSet(index, 'reps', e.target.value)}
          />
          <Input
            type='number'
            min='1'
            value={set.weight}
            placeholder='0'
            onKeyDown={blockInvalidKeys}
            className='bg-card border-border text-foreground text-center'
            onChange={(e) => updateSet(index, 'weight', e.target.value)}
          />
          <Button
            className='text-muted-foreground hover:text-destructive transition-colors cursor-pointer bg-transparent border-none text-lg leading-none pb-1'
            onClick={() => removeSet(index)}
            disabled={exercise.sets.length === 1}
          >
            &times;
          </Button>
        </div>
      ))}

      <Button
        variant='outline'
        className='w-full border-border text-muted-foreground hover:text-foreground mt-1'
        onClick={addSet}
      >
        + Add set
      </Button>
    </div>
  )
}

export default function ActiveWorkout({
  workoutName,
  initialExercises = [],
  onSave,
  onCancel,
  isOpen,
}) {
  const [exercises, setExercises] = useState(initialExercises)
  const [exerciseName, setExerciseName] = useState('')
  const [setCount, setSetCount] = useState(1)
  const lastWorkoutName = useRef(workoutName)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setExercises(initialExercises)
      setExerciseName('')
      setSetCount(3)
      lastWorkoutName.current = workoutName
    }
  }, [isOpen])

  const addExercise = (libraryExercise) => {
    const newExercise = {
      name: libraryExercise.name,
      muscles: libraryExercise.exercise_library_muscles || [],
      sets: [{ reps: '', weight: '' }],
    }
    setExercises((prev) => [...prev, newExercise])
    setShowPicker(false)
  }

  const updateExercise = (index, updated) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? updated : ex)))
  }

  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const cleaned = exercises.map((ex) => ({
      name: ex.name,
      muscles: ex.muscles || [],
      sets: ex.sets.map((s) => ({
        reps: parseFloat(s.reps) || 0,
        weight: parseFloat(s.weight) || 0,
      })),
    }))
    onSave({ name: workoutName, exercises: cleaned })
  }

  return (
    <div
      className={`fixed top-0 left-1/2 w-full max-w-[430px] h-screen bg-card z-50 flex flex-col transition-transform duration-300
        ${isOpen ? '-translate-x-1/2' : 'translate-x-[calc(-50%+100%)]'}`}
    >
      <div className='flex items-center gap-3 px-6 py-5 border-b border-border shrink-0 mb-2'>
        <button
          className='text-primary text-xl bg-transparent border-none cursor-pointer'
          onClick={onCancel}
        >
          &rarr;
        </button>
        <h1 className='text-[1.375rem] font-medium text-foreground'>
          {lastWorkoutName.current}
        </h1>
      </div>

      <div className='flex-1 overflow-y-auto px-6 py-4'>
        {exercises.map((exercise, index) => (
          <ExerciseBlock
            key={index}
            exercise={exercise}
            onChange={(updated) => updateExercise(index, updated)}
            onRemove={() => removeExercise(index)}
          />
        ))}

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mt-2 mb-3'>
          Add exercise
        </p>

        <Button
          variant='outline'
          className='p-4 w-full border-primary text-primary hover:bg-primary/10 cursor-pointer'
          onClick={() => setShowPicker(true)}
        >
          + Add exercise
        </Button>
      </div>

      <div className='px-6 py-4 border-t border-border shrink-0 mb-2'>
        <Button
          className='p-6 w-full bg-primary text-primary-foreground hover:opacity-90 mb-2 cursor-pointer mt-2'
          onClick={handleSave}
        >
          Save workout
        </Button>
        <Button
          variant='outline'
          className='p-6 w-full border-border text-muted-foreground cursor-pointer'
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <ExercisePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addExercise}
      />
    </div>
  )
}
