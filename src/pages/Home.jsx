import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WorkoutCard from '../components/WorkoutCard'
import WorkoutDetail from '../components/WorkoutDetail'
import { Card, CardContent } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'
import Settings from '@/components/Settings'
import { Button } from '@base-ui/react'

export default function Home() {
  const [workouts, setWorkouts] = useState([])
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bodyweightChange, setBodyweightChange] = useState(null)
  const [bodyweightView, setBodyweightView] = useState('week')
  const [showSettings, setShowSettigs] = useState(false)

  const handleDelete = (deletedId) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== deletedId))
  }

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(
          `
          *,
          exercises (
            *,
            sets (*),
            exercise_muscles (*)
          )
        `
        )
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setWorkouts(data)
      setLoading(false)
    }

    const fetchBodyweight = async () => {
      const { data, error } = await supabase
        .from('bodyweight')
        .select('weight, created_at')
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        const now = new Date()
        const oneWeekAgo = new Date()
        const oneMonthAgo = new Date()
        oneWeekAgo.setDate(now.getDate() - 7)
        oneMonthAgo.setDate(now.getDate() - 30)

        const avg = (arr) =>
          arr.reduce((sum, b) => sum + b.weight, 0) / arr.length

        const allTimeChange = parseFloat(
          (data[data.length - 1].weight - data[0].weight).toFixed(1)
        )

        const lastWeekData = data.filter(
          (b) => new Date(b.created_at) >= oneWeekAgo
        )
        const beforeLastWeek = data.filter(
          (b) => new Date(b.created_at) < oneWeekAgo
        )
        const weekChange =
          lastWeekData.length > 0 && beforeLastWeek.length > 0
            ? parseFloat((avg(lastWeekData) - avg(beforeLastWeek)).toFixed(1))
            : allTimeChange

        const lastMonthData = data.filter(
          (b) => new Date(b.created_at) >= oneMonthAgo
        )
        const beforeLastMonth = data.filter(
          (b) => new Date(b.created_at) < oneMonthAgo
        )
        const monthChange =
          lastMonthData.length > 0 && beforeLastMonth.length > 0
            ? parseFloat((avg(lastMonthData) - avg(beforeLastMonth)).toFixed(1))
            : allTimeChange

        setBodyweightChange({
          month: monthChange,
          week: weekChange,
          allTime: allTimeChange,
        })
      } else {
        setBodyweightChange({ month: 0, week: 0, allTime: 0 })
      }
    }

    fetchWorkouts()
    fetchBodyweight()
  }, [])

  if (loading) return

  return (
    <>
      <div className='px-6 pt-6 mt-5 mb-8'>
        <div className='flex justify-between items-center mb-1'>
          <h1 className='text-[1.375rem] font-medium text-foreground uppercase tracking-wide'>
            Home
          </h1>
          <Button
            className='text-muted-foreground hover:text-foreground cursor-pointer'
            onClick={() => setShowSettigs(true)}
          >
            <SettingsIcon size={25} />
          </Button>
        </div>
        <p className='text-sm text-muted-foreground'>Week 18 · April 2026</p>
      </div>

      <div className='px-6'>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
          Statistics
        </p>
        <div className='grid grid-cols-2 gap-3 mb-5'>
          <Card className='bg-secondary border-border'>
            <CardContent className='p-2'>
              <div className='text-[1.375rem] font-medium text-primary'>
                + 4.2 %
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                Avg progressive overload
              </div>
            </CardContent>
          </Card>

          <Card
            className='bg-secondary border-border cursor-pointer hover:opactiy-80 active:scale-95 transition-all duration-100 select-none'
            onClick={() =>
              setBodyweightView((v) => {
                if (v === 'week') return 'month'
                if (v === 'month') return 'allTime'
                return 'week'
              })
            }
          >
            <CardContent className='p-2'>
              {bodyweightChange !== null ? (
                <>
                  <div
                    className={`text-[1.375rem] font-medium ${bodyweightChange[bodyweightView] <= 0 ? 'text-primary' : 'text-destructive'}`}
                  >
                    {bodyweightChange[bodyweightView] > 0 ? '+ ' : '- '}
                    {Math.abs(bodyweightChange[bodyweightView]).toFixed(1)} kg
                    <keygen />
                  </div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    Bodyweight ·{' '}
                    {bodyweightView === 'week'
                      ? 'last 7 days'
                      : bodyweightView === 'month'
                        ? 'last 30 days'
                        : 'all time'}
                  </div>
                </>
              ) : (
                <>
                  <div className='text-base text-muted-foreground'>No data</div>
                  <div className='text-xs text-muted-foreground mt-1'>
                    Bodyweight change
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2'>
          Sessions
        </p>
        {workouts.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No workouts yet</p>
        ) : (
          workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={() => setSelectedWorkout(workout)}
            />
          ))
        )}
      </div>

      <WorkoutDetail
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onDelete={handleDelete}
      />

      <Settings isOpen={showSettings} onClose={() => setShowSettigs(false)} />
    </>
  )
}
