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
          date, exercises ( sets ( weight, reps ) )`
        )
        .order('date', { ascending: true })

      if (workoutData && workoutData.length > 1) {
        const overload = workoutData
          .map((workout, i) => {
            if (i === 0) return null
            const prevWorkout = workoutData[i - 1]

            const totalVolume = (w) =>
              w.exercises.reduce(
                (sum, ex) =>
                  sum +
                  ex.sets.reduce(
                    (s, set) => s + (set.weight || 0) * (set.reps || 0),
                    0
                  ),
                0
              )

            const curr = totalVolume(workout)
            const prev = totalVolume(prevWorkout)
            if (prev === 0) return null

            const change = parseFloat((((curr - prev) / prev) * 100).toFixed(1))
            const date = new Date(workout.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })
            return { date, overload: change }
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
      const { data } = await supabase
        .from('exercises')
        .select(
          `
          workout:workouts ( date ),
          sets ( weight, reps )
        `
        )
        .eq(
          'name',
          exercises.find((e) => e.id === selectedExercise)?.name ?? ''
        )
        .order('workout(date)', { ascending: true })

      if (data) {
        const points = data
          .map((entry) => {
            const bestWeight = Math.max(...entry.sets.map((s) => s.weight || 0))
            const date = new Date(entry.workout.date).toLocaleDateString(
              'en-GB',
              {
                day: 'numeric',
                month: 'short',
              }
            )
            return { date, weight: bestWeight }
          })
          .filter((p) => p.weight > 0)

        setExerciseData(points)
      }
    }

    fetchExerciseProgress()
  }, [selectedExercise])

  if (loading) return

  return (
    <div className='px-6 pt-11 mb-8'>
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
                  key={ex.id}
                  value={ex.id}
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
            />
          )}
        </>
      )}
    </div>
  )
}
