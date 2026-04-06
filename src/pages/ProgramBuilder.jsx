import { useState, useRef } from 'react'
import {
  ArrowLeft, Eye, EyeOff, Save, Send, LayoutTemplate, Plus,
  Trash2, GripVertical, ChevronLeft, ChevronRight, X, Copy,
  Target, Flame, Clock, StickyNote, AlertTriangle, PanelRightClose, PanelRightOpen,
} from 'lucide-react'
import { getServiceConfig } from '../data/mockData'
import { getClientExtras } from '../data/clientExtras'
import { uid, getExerciseName } from '../data/programsData'
import SearchDropdown from '../components/SearchDropdown'
import './ProgramBuilder.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function reorder(arr, from, to) {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

function getMondayOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d
}

function getStreak(client) {
  const completed = [...client.trainerSessions, ...client.independentSessions]
    .filter(s => s.completed)
    .map(s => { const d = new Date(s.date); d.setHours(0,0,0,0); return d })
  if (!completed.length) return 0
  const thisWeekMon = getMondayOfWeek(new Date())
  const thisWeekSun = new Date(thisWeekMon); thisWeekSun.setDate(thisWeekMon.getDate() + 6); thisWeekSun.setHours(23,59,59,999)
  const hasThis = completed.some(d => d >= thisWeekMon && d <= thisWeekSun)
  let mon = new Date(thisWeekMon)
  if (!hasThis) mon.setDate(mon.getDate() - 7)
  let streak = 0
  for (let i = 0; i < 52; i++) {
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999)
    if (!completed.some(d => d >= mon && d <= sun)) break
    streak++
    mon.setDate(mon.getDate() - 7)
  }
  return streak
}

function getCompletionRate(client) {
  const all = [...client.trainerSessions, ...client.independentSessions]
  if (!all.length) return null
  return Math.round((all.filter(s => s.completed).length / all.length) * 100)
}

