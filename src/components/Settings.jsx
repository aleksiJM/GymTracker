import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Settings({ isOpen, onClose }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  const [units, setUnits] = useState(() => {
    return localStorage.getItem('units') || 'kg'
  })

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('mode') || 'gain'
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

  return (
    <div
      className={`fixed top-0 left-1/2 w-full max-w-[430px] h-screen bg-card z-50 flex flex-col transition-transform duration-300
                ${isOpen ? '-translate-x-1/2' : 'translate-x-[calc(-50%+100%)]'}`}
    >
      <div className='flex items-center justify-between px-6 py-5 border-b border-border shrink-0'>
        <h1 className='text-[1.375rem] font-medium text-foreground'>
          Settings
        </h1>
        <Button
          className='text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none'
          onClick={onClose}
        >
          <X size={20} />
        </Button>
      </div>

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
      </div>
    </div>
  )
}
