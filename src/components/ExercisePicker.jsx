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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

      <div className='flex gap-2 mb-3 items-center'>
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
              <SelectValue placeholder='Not specified' />
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
          size='icon'
          className='border-primary text-primary hover:bg-primary/10 shrink-0 text-lg pb-0.5'
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

  const handleDelete = async (e, exerciseId) => {
    e.stopPropagation()
    const { error } = await supabase
      .from('exercise_library')
      .delete()
      .eq('id', exerciseId)

    if (error) {
      console.error(error)
      return
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-card border-border max-w-[400px] max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>Add exercise</DialogTitle>
        </DialogHeader>

        <Input
          placeholder='Search or create exercise...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='bg-secondary border-border text-foreground'
          autoFocus
        />

        <div className='overflow-y-auto flex-1 -mx-1 px-1'>
          {search && !exactMatch && (
            <CreateExerciseForm name={search} onCreated={handleCreated} />
          )}

          {loading ? (
            <p className='text-sm text-muted-foreground py-2'>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className='text-sm text-muted-foreground py-2'>
              No exercises found
            </p>
          ) : (
            filtered.map((exercise) => (
              <div
                key={exercise.id}
                className='flex justify-between items-center py-3 border-b border-border cursor-pointer hover:bg-secondary px-2 rounded-lg transition-colors'
                onClick={() => handleSelect(exercise)}
              >
                <div className='flex-1 min-w-0 pr-2'>
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
                <div className='flex items-center gap-2 shrink-0'>
                  <button
                    className='text-primary text-[1rem] hover:text-destructive transition-colors cursor-pointer bg-transparent border-none px-2'
                    onClick={(e) => handleDelete(e, exercise.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
