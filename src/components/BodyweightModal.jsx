import { useState } from 'react'

export default function BodyweightModal({ current, onSave, onClose }) {
  const [value, setValue] = useState(current ?? '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Update bodyweight</div>
        <input
          className="modal-input"
          type="number"
          step="0.1"
          placeholder="e.g. 83.5"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Current: {current ? `${current} kg` : 'Not set'}
        </div>
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="modal-confirm"
            onClick={() => {
              if (value) onSave(parseFloat(value))
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}