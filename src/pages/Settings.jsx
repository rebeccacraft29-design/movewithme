import { useState, useRef } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import './Settings.css'

function ColorSwatch({ color, onChange }) {
  const inputRef = useRef(null)
  return (
    <button
      type="button"
      className="st-swatch"
      style={{ background: color }}
      onClick={() => inputRef.current?.click()}
      title="Change colour"
    >
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={e => onChange(e.target.value)}
        className="st-swatch-input"
      />
    </button>
  )
}

export default function Settings({ sessionTypes, setSessionTypes }) {
  const [editingId, setEditingId]   = useState(null)
  const [editLabel, setEditLabel]   = useState('')
  const [adding, setAdding]         = useState(false)
  const [newLabel, setNewLabel]     = useState('')
  const [newColor, setNewColor]     = useState('#FF6B5B')
  const newColorRef                 = useRef(null)

  function startEdit(st) {
    setEditingId(st.id)
    setEditLabel(st.label)
  }

  function commitEdit(id) {
    if (editLabel.trim()) {
      setSessionTypes(prev =>
        prev.map(st => st.id === id ? { ...st, label: editLabel.trim() } : st)
      )
    }
    setEditingId(null)
  }

  function updateColor(id, color) {
    setSessionTypes(prev =>
      prev.map(st => st.id === id ? { ...st, color } : st)
    )
  }

  function deleteType(id) {
    setSessionTypes(prev => prev.filter(st => st.id !== id))
  }

  function moveUp(index) {
    if (index === 0) return
    setSessionTypes(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index) {
    if (index === sessionTypes.length - 1) return
    setSessionTypes(prev => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  function addType() {
    if (!newLabel.trim()) return
    setSessionTypes(prev => [
      ...prev,
      { id: `st-${Date.now()}`, label: newLabel.trim(), color: newColor },
    ])
    setNewLabel('')
    setNewColor('#FF6B5B')
    setAdding(false)
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Session Types</h2>
            <p className="settings-section-desc">
              Customise the session types available when booking. Click a colour swatch to change it, click a name to edit it.
            </p>
          </div>
          <button className="settings-add-btn" onClick={() => { setAdding(true); setNewLabel(''); }}>
            <Plus size={14} /> Add type
          </button>
        </div>

        <div className="settings-st-list">
          {sessionTypes.map((st, i) => (
            <div key={st.id} className="settings-st-row">
              <div className="settings-st-reorder">
                <button
                  type="button"
                  className="settings-reorder-btn"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  title="Move up"
                >▲</button>
                <button
                  type="button"
                  className="settings-reorder-btn"
                  onClick={() => moveDown(i)}
                  disabled={i === sessionTypes.length - 1}
                  title="Move down"
                >▼</button>
              </div>

              <ColorSwatch color={st.color} onChange={color => updateColor(st.id, color)} />

              {editingId === st.id ? (
                <input
                  className="settings-st-input"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(st.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="settings-st-label"
                  onClick={() => startEdit(st)}
                  title="Click to edit"
                >
                  {st.label}
                </span>
              )}

              <div className="settings-st-actions">
                {editingId === st.id ? (
                  <>
                    <button type="button" className="settings-st-btn settings-st-btn--confirm" onClick={() => commitEdit(st.id)}>
                      <Check size={13} />
                    </button>
                    <button type="button" className="settings-st-btn" onClick={() => setEditingId(null)}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="settings-st-btn settings-st-btn--delete"
                    onClick={() => deleteType(st.id)}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {adding && (
            <div className="settings-st-row settings-st-row--new">
              <div className="settings-st-reorder" />

              <button
                type="button"
                className="st-swatch"
                style={{ background: newColor }}
                onClick={() => newColorRef.current?.click()}
                title="Choose colour"
              >
                <input
                  ref={newColorRef}
                  type="color"
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  className="st-swatch-input"
                />
              </button>

              <input
                className="settings-st-input"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addType()
                  if (e.key === 'Escape') setAdding(false)
                }}
                placeholder="Session type name…"
                autoFocus
              />

              <div className="settings-st-actions">
                <button type="button" className="settings-st-btn settings-st-btn--confirm" onClick={addType}>
                  <Check size={13} />
                </button>
                <button type="button" className="settings-st-btn" onClick={() => setAdding(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
