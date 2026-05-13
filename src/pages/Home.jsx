import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBodyweight, fetchWorkouts } from '@/lib/queries'
import WorkoutCard from '../components/WorkoutCard'
import WorkoutDetail from '../components/WorkoutDetail'
import { Card, CardContent } from '@/components/ui/card'
import { Menu } from 'lucide-react'
import Settings from '@/components/Settings'
import { Button } from '@base-ui/react'

export default function Home() {
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [bodyweightView, setBodyweightView] = useState('week')
  const [showSettings, setShowSettings] = useState(false)
  const [phaseMode, setPhaseMode] = useState(
    () => localStorage.getItem('mode') || 'gain'
  )

  useEffect(() => {
    const onPhaseMode = (e) => setPhaseMode(e.detail)
    window.addEventListener('phaseModeChange', onPhaseMode)
    return () => window.removeEventListener('phaseModeChange', onPhaseMode)
  }, [])

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: fetchWorkouts,
  })

  const { data: bodyweightData = [] } = useQuery({
    queryKey: ['bodyweight'],
    queryFn: fetchBodyweight,
  })

  const bodyweightChange = (() => {
    if (bodyweightData.length === 0) return null
    const now = new Date()
    const oneWeekAgo = new Date()
    const oneMonthAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)
    oneMonthAgo.setDate(now.getDate() - 30)

    const avg = (arr) => arr.reduce((sum, b) => sum + b.weight, 0) / arr.length
    const allTimeChange = parseFloat(
      (
        bodyweightData[bodyweightData.length - 1].weight -
        bodyweightData[0].weight
      ).toFixed(1)
    )

    const lastWeekData = bodyweightData.filter(
      (b) => new Date(b.created_at) >= oneWeekAgo
    )
    const beforeLastWeek = bodyweightData.filter(
      (b) => new Date(b.created_at) < oneWeekAgo
    )
    const weekChange =
      lastWeekData.length > 0 && beforeLastWeek.length > 0
        ? parseFloat((avg(lastWeekData) - avg(beforeLastWeek)).toFixed(1))
        : allTimeChange

    const lastMonthData = bodyweightData.filter(
      (b) => new Date(b.created_at) >= oneMonthAgo
    )
    const beforeLastMonth = bodyweightData.filter(
      (b) => new Date(b.created_at) < oneMonthAgo
    )
    const monthChange =
      lastMonthData.length > 0 && beforeLastMonth.length > 0
        ? parseFloat((avg(lastMonthData) - avg(beforeLastMonth)).toFixed(1))
        : allTimeChange

    return { week: weekChange, month: monthChange, allTime: allTimeChange }
  })()

  const bwDelta = bodyweightChange?.[bodyweightView]
  const bodyweightDeltaClass = (() => {
    if (bwDelta === undefined || bwDelta === null) return ''
    if (bwDelta === 0) return 'text-muted-foreground'
    const good = phaseMode === 'gain' ? bwDelta > 0 : bwDelta < 0
    return good ? 'text-positive' : 'text-destructive'
  })()

  const queryClient = useQueryClient()

  const handleDelete = async () => {
    queryClient.invalidateQueries({ queryKey: ['workouts'] })
    setSelectedWorkout(null)
  }

  return (
    <>
      <div className='px-6 pt-6 mb-8'>
        <div className='flex justify-between items-center mb-1'>
          <h1 className='text-[1.375rem] font-medium text-foreground uppercase tracking-wide'>
            Home
          </h1>
          <Button
            className='text-muted-foreground hover:text-foreground cursor-pointer mt-1'
            onClick={() => setShowSettings(true)}
          >
            <Menu size={25}></Menu>
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
                    className={`text-[1.375rem] font-medium ${bodyweightDeltaClass}`}
                  >
                    {bodyweightChange[bodyweightView] > 0 ? '+ ' : '- '}
                    {Math.abs(bodyweightChange[bodyweightView]).toFixed(1)} kg
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
                  <div className='text-[1.375rem] font-medium text-muted-foreground'>
                    No data
                  </div>
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

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
