import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Header from './Header'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

type SettingsProps = {
  isOpen: boolean
  onClose: () => void
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const t = localStorage.getItem('theme')
    return t === 'light' ? 'light' : 'dark'
  })

  const [units, setUnits] = useState<'kg' | 'lbs'>(() => {
    const u = localStorage.getItem('units')
    return u === 'lbs' ? 'lbs' : 'kg'
  })

  const [mode, setMode] = useState<'gain' | 'cut'>(() => {
    const m = localStorage.getItem('mode')
    return m === 'cut' ? 'cut' : 'gain'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('units', units)
  }, [units])

  useEffect(() => {
    localStorage.setItem('mode', mode)
    window.dispatchEvent(
      new CustomEvent<'gain' | 'cut'>('phaseModeChange', { detail: mode })
    )
  }, [mode])

  return (
    <div
      className={`fixed top-0 left-1/2 w-full max-w-107.5 h-screen bg-card z-50 flex flex-col transition-transform duration-300
                ${isOpen ? '-translate-x-1/2' : 'translate-x-[50%]'}`}
    >
      <Header title={'Settings'} onClose={onClose} />

      <div className='flex-1 overflow-y-auto px-6 py-5'>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Appearance
        </p>

        <div className='border border-border rounded-xl overflow-hidden mb-6'>
          <div className='flex justify-between items-center px-4 py-3 border-b border-border'>
            <span className='text-[0.9375rem] text-foreground'>Theme</span>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={theme === 'light' ? 'default' : 'outline'}
                className={`cursor-pointer ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                size='sm'
                variant={theme === 'dark' ? 'default' : 'outline'}
                className={`cursor-pointer ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
            </div>
          </div>
        </div>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Units
        </p>

        <div className='border border-border rounded-xl overflow-hidden mb-6'>
          <div className='flex justify-between items-center px-4 py-3'>
            <span className='text-[0.9375rem] text-foreground'>
              Weight unit
            </span>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={units === 'kg' ? 'default' : 'outline'}
                className={`cursor-pointer ${units === 'kg' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setUnits('kg')}
              >
                kg
              </Button>
              <Button
                size='sm'
                variant={units === 'lbs' ? 'default' : 'outline'}
                className={`cursor-pointer ${units === 'lbs' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setUnits('lbs')}
              >
                lbs
              </Button>
            </div>
          </div>
        </div>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Modes
        </p>

        <div className='border border-border rounded-xl overflow-hidden mb-6'>
          <div className='flex justify-between items-center px-4 py-3'>
            <span className='text-[0.9375rem] text-foreground'>
              Bodybuilding phase
            </span>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant={mode === 'gain' ? 'default' : 'outline'}
                className={`cursor-pointer ${mode === 'gain' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setMode('gain')}
              >
                Gain
              </Button>
              <Button
                size='sm'
                variant={mode === 'cut' ? 'default' : 'outline'}
                className={`cursor-pointer ${mode === 'cut' ? 'bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}
                onClick={() => setMode('cut')}
              >
                Cut
              </Button>
            </div>
          </div>
        </div>

        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3'>
          Account
        </p>

        <div className='border border-border rounded-xl overflow-hidden mb-6'>
          <div className='flex justify-between items-center px-4 py-3 border-b border-border'>
            <span className='text-[0.9375rem] text-foreground'>
              Signed in as
            </span>
            <span className='text-sm text-muted-foreground'>{user?.email}</span>
          </div>
          <div className='px-4 py-3'>
            <Button
              variant='outline'
              className='w-full border-destructive text-destructive hover:bg-destructive/10 cursor-pointer'
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
