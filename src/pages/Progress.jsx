import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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

export default function Progress() {
  const [bodyweightData, setBodyweightData] = useState([])
  const [overloadData, setOverloadData] = useState([])
  const [exercises, setExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseData, setExerciseData] = useState([])
  const [loading, setLoading] = useState(true)

  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--border')
    .trim()
  const axisColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--muted-foreground')
    .trim()

  useEffect(() => {
    const fetchData = async () => {
      const { data: bwData } = await supabase
        .from('bodyweight')
        .select('weight, created_at')
        .order('created_at', { ascending: true })

      if (bwData) {
        const grouped = {}
        bwData.forEach((entry) => {
          const date = new Date(entry.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })
          if (!grouped[date]) grouped[date] = []
          grouped[date].push(entry.weight)
        })
        setBodyweightData(
          Object.entries(grouped).map(([date, weights]) => ({
            date,
            weight: parseFloat(
              (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
            ),
          }))
        )
      }

      const { data: workoutData } = await supabase
        .from('workouts')
        .select(
          `
          date, created_at, exercises ( name, sets ( weight, reps ) )`
        )
        .order('date', { ascending: true })

      if (workoutData && workoutData.length > 1) {
        // Build a map of (exercise name) -> (first ever volume)
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

        console.log('firstVolumeMap:', firstVolumeMap)
        console.log('workoutData:', workoutData)

        const overload = workoutData
          .map((workout) => {
            if (!workout.exercises || workout.exercises.length === 0)
              return null

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

            const avgOverload = parseFloat(
              (
                exerciseOverloads.reduce((a, b) => a + b, 0) /
                exerciseOverloads.length
              ).toFixed(1)
            )

            return { date, overload: avgOverload }
          })
          .filter(Boolean)

        setOverloadData(overload)
      }

      const { data: exData } = await supabase
        .from('exercises')
        .select(`name, workout:workouts ( date )`)

      if (exData) {
        const exerciseMap = {}
        exData.forEach((ex) => {
          if (!ex.workout?.date) return
          if (!exerciseMap[ex.name]) exerciseMap[ex.name] = new Set()
          exerciseMap[ex.name].add(ex.workout.date)
        })

        const qualifiedExercises = Object.entries(exerciseMap)
          .filter(([_, dates]) => dates.size >= 2)
          .map(([name]) => ({ name }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setExercises(qualifiedExercises)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedExercise) return

    const fetchExerciseProgress = async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select(
          `
          workout:workouts ( date ),
          sets ( weight, reps )
        `
        )
        .eq('name', selectedExercise)

      if (data) {
        const points = data
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

        setExerciseData(points)
      }
    }

    fetchExerciseProgress()
  }, [selectedExercise])

  if (loading) return

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
