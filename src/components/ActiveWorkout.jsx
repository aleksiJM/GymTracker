import { useState } from 'react'

function ExerciseBlock({ exercise, onChange, onRemove }) {
  const updateSet = (index, field, value) => {
    const updatedSets = exercise.sets.map((set, i) =>
      i === index ? { ...set, [field]: value } : set
    )
    onChange({ ...exercise, sets: updatedSets })
  }

  return (
    <div className="exercise-block">
      <div className="exercise-block-header">
        <span className="exercise-block-name">{exercise.name}</span>
        <button className="btn-danger" onClick={onRemove}>Remove</button>
      </div>
      <div className="set-row">
        <div />
        <div className="set-input-header">Reps</div>
        <div className="set-input-header">Weight (kg)</div>
      </div>
      {exercise.sets.map((set, index) => (
        <div className="set-row" key={index}>
          <span className="set-label">S{index + 1}</span>
          <input
            className="set-input"
            type="number"
            value={set.reps}
            placeholder="0"
            onChange={e => updateSet(index, 'reps', e.target.value)}
          />
          <input
            className="set-input"
            type="number"
            step="0.5"
            value={set.weight}
            placeholder="0"
            onChange={e => updateSet(index, 'weight', e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

export default function ActiveWorkout({ workoutName, initialExercises = [], onSave, onCancel }) {
  const [exercises, setExercises] = useState(initialExercises)
  const [exerciseName, setExerciseName] = useState('')
  const [setCount, setSetCount] = useState(3)

  const addExercise = () => {
    if (!exerciseName.trim()) return
    const newExercise = {
      name: exerciseName.trim(),
      sets: Array.from({ length: setCount }, () => ({ reps: '', weight: '' }))
    }
    setExercises(prev => [...prev, newExercise])
    setExerciseName('')
    setSetCount(3)
  }

  const updateExercise = (index, updated) => {
    setExercises(prev => prev.map((ex, i) => i === index ? updated : ex))
  }

  const removeExercise = (index) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const cleaned = exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets.map(s => ({
        reps: parseFloat(s.reps) || 0,
        weight: parseFloat(s.weight) || 0,
      }))
    }))
    onSave({ name: workoutName, exercises: cleaned })
  }

  return (
    <div className="active-workout">
      <div className="active-workout-header">
        <button className="detail-back-btn" onClick={onCancel}>{'\u2192'}</button>
        <span className="active-workout-title">{workoutName}</span>
      </div>

      {exercises.map((exercise, index) => (
        <ExerciseBlock
          key={index}
          exercise={exercise}
          onChange={updated => updateExercise(index, updated)}
          onRemove={() => removeExercise(index)}
        />
      ))}

      <div className="log-section-title" style={{ marginTop: '1rem' }}>Add exercise</div>
      <div className="add-exercise-row">
        <input
          className="add-exercise-input"
          type="text"
          placeholder="Exercise name"
          value={exerciseName}
          onChange={e => setExerciseName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addExercise()}
        />
        <input
          className="set-input"
          type="number"
          min="1"
          max="10"
          value={setCount}
          onChange={e => setSetCount(parseInt(e.target.value))}
          style={{ width: '4rem' }}
          title="Number of sets"
        />
        <button className="btn-small" onClick={addExercise}>Add</button>
      </div>

      <button className="btn-primary" onClick={handleSave}>Save workout</button>
      <button className="btn-secondary" onClick={onCancel}>Cancel</button>
    </div>
  )
}