function getLastSession(client) {
  const dates = [...client.trainerSessions, ...client.independentSessions]
    .filter(s => s.completed && s.date)
    .map(s => s.date)
    .sort()
  if (!dates.length) return null
  return dates[dates.length - 1]
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

// ── Right panel ───────────────────────────────────────────────────────────────

function RightPanel({ client }) {
  if (!client) {
    return (
      <div className="builder-panel">
        <p className="panel-empty">Select a client to see their stats and notes here.</p>
      </div>
    )
  }

  const extras     = getClientExtras(client.id)
  const streak     = getStreak(client)
  const completion = getCompletionRate(client)
  const lastSess   = getLastSession(client)
  const relevantNotes = extras.notes.slice(0, 3)

  return (
    <div className="builder-panel">
      {/* Quick stats */}
      <div className="panel-section">
        <div className="panel-section-title">Client stats</div>
        <div className="panel-stats">
          <div className="panel-stat">
            <Flame size={14} className="panel-stat-icon" style={{ color: 'var(--coral)' }} />
            <div>
              <div className="panel-stat-value">{streak}w</div>
              <div className="panel-stat-label">Streak</div>
            </div>
          </div>
          <div className="panel-stat">
            <Target size={14} className="panel-stat-icon" style={{ color: 'var(--teal)' }} />
            <div>
              <div className="panel-stat-value">{completion !== null ? completion + '%' : '—'}</div>
              <div className="panel-stat-label">Completion</div>
            </div>
          </div>
          <div className="panel-stat">
            <Clock size={14} className="panel-stat-icon" style={{ color: 'var(--amber)' }} />
            <div>
              <div className="panel-stat-value">{lastSess ? formatDate(lastSess) : '—'}</div>
              <div className="panel-stat-label">Last session</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      {client.goals?.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Goals</div>
          <div className="panel-goals">
            {client.goals.map(g => {
              const pct = g.lowerIsBetter
                ? Math.min(100, Math.round(((g.targetValue - g.currentValue) / (g.targetValue - (g.progressHistory[0]?.value ?? g.currentValue))) * 100) || 0)
                : Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
              return (
                <div key={g.id} className="panel-goal">
                  <div className="panel-goal-desc">{g.description}</div>
                  <div className="panel-goal-bar">
                    <div className="panel-goal-fill" style={{ width: pct + '%' }} />
                  </div>
                  <div className="panel-goal-meta">
                    {g.currentValue}{g.unit} → {g.targetValue}{g.unit}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {relevantNotes.length > 0 && (
        <div className="panel-section">
          <div className="panel-section-title">Trainer notes</div>
          <div className="panel-notes">
            {relevantNotes.map(n => (
              <div key={n.id} className={`panel-note panel-note--${n.type}`}>
                <StickyNote size={12} />
                <span>{n.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Exercise block ────────────────────────────────────────────────────────────

function ExerciseBlock({
  block, weekId, dayId, index,
  exerciseLibrary, onUpdate, onDelete,
  dragExercise, setDragExercise, dragOverExercise, setDragOverExercise,
  onReorder,
}) {
  const isDragging = dragExercise?.weekId === weekId && dragExercise?.dayId === dayId && dragExercise?.index === index
  const isOver = dragOverExercise?.weekId === weekId && dragOverExercise?.dayId === dayId && dragOverExercise?.index === index

  return (
    <div
      className={`exercise-block ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={() => setDragExercise({ weekId, dayId, index })}
      onDragEnd={() => { setDragExercise(null); setDragOverExercise(null) }}
      onDragOver={e => { e.preventDefault(); setDragOverExercise({ weekId, dayId, index }) }}
      onDrop={e => { e.preventDefault(); onReorder(weekId, dayId, dragExercise?.index, index) }}
    >
      <div className="ex-block-grip">
        <GripVertical size={14} />
      </div>

      <div className="ex-block-body">
        <div className="ex-block-name">
          <SearchDropdown
            items={exerciseLibrary}
            selectedId={block.exerciseId}
            onSelect={id => onUpdate(weekId, dayId, block.id, { exerciseId: id })}
            placeholder="Select exercise…"
            searchPlaceholder="Search exercises…"
          />
        </div>
        <div className="ex-block-inputs">
          <div className="ex-input-group">
            <label className="ex-input-label">Sets</label>
            <input
              className="ex-input"
              type="text"
              value={block.sets}
              onChange={e => onUpdate(weekId, dayId, block.id, { sets: e.target.value })}
              placeholder="3"
            />
          </div>
          <div className="ex-input-group">
            <label className="ex-input-label">Reps</label>
            <input
              className="ex-input"
              type="text"
              value={block.reps}
              onChange={e => onUpdate(weekId, dayId, block.id, { reps: e.target.value })}
              placeholder="10"
            />
          </div>
          <div className="ex-input-group">
            <label className="ex-input-label">Weight</label>
            <input
              className="ex-input"
              type="text"
              value={block.weight}
              onChange={e => onUpdate(weekId, dayId, block.id, { weight: e.target.value })}
              placeholder="kg / BW"
            />
          </div>
        </div>
        <input
          className="ex-notes-input"
          type="text"
          value={block.notes}
          onChange={e => onUpdate(weekId, dayId, block.id, { notes: e.target.value })}
          placeholder="Notes (optional)…"
        />
      </div>

      <button className="ex-block-delete" onClick={() => onDelete(weekId, dayId, block.id)} title="Remove exercise">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── Day column ────────────────────────────────────────────────────────────────

function DayColumn({
  day, weekId, dayIndex,
  exerciseLibrary, onUpdateDay, onDeleteDay,
  onUpdateExercise, onDeleteExercise, onAddExercise, onReorderExercise,
  dragExercise, setDragExercise, dragOverExercise, setDragOverExercise,
  dragDay, setDragDay, dragOverDay, setDragOverDay,
  onReorderDay,
}) {
  const isDayDragging = dragDay?.weekId === weekId && dragDay?.index === dayIndex
  const isDayOver = dragOverDay?.weekId === weekId && dragOverDay?.index === dayIndex

  return (
    <div
      className={`day-column ${isDayDragging ? 'dragging' : ''} ${isDayOver ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOverDay({ weekId, index: dayIndex }) }}
      onDrop={e => { e.preventDefault(); onReorderDay(weekId, dragDay?.index, dayIndex) }}
    >
      <div className="day-column-header">
        <div
          className="day-drag-handle"
          draggable
          onDragStart={() => setDragDay({ weekId, index: dayIndex })}
          onDragEnd={() => { setDragDay(null); setDragOverDay(null) }}
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </div>
        <input
          className="day-label-input"
          value={day.label}
          onChange={e => onUpdateDay(weekId, day.id, { label: e.target.value })}
          title="Edit day label"
        />
        <button className="day-delete-btn" onClick={() => onDeleteDay(weekId, day.id)} title="Remove day">
          <X size={13} />
        </button>
      </div>

      <div className="day-exercises">
        {day.exercises.map((block, blockIdx) => (
          <ExerciseBlock
            key={block.id}
            block={block}
            weekId={weekId}
            dayId={day.id}
            index={blockIdx}
            exerciseLibrary={exerciseLibrary}
            onUpdate={onUpdateExercise}
            onDelete={onDeleteExercise}
            dragExercise={dragExercise}
            setDragExercise={setDragExercise}
            dragOverExercise={dragOverExercise}
            setDragOverExercise={setDragOverExercise}
            onReorder={onReorderExercise}
          />
        ))}

        <button
          className="add-exercise-btn"
          onClick={() => onAddExercise(weekId, day.id)}
        >
          <Plus size={14} /> Add exercise
        </button>
      </div>

      <div className="day-session-notes">
        <textarea
          className="session-notes-input"
          value={day.sessionNotes}
          onChange={e => onUpdateDay(weekId, day.id, { sessionNotes: e.target.value })}
          placeholder="Session notes for this day…"
          rows={2}
        />
      </div>
    </div>
  )
}

// ── Save as template modal ────────────────────────────────────────────────────

function SaveAsTemplateModal({ programName, onSave, onClose }) {
  const [name, setName]       = useState(programName)
  const [desc, setDesc]       = useState('')

  return (
    <div className="modal-overlay-builder" onClick={onClose}>
      <div className="satm-panel" onClick={e => e.stopPropagation()}>
        <div className="satm-header">
          <h3>Save as template</h3>
          <button className="modal-close-sm" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="satm-body">
          <div className="satm-field">
            <label className="satm-label">Template name</label>
            <input
              className="satm-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 12-Week Strength Foundation"
            />
          </div>
          <div className="satm-field">
            <label className="satm-label">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              className="satm-input satm-textarea"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Briefly describe this template…"
              rows={3}
            />
          </div>
        </div>
        <div className="satm-footer">
          <button className="satm-cancel" onClick={onClose}>Cancel</button>
          <button
            className="satm-save"
            disabled={!name.trim()}
            onClick={() => name.trim() && onSave(name.trim(), desc.trim())}
          >
            <LayoutTemplate size={15} /> Save template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ProgramBuilder ───────────────────────────────────────────────────────

export default function ProgramBuilder({ program: initialProgram, programs, clients, exerciseLibrary, onSave, onBack }) {
  const [program, setProgram]         = useState(() => JSON.parse(JSON.stringify(initialProgram)))
  const [activeWeek, setActiveWeek]   = useState(0)
  const [panelOpen, setPanelOpen]     = useState(true)
  const [tmplModal, setTmplModal]     = useState(false)

  // drag state
  const [dragExercise, setDragExercise]           = useState(null)
  const [dragOverExercise, setDragOverExercise]   = useState(null)
  const [dragDay, setDragDay]                     = useState(null)
  const [dragOverDay, setDragOverDay]             = useState(null)

  const activeClient = clients.find(c => c.id === program.clientId) ?? null
  const cfg = getServiceConfig(program.serviceType)
  const currentWeek = program.weeks[activeWeek] ?? program.weeks[0]

  // ── Program-level mutations ────────────────────────────────────────────────

  function updateProg(changes) {
    setProgram(p => ({ ...p, ...changes }))
  }

  function updateDay(weekId, dayId, changes) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.map(d => d.id !== dayId ? d : { ...d, ...changes }),
      }),
    }))
  }

  function updateExercise(weekId, dayId, blockId, changes) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.map(d => d.id !== dayId ? d : {
          ...d,
          exercises: d.exercises.map(e => e.id !== blockId ? e : { ...e, ...changes }),
        }),
      }),
    }))
  }

  function deleteExercise(weekId, dayId, blockId) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.map(d => d.id !== dayId ? d : {
          ...d,
          exercises: d.exercises.filter(e => e.id !== blockId),
        }),
      }),
    }))
  }

  function addExercise(weekId, dayId) {
    const newBlock = { id: uid(), exerciseId: null, sets: 3, reps: '10', weight: '', notes: '' }
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.map(d => d.id !== dayId ? d : {
          ...d,
          exercises: [...d.exercises, newBlock],
        }),
      }),
    }))
  }

  function reorderExercise(weekId, dayId, fromIdx, toIdx) {
    if (fromIdx == null || toIdx == null || fromIdx === toIdx) return
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.map(d => d.id !== dayId ? d : {
          ...d,
          exercises: reorder(d.exercises, fromIdx, toIdx),
        }),
      }),
    }))
  }

  function deleteDay(weekId, dayId) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: w.days.filter(d => d.id !== dayId),
      }),
    }))
  }

  function addDay(weekId) {
    const newDay = { id: uid(), label: 'New Day', exercises: [], sessionNotes: '' }
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: [...w.days, newDay],
      }),
    }))
  }

  function reorderDay(weekId, fromIdx, toIdx) {
    if (fromIdx == null || toIdx == null || fromIdx === toIdx) return
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w,
        days: reorder(w.days, fromIdx, toIdx),
      }),
    }))
  }

  function addWeek() {
    const nextNum = program.weeks.length + 1
    const newWeek = { id: uid(), weekNumber: nextNum, days: [] }
    setProgram(p => ({ ...p, weeks: [...p.weeks, newWeek] }))
    setActiveWeek(program.weeks.length)
  }

  function duplicateWeek(weekIndex) {
    const source = program.weeks[weekIndex]
    const copied = JSON.parse(JSON.stringify(source))
    copied.id = uid()
    copied.weekNumber = program.weeks.length + 1
    copied.days = copied.days.map(d => ({
      ...d,
      id: uid(),
      exercises: d.exercises.map(e => ({ ...e, id: uid() })),
    }))
    setProgram(p => ({ ...p, weeks: [...p.weeks, copied] }))
    setActiveWeek(program.weeks.length)
  }

  function deleteWeek(weekIndex) {
    if (program.weeks.length <= 1) return
    setProgram(p => {
      const weeks = p.weeks.filter((_, i) => i !== weekIndex).map((w, i) => ({ ...w, weekNumber: i + 1 }))
      return { ...p, weeks }
    })
    setActiveWeek(w => Math.min(w, program.weeks.length - 2))
  }

  // ── Save actions ───────────────────────────────────────────────────────────

  function handleSaveDraft() {
    onSave({ ...program, status: program.status === 'template' ? 'template' : 'draft' })
  }

  function handlePublish() {
    onSave({ ...program, status: 'active' })
  }

  function handleSaveAsTemplate(name, description) {
    const template = {
      ...JSON.parse(JSON.stringify(program)),
      id: uid(),
      name,
      clientId: null,
      status: 'template',
      isTemplate: true,
      templateName: name,
      templateDescription: description,
      startDate: null,
      // Re-ID everything
      weeks: program.weeks.map(w => ({
        ...w, id: uid(),
        days: w.days.map(d => ({
          ...d, id: uid(),
          exercises: d.exercises.map(e => ({ ...e, id: uid() })),
        })),
      })),
    }
    setTmplModal(false)
    onSave(template)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const clientItems = clients.filter(c => c.status === 'active').map(c => ({
    id: c.id,
    name: c.name,
    initials: c.initials,
    avatarGrad: c.avatarGrad,
  }))

  const hasHealthConditions = activeClient?.healthConditions?.length > 0

  return (
    <div className="program-builder">
      {/* ── Top bar ── */}
      <div className="builder-topbar">
        <button className="builder-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <input
          className="builder-name-input"
          value={program.name}
          onChange={e => updateProg({ name: e.target.value })}
          placeholder="Program name…"
        />

        <div className="builder-topbar-controls">
          <SearchDropdown
            items={clientItems}
            selectedId={program.clientId}
            onSelect={id => updateProg({ clientId: id })}
            onClear={() => updateProg({ clientId: null })}
            placeholder="Assign client…"
          />

          <span className="prog-service-badge">{cfg.label}</span>

          <button
            className={`visibility-toggle ${program.visibility === 'shared' ? 'shared' : ''}`}
            onClick={() => updateProg({ visibility: program.visibility === 'shared' ? 'trainer_only' : 'shared' })}
            title={program.visibility === 'shared' ? 'Shared with client' : 'Trainer only'}
          >
            {program.visibility === 'shared' ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{program.visibility === 'shared' ? 'Shared' : 'Trainer only'}</span>
          </button>

          <button className="builder-btn builder-btn--ghost" onClick={() => setTmplModal(true)}>
            <LayoutTemplate size={14} /> Save as template
          </button>

          <button className="builder-btn builder-btn--draft" onClick={handleSaveDraft}>
            <Save size={14} /> Save draft
          </button>

          <button className="builder-btn builder-btn--publish" onClick={handlePublish}>
            <Send size={14} /> Publish
          </button>
        </div>

        <button
          className="panel-toggle-btn"
          onClick={() => setPanelOpen(o => !o)}
          title={panelOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* ── Health warning strip ── */}
      {hasHealthConditions && (
        <div className="health-warning-strip">
          <AlertTriangle size={16} />
          <strong>Health conditions:</strong>
          <span>{activeClient.healthConditions.join(' · ')}</span>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className={`builder-main ${panelOpen ? '' : 'panel-closed'}`}>
        <div className="builder-content">
          {/* Week tabs */}
          <div className="week-tabs-bar">
            <div className="week-tabs">
              {program.weeks.map((w, i) => {
                const sessionCount = w.days.reduce((sum, d) => sum + d.exercises.length, 0)
                return (
                  <div key={w.id} className="week-tab-wrap">
                    <button
                      className={`week-tab ${i === activeWeek ? 'active' : ''}`}
                      onClick={() => setActiveWeek(i)}
                    >
                      Week {w.weekNumber}
                      <span className="week-tab-count">{w.days.length} days</span>
                    </button>
                    {i === activeWeek && program.weeks.length > 1 && (
                      <button
                        className="week-tab-delete"
                        onClick={() => deleteWeek(i)}
                        title="Remove week"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="week-tab-actions">
              <button className="week-action-btn" onClick={() => duplicateWeek(activeWeek)} title="Duplicate this week">
                <Copy size={13} /> Duplicate week
              </button>
              <button className="week-action-btn week-action-btn--add" onClick={addWeek}>
                <Plus size={13} /> Add week
              </button>
            </div>
          </div>

          {/* Day columns */}
          {currentWeek ? (
            <div className="days-scroll-area">
              <div className="days-row">
                {currentWeek.days.map((day, dayIdx) => (
                  <DayColumn
                    key={day.id}
                    day={day}
                    weekId={currentWeek.id}
                    dayIndex={dayIdx}
                    exerciseLibrary={exerciseLibrary}
                    onUpdateDay={updateDay}
                    onDeleteDay={deleteDay}
                    onUpdateExercise={updateExercise}
                    onDeleteExercise={deleteExercise}
                    onAddExercise={addExercise}
                    onReorderExercise={reorderExercise}
                    dragExercise={dragExercise}
                    setDragExercise={setDragExercise}
                    dragOverExercise={dragOverExercise}
                    setDragOverExercise={setDragOverExercise}
                    dragDay={dragDay}
                    setDragDay={setDragDay}
                    dragOverDay={dragOverDay}
                    setDragOverDay={setDragOverDay}
                    onReorderDay={reorderDay}
                  />
                ))}

                <button className="add-day-btn" onClick={() => addDay(currentWeek.id)}>
                  <Plus size={16} />
                  <span>Add day</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="days-empty">
              <p>No weeks yet.</p>
              <button className="week-action-btn week-action-btn--add" onClick={addWeek}>
                <Plus size={13} /> Add first week
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        {panelOpen && (
          <div className="builder-right-panel">
            <RightPanel client={activeClient} />
          </div>
        )}
      </div>

      {/* ── Save as template modal ── */}
      {tmplModal && (
        <SaveAsTemplateModal
          programName={program.name}
          onSave={handleSaveAsTemplate}
          onClose={() => setTmplModal(false)}
        />
      )}
    </div>
  )
}
