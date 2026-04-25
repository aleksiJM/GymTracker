import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MUSCLE_GROUPS = {
  Chest: ['Upper', 'Middle', 'Lower'],
  Deltoids: ['Front', 'Side', 'Rear'],
  Back: ['Traps', 'Rhomboids', 'Teres major', 'Lats'],
  Biceps: [],
  Triceps: ['Long', 'Lateral and medial'],
  Quads: [],
  Hamstrings: [],
  Glutes: [],
  Calves: [],
  Core: [],
}

function MuscleTag({ muscle, onRemove }) {
  return (
    <Badge
      variant='secondary'
      className='flex items-center gap-1 text-xs font-medium bg-emerald-950 text-emerald-400 hover:bg-emerald-950'
    >
      {muscle.muscle_group}
      {muscle.region ? ` · ${muscle.region}` : ''}
      <button
        onClick={() => onRemove(muscle)}
        className='ml-0.5 text-emerald-400 hover:text-white cursor-pointer'
      >
        &times;
      </button>
    </Badge>
  )
}

function MuscleSelector({ muscles, onChange }) {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')

  const addMuscle = () => {
    if (!selectedGroup) return
    const already = muscles.some(
      (m) =>
        m.muscle_group === selectedGroup &&
        m.region === (selectedRegion || null)
    )
    if (already) return
    onChange([
      ...muscles,
      {
        muscle_group: selectedGroup,
        region: selectedRegion || null,
      },
    ])
    setSelectedGroup('')
    setSelectedRegion('')
  }

  const removeMuscle = (muscle) => {
    onChange(
      muscles.filter(
        (m) =>
          !(
            m.muscle_group === muscle.muscle_group && m.region === muscle.region
          )
      )
    )
  }

  const regions = selectedGroup ? MUSCLE_GROUPS[selectedGroup] : []

  return (
    <div className='mb-3'>
      {muscles.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-2'>
          {muscles.map((m, i) => (
            <MuscleTag key={i} muscle={m} onRemove={removeMuscle} />
          ))}
        </div>
      )}
      <div className='flex gap-2 items-center'>
        <Select
          value={selectedGroup}
          onValueChange={(val) => {
            setSelectedGroup(val)
            setSelectedRegion('')
          }}
        >
          <SelectTrigger className='flex-1 bg-secondary border-border text-foreground'>
            <SelectValue placeholder='Muscle group' />
          </SelectTrigger>
          <SelectContent className='bg-card border-border'>
            {Object.keys(MUSCLE_GROUPS).map((mg) => (
              <SelectItem key={mg} value={mg} className='text-foreground'>
                {mg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {regions.length > 0 && (
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className='flex-1 bg-secondary border-border text-foreground'>
              <SelectValue placeholder='(Optional)' />
            </SelectTrigger>
            <SelectContent className='bg-card border-border'>
              {regions.map((r) => (
                <SelectItem key={r} value={r} className='text-foreground'>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant='outline'
          size='sm'
          className='border-primary text-primary hover:bg-primary/10 cursor-pointer'
          onClick={addMuscle}
        >
          +
        </Button>
      </div>
    </div>
  )
}

function ExerciseBlock({ exercise, onChange, onRemove }) {
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

      <MuscleSelector
        muscles={exercise.muscles || []}
        onChange={(muscles) => onChange({ ...exercise, muscles })}
      />

      <div className='grid grid-cols-[2rem_1fr_1fr] gap-2 mb-1'>
        <div />
        <div className='text-xs text-muted-foreground text-center'>Reps</div>
        <div className='text-xs text-muted-foreground text-center'>
          Weight (kg)
        </div>
      </div>

      {exercise.sets.map((set, index) => (
        <div key={index} className='grid grid-cols-[2rem_1fr_1fr] gap-2 mb-2'>
          <span className='text-sm text-muted-foreground font-medium self-center'>
            S{index + 1}
          </span>
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
        </div>
      ))}
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
  const [setCount, setSetCount] = useState(3)
  const lastWorkoutName = useRef(workoutName)

  useEffect(() => {
    if (isOpen) {
      setExercises(initialExercises)
      setExerciseName('')
      setSetCount(3)
      lastWorkoutName.current = workoutName
    }
  }, [isOpen])

  const addExercise = () => {
    if (!exerciseName.trim()) return
    const newExercise = {
      name: exerciseName.trim(),
      muscles: [],
      sets: Array.from({ length: setCount }, () => ({ reps: '', weight: '' })),
    }
    setExercises((prev) => [...prev, newExercise])
    setExerciseName('')
    setSetCount(3)
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
      className={`fixed top-0 left-1/2 w-full max-w-[430px] h-screen bg-card z-50 overflox-y-auto transition-transform duration-300
        ${isOpen ? '-translate-x-1/2' : 'translate-x-[calc(-50%+100%)]'}`}
    >
      <div className='px-6 pt-6 pb-24'>
        <div className='flex items-center gap-3 mb-6'>
          <Button
            className='text-primary text-xl bg-transparent border-none cursor-pointer'
            onClick={onCancel}
          >
            &rarr;
          </Button>
          <h1 className='text-[1.375rem] font-medium text-foreground'>
            {lastWorkoutName.current}
          </h1>
        </div>

        {exercises.map((exercise, index) => (
          <ExerciseBlock
            key={index}
            exercise={exercise}
            onChange={(updated) => updateExercise(index, updated)}
            onRemove={() => removeExercise(index)}
          />
        ))}

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mt-5 mb-3'>
          Add exercise
        </p>

        <Input
          type='text'
          placeholder='Exercise name'
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExercise()}
          className='bg-secondary border-border text-foreground mb-2'
        />

        <div className='flex gap-2 mb-5'>
          <Input
            type='number'
            min='1'
            max='10'
            value={setCount}
            onChange={(e) => setSetCount(parseInt(e.target.value))}
            className='bg-secondary border-border text-foreground w-20 text-center'
            title='Number of sets'
          />
          <Button
            variant='outline'
            className='flex-1 border-primary text-primary hover:bg-primary/10 cursor-pointer'
            onClick={addExercise}
          >
            Add exercise
          </Button>
        </div>

        <Button
          className='w-full bg-primary text-primary-foreground hover:opacity-90 mb-3 cursor-pointer'
          onClick={handleSave}
        >
          Save workout
        </Button>
        <Button
          variant='outline'
          className='w-full border-border text-muted-foreground cursor-pointer'
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
