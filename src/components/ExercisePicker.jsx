import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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

const tagColor = (muscle) => {
  if (['Chest', 'Deltoids', 'Triceps'].includes(muscle))
    return 'bg-emerald-950 text-emerald-400 hover:bg-emerald-950'
  if (['Back', 'Biceps'].includes(muscle))
    return 'bg-blue-950 text-blue-400 hover:bg-blue-950'
  if (['Quads', 'Hamstrings', 'Glutes', 'Calves'].includes(muscle))
    return 'bg-red-950 text-red-400 hover:bg-red-950'
  return 'bg-yellow-950 text-yellow-400 hover:bg-yellow-950'
}

function CreateExerciseForm({ name, onCreated }) {
  const [muscles, setMuscles] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [saving, setSaving] = useState(false)

  const addMuscle = () => {
    if (!selectedGroup) return
    const already = muscles.some(
      (m) =>
        m.muscle_group === selectedGroup &&
        m.region === (selectedRegion || null)
    )
    if (already) return
    setMuscles((prev) => [
      ...prev,
      { muscle_group: selectedGroup, region: selectedRegion || null },
    ])
    setSelectedGroup('')
    setSelectedRegion('')
  }

  const removeMuscle = (muscle) => {
    setMuscles((prev) =>
      prev.filter(
        (m) =>
          !(
            m.muscle_group === muscle.muscle_group && m.region === muscle.region
          )
      )
    )
  }

  const regions = selectedGroup ? MUSCLE_GROUPS[selectedGroup] : []

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)

    const { data: exercise, error } = await supabase
      .from('exercise_library')
      .insert({ name: name.trim() })
      .select()
      .single()

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    if (muscles.length > 0) {
      const musclesToInsert = muscles.map((m) => ({
        exercise_library_id: exercise.id,
        muscle_group: m.muscle_group,
        region: m.region || null,
      }))
      const { error: musclesError } = await supabase
        .from('exercise_library_muscles')
        .insert(musclesToInsert)
      if (musclesError) console.error(musclesError)
    }

    onCreated({ ...exercise, exercise_library_muscles: muscles })
    setSaving(false)
  }

  return (
    <div className='border border-border rounded-xl p-4 mb-4 bg-secondary'>
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
        Create "{name}"
      </p>

      {muscles.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mb-3'>
          {muscles.map((m, i) => (
            <Badge
              key={i}
              className={`text-xs border-none cursor-pointer ${tagColor(m.muscle_group)}`}
              onClick={() => removeMuscle(m)}
            >
              {m.muscle_group}
              {m.region ? `· ${m.region}` : ''} &times;
            </Badge>
          ))}
        </div>
      )}

      <div className='flex gap-2 mb-3'>
        <Select
          value={selectedGroup}
          onValueChange={(val) => {
            setSelectedGroup(val)
            setSelectedRegion('')
          }}
        >
          <SelectTrigger className='flex-1 bg-card border-border text-foreground'>
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
            <SelectTrigger className='flex-1 bg-card border-border text-foreground'>
              <SelectValue placeholder='Region' />
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
          className='border-primary text-primary hover:bg-primary/10'
          onClick={addMuscle}
        >
          +
        </Button>
      </div>

      <Button
        className='w-full bg-primary text-primary-foreground hover:opacity-90'
        onClick={handleCreate}
        disabled={saving}
      >
        {saving ? 'Creating...' : 'Create exercise'}
      </Button>
    </div>
  )
}

export default function ExercisePicker({ isOpen, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    const fetchExercises = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*, exercise_library_muscles(*)')
        .order('name', { ascending: true })

      if (error) console.error(error)
      else setExercises(data)
      setLoading(false)
    }
    fetchExercises()
  }, [isOpen])

  const filtered = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  )

  const exactMatch = exercises.some(
    (ex) => ex.name.toLowerCase() === search.toLowerCase()
  )

  const handleCreated = (exercise) => {
    setExercises((prev) =>
      [...prev, exercise].sort((a, b) => a.name.localeCompare(b.name))
    )
    setSearch('')
    onSelect(exercise)
  }

  const handleSelect = (exercise) => {
    onSelect(exercise)
    setSearch('')
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 z-50' onClick={onClose} />
      )}

      <div
        className={`fixed left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border rounded-t-2x1 z-50 transition-transform duration-300
                ${isOpen ? 'bottom-0' : '-bottom-full'}`}
        style={{ maxHeight: '80vh' }}
      >
        <div className='flex items-center justify-between px-6 pt-5 pb-3'>
          <h2 className='text-[1.0625rem] font-medium text-foreground'>
            Add exercise
          </h2>
          <Button
            className='text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none text-xl'
            onClick={onClose}
          >
            &times;
          </Button>
        </div>

        <div className='px-6 pb-3'>
          <Input
            placeholder='Search or create exercise...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='bg-secondary border-border text-foreground'
            autoFocus
          />
        </div>

        <div
          className='overflox-y-auto px-6 pb-6'
          style={{ maxHeight: 'calc(80vh - 130px)' }}
        >
          {search && !exactMatch && (
            <CreateExerciseForm name={search} onCreated={handleCreated} />
          )}

          {loading ? (
            <p className='text-sm text-muted-foreground'>Loading...</p>
          ) : filtered.length === 0 && exactMatch ? null : filtered.length ===
            0 ? (
            <p className='text-sm text-muted-foreground'>No exercises found</p>
          ) : (
            filtered.map((exercise) => (
              <div
                key={exercise.id}
                className='flex justify-between items-center py-3 border-b border-border cursor-pointer hover:bg-secondary px-2 rounded-lg transition-colors'
                onClick={() => handleSelect(exercise)}
              >
                <div>
                  <p className='text-[0.9375rem] font-medium text-foreground'>
                    {exercise.name}
                  </p>
                  {exercise.exercise_library_muscles?.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {exercise.exercise_library_muscles.map((m, i) => (
                        <Badge
                          key={i}
                          className={`text-[0.6875rem] border-none ${tagColor(m.muscle_group)}`}
                        >
                          {m.muscle_group}
                          {m.region ? ` · ${m.region}` : ''}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <span className='text-xs text-primary ml-2'>Add &rarr;</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
