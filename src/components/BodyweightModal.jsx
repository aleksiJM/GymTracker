import { useState } from 'react'
import { supabase } from '../lib/supabase'

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
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-box' onClick={(e) => e.stopPropagation()}>
        <div className='modal-title'>Update bodyweight</div>
        <input
          className='modal-input'
          type='number'
          step='0.1'
          placeholder='e.g. 83.5'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem',
          }}
        >
          Current: {current ? `${current} kg` : 'Not set'}
        </div>
        <div className='modal-actions'>
          <button className='modal-cancel' onClick={onClose}>
            Cancel
          </button>
          <button
            className='modal-confirm'
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
