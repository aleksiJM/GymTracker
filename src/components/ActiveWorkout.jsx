import { useState, useEffect, useRef } from 'react'

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
    <span className='muscle-tag'>
      {muscle.muscle_group}
      {muscle.region ? ` · ${muscle.region}` : ''}
      <button className='muscle-tag-remove' onClick={() => onRemove(muscle)}>
        &times;
      </button>
    </span>
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
    <div className='muscle-selector'>
      {muscles.length > 0 && (
        <div className='muscle-tag-list'>
          {muscles.map((m, i) => (
            <MuscleTag key={i} muscle={m} onRemove={removeMuscle} />
          ))}
        </div>
      )}
      <div className='muscle-selector-row'>
        <select
          className='add-exercise-input'
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value)
            setSelectedRegion('')
          }}
          style={{ flex: 1 }}
        >
          {Object.keys(MUSCLE_GROUPS).map((mg) => (
            <option key={mg} value={mg}>
              {mg}
            </option>
          ))}
        </select>
        {regions.length > 0 && (
          <select
            className='add-exercise-input'
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value=''>(Not specified)</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        <button className='btn-small' onClick={addMuscle}>
          +
        </button>
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

  return (
    <div className='exercise-block'>
      <div className='exercise-block-header'>
        <span className='exercise-block-name'>{exercise.name}</span>
        <button className='btn-danger' onClick={onRemove}>
          Remove
        </button>
      </div>
      <MuscleSelector
        muscles={exercise.muscles || []}
        onChange={(muscles) => onChange({ ...exercise, muscles })}
      />
      <div className='set-row'>
        <div />
        <div className='set-input-header'>Reps</div>
        <div className='set-input-header'>Weight (kg)</div>
      </div>
      {exercise.sets.map((set, index) => (
        <div className='set-row' key={index}>
          <span className='set-label'>S{index + 1}</span>
          <input
            className='set-input'
            type='number'
            value={set.reps}
            placeholder='0'
            onChange={(e) => updateSet(index, 'reps', e.target.value)}
          />
          <input
            className='set-input'
            type='number'
            step='0.5'
            value={set.weight}
            placeholder='0'
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
    <div className={`active-workout-panel ${isOpen ? 'open' : ''}`}>
      <div className='active-workout'>
        <div className='active-workout-header'>
          <button className='detail-back-btn' onClick={onCancel}>
            {'\u2192'}
          </button>
          <span className='active-workout-title'>
            {lastWorkoutName.current}
          </span>
        </div>

        {exercises.map((exercise, index) => (
          <ExerciseBlock
            key={index}
            exercise={exercise}
            onChange={(updated) => updateExercise(index, updated)}
            onRemove={() => removeExercise(index)}
          />
        ))}

        <div className='log-section-title' style={{ marginTop: '1rem' }}>
          Add exercise
        </div>
        <input
          className='add-exercise-input'
          type='text'
          placeholder='Exercise name'
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addExercise()}
        />
        <div className='add-exercise-row'>
          <input
            className='set-input'
            type='number'
            min='1'
            max='10'
            value={setCount}
            onChange={(e) => setSetCount(parseInt(e.target.value))}
            style={{ width: '4rem' }}
            title='Number of sets'
          />
          <button className='btn-small' onClick={addExercise}>
            Add
          </button>
        </div>
        <button className='btn-primary' onClick={handleSave}>
          Save workout
        </button>
        <button className='btn-secondary' onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
