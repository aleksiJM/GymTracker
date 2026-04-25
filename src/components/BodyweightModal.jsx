import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function BodyweightModal({ current, onSave, onClose }) {
  const [value, setValue] = useState(current ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value) return
    setSaving(true)

    const { error } = await supabase
      .from('bodyweight')
      .insert({ weight: parseFloat(value) })

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    onSave(parseFloat(value))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-w-[400px] bg-card border-border'>
        <DialogHeader>
          <DialogTitle className='text-foreground'>
            Update bodyweight
          </DialogTitle>
        </DialogHeader>

        <div className='py-2'>
          <Input
            type='number'
            step='0.1'
            placeholder='e.g. 80.0'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className='bg-secondary border-border text-foreground mb-2 w-[50%]'
            autofocus
          />
          <p className='text-xs text-muted-foreground'>
            Current: {current ? `${current} kg` : `Not set`}
          </p>
        </div>

        <DialogFooter className='grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            className='border-border text-muted-foreground'
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className='bg-primary text-primary-foreground'
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
