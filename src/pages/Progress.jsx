import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchBodyweight,
  fetchWorkoutsForProgress,
  fetchExercisesForProgress,
  fetchExerciseProgress,
} from '@/lib/queries'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-card border border-border rounded-lg px-3 py-2'>
        <p className='text-xs text-muted-foreground mb-1'>{label}</p>
        <p className='text-sm font-medium text-primary'>
          {payload[0].value} {unit}
        </p>
      </div>
    )
  }
  return null
}

function ChartCard({
  title,
  data,
  dataKey,
  unit,
  color = '#16a34a',
  gridColor,
  axisColor,
  yDomainMin = 'auto',
}) {
  if (!data || data.length === 0) {
    return (
      <div className='border border-border rounded-xl p-4 mb-4'>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          {title}
        </p>
        <p className='text-sm text-muted-foreground'>Not enough data yet</p>
      </div>
    )
  }

  return (
    <div className='border border-border rounded-xl p-4 mb-4'>
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4'>
        {title}
      </p>
      <ResponsiveContainer width='100%' height={180}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke={`${gridColor}`} />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 10, fill: `${axisColor}` }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: `${axisColor}` }}
            tickLine={false}
            axisLine={false}
            domain={[yDomainMin, 'auto']}
            tickCount={12}
            scale='linear'
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Line
            type='monotone'
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function processBodyweightData(data) {
  if (!data) return []
  const grouped = {}
  data.forEach((entry) => {
    const date = new Date(entry.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(entry.weight)
  })
  return Object.entries(grouped).map(([date, weights]) => ({
    date,
    weight: parseFloat(
      (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
    ),
  }))
}

function processOverloadData(workoutData) {
  if (!workoutData || workoutData.length < 2) return []

  const firstVolumeMap = {}
  workoutData.forEach((workout) => {
    if (!workout.exercises) return
    workout.exercises.forEach((ex) => {
      if (!ex.sets) return
      const volume = ex.sets.reduce(
        (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
        0
      )
      if (volume > 0 && !firstVolumeMap[ex.name]) {
        firstVolumeMap[ex.name] = volume
      }
    })
  })

  return workoutData
    .map((workout) => {
      if (!workout.exercises || workout.exercises.lenght === 0) return null
      const rawDate = workout.date || workout.created_at
      if (!rawDate) return null
      const parsedDate = new Date(rawDate)
      if (isNaN(parsedDate.getTime())) return null

      const date = parsedDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })

      const exerciseOverloads = workout.exercises
        .map((ex) => {
          if (!ex.sets) return null
          const firstVolume = firstVolumeMap[ex.name]
          if (!firstVolume) return null
          const currentVolume = ex.sets.reduce(
            (sum, set) => sum + (set.weight || 0) * (set.reps || 0),
            0
          )
          if (currentVolume === 0) return null
          if (currentVolume === firstVolume) return 0
          return ((currentVolume - firstVolume) / firstVolume) * 100
        })
        .filter((v) => v !== null)

      if (exerciseOverloads.length === 0) return null

      return {
        date,
        overload: parseFloat(
          (
            exerciseOverloads.reduce((a, b) => a + b, 0) /
            exerciseOverloads.length
          ).toFixed(1)
        ),
      }
    })
    .filter(Boolean)
}

function processQualifiedExercises(data) {
  if (!data) return []
  const exerciseMap = {}
  data.forEach((ex) => {
    if (!ex.workout?.date) return
    if (!exerciseMap[ex.name]) exerciseMap[ex.name] = new Set()
    exerciseMap[ex.name].add(ex.workout.date)
  })
  return Object.entries(exerciseMap)
    .filter(([_, dates]) => dates.size >= 2)
    .map(([name]) => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function processExerciseData(data) {
  if (!data) return []
  return data
    .filter((entry) => entry.workout?.date)
    .map((entry) => ({
      date: new Date(entry.workout.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
      weight: Math.max(...entry.sets.map((s) => s.weight || 0)),
    }))
    .filter((p) => p.weight > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState('')

  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--border')
    .trim()
  const axisColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--muted-foreground')
    .trim()

  const { data: rawBodyweight = [], isLoading: bwLoading } = useQuery({
    queryKey: ['bodyweight'],
    queryFn: fetchBodyweight,
  })

  const { data: workoutData = [], isLoading: workoutLoading } = useQuery({
    queryKey: ['workoutsForProgress'],
    queryFn: fetchWorkoutsForProgress,
  })

  const { data: exercisesRaw = [], isLoading: exLoading } = useQuery({
    queryKey: ['exercisesForProgress'],
    queryFn: fetchExercisesForProgress,
  })

  const { data: exerciseProgressRaw = [] } = useQuery({
    queryKey: ['exerciseProgress', selectedExercise],
    queryFn: () => fetchExerciseProgress(selectedExercise),
    enabled: !!selectedExercise,
  })

  const bodyweightData = processBodyweightData(rawBodyweight)
  const overloadData = processOverloadData(workoutData)
  const exercises = processQualifiedExercises(exercisesRaw)
  const exerciseData = processExerciseData(exerciseProgressRaw)

  return (
    <div className='px-6 pt-6 mb-8'>
      <h1 className='text-[1.375rem] font-medium text-foreground uppercase tracking-wide mb-1'>
        Progress
      </h1>
      <p className='text-sm text-muted-foreground mb-8'>
        Monitor training progress and bodyweight
      </p>

      <ChartCard
        title='Progressive overload'
        data={overloadData}
        dataKey='overload'
        unit='%'
        color='#3b82f6'
        gridColor={gridColor}
        axisColor={axisColor}
      />

      <ChartCard
        title='Bodyweight'
        data={bodyweightData}
        dataKey='weight'
        unit='kg'
        gridColor={gridColor}
        axisColor={axisColor}
      />

      {exercises.length === 0 ? (
        <div className='border border-border rounded-xl p-4 mb-4'>
          <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
            Exercise progress
          </p>
          <p className='text-sm text-muted-foreground'>Not enough data yet</p>
        </div>
      ) : (
        <>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className='bg-secondary border-border text-foreground mb-4'>
              <SelectValue placeholder='Select an exercise' />
            </SelectTrigger>
            <SelectContent className='bg-card border-border'>
              {exercises.map((ex) => (
                <SelectItem
                  key={ex.name}
                  value={ex.name}
                  className='text-foreground'
                >
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedExercise && (
            <ChartCard
              title={
                exercises.find((e) => e.id === selectedExercise)?.name ?? ''
              }
              data={exerciseData}
              dataKey='weight'
              unit='kg'
              color='#f59e0b'
              gridColor={gridColor}
              axisColor={axisColor}
              yDomainMin={
                exerciseData.length > 0 ? exerciseData[0].weight : 'auto'
              }
            />
          )}
        </>
      )}
    </div>
  )
}
