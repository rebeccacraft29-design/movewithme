import { useState } from 'react'
import {
  ArrowLeft, Eye, EyeOff, Save, LayoutTemplate, Plus, Trash2,
  GripVertical, X, Copy, AlertTriangle, Users, TrendingUp, Award,
  StickyNote, Edit2, Check, Star, ChevronRight, RefreshCw,
} from 'lucide-react'
import { getServiceConfig } from '../data/mockData'
import { uid, getExerciseName } from '../data/programsData'
import SearchDropdown from '../components/SearchDropdown'
import './ProgramDetail.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function reorder(arr, from, to) {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

function parseWeight(w) {
  if (!w) return null
  const m = String(w).match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

function isWeightIncrease(prescribed, actual) {
  const p = parseWeight(prescribed)
  const a = parseWeight(actual)
  return p !== null && a !== null && a > p
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

const STATUS_CONFIG = {
  active:    { label: 'Active',    className: 'badge-active' },
  draft:     { label: 'Draft',     className: 'badge-draft' },
  template:  { label: 'Template',  className: 'badge-template' },
  completed: { label: 'Completed', className: 'badge-completed' },
}

// ── ExerciseBlock ─────────────────────────────────────────────────────────────

function ExerciseBlock({
  block, weekId, dayId, index, exerciseLibrary,
  onUpdate, onDelete,
  dragExercise, setDragExercise, dragOverExercise, setDragOverExercise, onReorder,
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
      <div className="ex-block-grip"><GripVertical size={14} /></div>
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
            <input className="ex-input" type="text" value={block.sets}
              onChange={e => onUpdate(weekId, dayId, block.id, { sets: e.target.value })} placeholder="3" />
          </div>
          <div className="ex-input-group">
            <label className="ex-input-label">Reps</label>
            <input className="ex-input" type="text" value={block.reps}
              onChange={e => onUpdate(weekId, dayId, block.id, { reps: e.target.value })} placeholder="10" />
          </div>
          <div className="ex-input-group">
            <label className="ex-input-label">Weight</label>
            <input className="ex-input" type="text" value={block.weight}
              onChange={e => onUpdate(weekId, dayId, block.id, { weight: e.target.value })} placeholder="kg / BW" />
          </div>
        </div>
        <input className="ex-notes-input" type="text" value={block.notes}
          onChange={e => onUpdate(weekId, dayId, block.id, { notes: e.target.value })}
          placeholder="Notes (optional)…" />
      </div>
      <button className="ex-block-delete" onClick={() => onDelete(weekId, dayId, block.id)} title="Remove">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── DayColumn ─────────────────────────────────────────────────────────────────

function DayColumn({
  day, weekId, dayIndex, exerciseLibrary,
  onUpdateDay, onDeleteDay, onUpdateExercise, onDeleteExercise, onAddExercise, onReorderExercise,
  dragExercise, setDragExercise, dragOverExercise, setDragOverExercise,
  dragDay, setDragDay, dragOverDay, setDragOverDay, onReorderDay,
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
        <div className="day-drag-handle" draggable
          onDragStart={() => setDragDay({ weekId, index: dayIndex })}
          onDragEnd={() => { setDragDay(null); setDragOverDay(null) }}
        >
          <GripVertical size={14} />
        </div>
        <input className="day-label-input" value={day.label}
          onChange={e => onUpdateDay(weekId, day.id, { label: e.target.value })} />
        <button className="day-delete-btn" onClick={() => onDeleteDay(weekId, day.id)}>
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
        <button className="add-exercise-btn" onClick={() => onAddExercise(weekId, day.id)}>
          <Plus size={14} /> Add exercise
        </button>
      </div>
      <div className="day-session-notes">
        <textarea className="session-notes-input" value={day.sessionNotes}
          onChange={e => onUpdateDay(weekId, day.id, { sessionNotes: e.target.value })}
          placeholder="Session notes for this day…" rows={2} />
      </div>
    </div>
  )
}

// ── SaveAsTemplateModal ───────────────────────────────────────────────────────

function SaveAsTemplateModal({ programName, onSave, onClose }) {
  const [name, setName] = useState(programName)
  const [desc, setDesc] = useState('')
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
            <input className="satm-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. 12-Week Strength Foundation" />
          </div>
          <div className="satm-field">
            <label className="satm-label">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea className="satm-input satm-textarea" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Briefly describe this template…" rows={3} />
          </div>
        </div>
        <div className="satm-footer">
          <button className="satm-cancel" onClick={onClose}>Cancel</button>
          <button className="satm-save" disabled={!name.trim()}
            onClick={() => name.trim() && onSave(name.trim(), desc.trim())}>
            <LayoutTemplate size={15} /> Save template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── OverrideModal ─────────────────────────────────────────────────────────────

function OverrideModal({ clientName, exerciseName, changes, onClientOnly, onMaster, onCancel }) {
  return (
    <div className="modal-overlay-builder" onClick={onCancel}>
      <div className="override-modal" onClick={e => e.stopPropagation()}>
        <div className="override-modal-header">
          <div>
            <h3>Update exercise</h3>
            <p className="override-exercise-name">{exerciseName}</p>
          </div>
          <button className="modal-close-sm" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="override-modal-body">
          <div className="override-changes">
            {changes.map((c, i) => (
              <div key={i} className="override-change-row">
                <span className="override-change-field">{c.field}</span>
                <span className="override-change-old">{c.old}</span>
                <span className="override-change-arrow">→</span>
                <span className="override-change-new">{c.new}</span>
              </div>
            ))}
          </div>
          <p className="override-question">Apply this change to:</p>
        </div>
        <div className="override-modal-footer">
          <button className="override-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="override-btn-client" onClick={onClientOnly}>
            <span className="override-btn-title">{clientName} only</span>
            <span className="override-btn-sub">Other clients unchanged</span>
          </button>
          <button className="override-btn-master" onClick={onMaster}>
            <span className="override-btn-title">All clients</span>
            <span className="override-btn-sub">Updates master program</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MigrateClientModal ────────────────────────────────────────────────────────

function MigrateClientModal({ clientName, fromVersion, toVersion, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay-builder" onClick={onCancel}>
      <div className="migrate-modal" onClick={e => e.stopPropagation()}>
        <div className="migrate-modal-header">
          <h3>Migrate to v{toVersion}</h3>
          <button className="modal-close-sm" onClick={onCancel}><X size={16} /></button>
        </div>
        <div className="migrate-modal-body">
          <p>
            Move <strong>{clientName}</strong> from <span className="version-badge version-badge--old">v{fromVersion}</span> to <span className="version-badge version-badge--new">v{toVersion}</span>.
          </p>
          <p className="migrate-note">
            Their upcoming sessions will use the updated program. Completed sessions and logged data are unchanged.
          </p>
        </div>
        <div className="migrate-modal-footer">
          <button className="satm-cancel" onClick={onCancel}>Cancel</button>
          <button className="migrate-confirm" onClick={onConfirm}>
            <RefreshCw size={14} /> Migrate to v{toVersion}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ value }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= value ? 'star-filled' : 'star-empty'} fill={i <= value ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

// ── AssignClientPicker ────────────────────────────────────────────────────────

function AssignClientPicker({ allClients, assignedClients, onAssign, onClose }) {
  const available = allClients.filter(c => !assignedClients.some(ac => ac.id === c.id))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Assign a client</h2>
            <p className="modal-subtitle">Client will start on Week 1 of this program</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {available.length === 0 ? (
          <div className="assign-picker-empty">All clients are already on this program.</div>
        ) : (
          <div className="assign-picker-list">
            {available.map(c => {
              const cfg = getServiceConfig(c.serviceType)
              return (
                <button key={c.id} className="assign-picker-item" onClick={() => { onAssign(c.id); onClose() }}>
                  <div className="prog-avatar prog-avatar--sm" style={{ background: c.avatarGrad }}>{c.initials}</div>
                  <div>
                    <div className="assign-picker-name">{c.name}</div>
                    <div className="assign-picker-meta">{cfg.label}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ClientsTab ────────────────────────────────────────────────────────────────

function ClientsTab({ assignedClients, allClients, programLogs, currentVersion, onSelectClient, onMigrateClient, onAssignClient }) {
  const [migrateTarget, setMigrateTarget] = useState(null)
  const [showAssignPicker, setShowAssignPicker] = useState(false)

  return (
    <div className="clients-tab">
      <div className="clients-tab-actions">
        <div className="clients-tab-header">
          {assignedClients.length > 0
            ? <span>{assignedClients.length} {assignedClients.length === 1 ? 'client' : 'clients'}</span>
            : <span style={{ color: 'var(--text-muted)' }}>No clients assigned</span>
          }
        </div>
        <button className="btn-assign-client" onClick={() => setShowAssignPicker(true)}>
          <Plus size={14} /> Assign client
        </button>
      </div>

      {assignedClients.length === 0 && (
        <div className="clients-tab-empty">
          <Users size={36} />
          <p>Assign a client to start tracking their progress.</p>
        </div>
      )}

      {showAssignPicker && (
        <AssignClientPicker
          allClients={allClients}
          assignedClients={assignedClients}
          onAssign={onAssignClient}
          onClose={() => setShowAssignPicker(false)}
        />
      )}

      {assignedClients.map(client => {
        const data = programLogs?.clients?.[client.id]
        if (!data) return null
        const cfg = getServiceConfig(client.serviceType)
        const pct = Math.round((data.completedSessions / Math.max(data.totalSessions, 1)) * 100)
        const clientVersion = data.programVersion ?? 1
        const isOutdated = clientVersion < currentVersion

        return (
          <div key={client.id} className="client-row-wrap">
            <button className="client-row" onClick={() => onSelectClient(client.id)}>
              <div className="cr-avatar" style={{ background: client.avatarGrad }}>{client.initials}</div>
              <div className="cr-info">
                <div className="cr-name-row">
                  <span className="cr-name">{client.name}</span>
                  <span className={`version-badge ${isOutdated ? 'version-badge--old' : 'version-badge--current'}`}>
                    v{clientVersion}
                  </span>
                </div>
                <div className="cr-meta">
                  <span className="prog-service-badge">{cfg.label}</span>
                  <span className="cr-week">Week {data.currentWeek}</span>
                  <span className="cr-sessions">{data.completedSessions}/{data.totalSessions} sessions</span>
                </div>
              </div>
              <div className="cr-progress">
                <div className="cr-progress-bar">
                  <div className="cr-progress-fill" style={{ width: pct + '%' }} />
                </div>
                <span className="cr-pct">{pct}%</span>
              </div>
              <ChevronRight size={16} className="cr-arrow" />
            </button>

            {isOutdated && (
              <button
                className="cr-migrate-btn"
                onClick={e => { e.stopPropagation(); setMigrateTarget(client) }}
                title={`Migrate ${client.name} to v${currentVersion}`}
              >
                <RefreshCw size={12} /> Migrate to v{currentVersion}
              </button>
            )}
          </div>
        )
      })}

      {migrateTarget && (
        <MigrateClientModal
          clientName={migrateTarget.name}
          fromVersion={programLogs?.clients?.[migrateTarget.id]?.programVersion ?? 1}
          toVersion={currentVersion}
          onConfirm={() => {
            onMigrateClient(migrateTarget.id, currentVersion)
            setMigrateTarget(null)
          }}
          onCancel={() => setMigrateTarget(null)}
        />
      )}
    </div>
  )
}

// ── ClientProgramView ─────────────────────────────────────────────────────────

function ClientProgramView({ program, client, clientData, overrides, onBack, onApplyOverride, onUpdateMaster }) {
  const [activeWeekIdx, setActiveWeekIdx] = useState(
    Math.min(Math.max((clientData.currentWeek ?? 1) - 1, 0), program.weeks.length - 1)
  )
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [overrideModal, setOverrideModal] = useState(null)

  const currentWeekData = program.weeks[activeWeekIdx]
  const weekLogs = clientData.weekLogs?.[currentWeekData?.id] ?? {}

  const completedSessions = clientData.completedSessions ?? 0
  const totalSessions = clientData.totalSessions ?? 0
  const completionPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  // Calculate streak (consecutive completed sessions from most recent)
  const allLogs = Object.values(clientData.weekLogs ?? {}).flatMap(wl => Object.values(wl))
  const sortedLogs = allLogs.slice().sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
  let streak = 0
  for (const log of sortedLogs) {
    if (log.completed) streak++
    else break
  }

  // Collect all rated sessions for the sidebar
  const sessionRatings = []
  for (const [weekId, dayLogs] of Object.entries(clientData.weekLogs ?? {})) {
    for (const [dayId, log] of Object.entries(dayLogs)) {
      if (log.completed && log.rating != null) {
        const wk = program.weeks.find(w => w.id === weekId)
        const dy = wk?.days.find(d => d.id === dayId)
        if (dy) sessionRatings.push({ dayLabel: dy.label, date: log.date, rating: log.rating })
      }
    }
  }
  sessionRatings.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  function startEdit(block, weekId, dayId) {
    const override = overrides[block.id]
    setEditingBlock({
      blockId: block.id,
      weekId,
      dayId,
      sets: String(override?.sets ?? block.sets),
      reps: String(override?.reps ?? block.reps),
      weight: override?.weight ?? block.weight ?? '',
      notes: override?.notes ?? block.notes ?? '',
      exerciseName: getExerciseName(block.exerciseId),
    })
  }

  function cancelEdit() { setEditingBlock(null) }

  function commitEdit() {
    if (!editingBlock) return
    const { blockId, weekId, dayId, sets, reps, weight, notes, exerciseName } = editingBlock

    const week = program.weeks.find(w => w.id === weekId)
    const day = week?.days.find(d => d.id === dayId)
    const masterBlock = day?.exercises.find(e => e.id === blockId)
    if (!masterBlock) return

    const current = overrides[blockId] ?? masterBlock
    const changes = []
    if (String(sets) !== String(current.sets))     changes.push({ field: 'Sets',   old: String(current.sets),   new: sets })
    if (String(reps) !== String(current.reps))     changes.push({ field: 'Reps',   old: String(current.reps),   new: reps })
    if ((weight || '') !== (current.weight || '')) changes.push({ field: 'Weight', old: current.weight || '—',  new: weight || '—' })
    if ((notes  || '') !== (current.notes  || '')) changes.push({ field: 'Notes',  old: current.notes  || '—',  new: notes  || '—' })

    if (!changes.length) { setEditingBlock(null); return }

    if (isEditMode) {
      // In edit mode: always apply as client-only override, no modal
      onApplyOverride(blockId, { sets, reps, weight, notes })
      setEditingBlock(null)
    } else {
      setOverrideModal({ blockId, weekId, dayId, newValues: { sets, reps, weight, notes }, changes, exerciseName })
      setEditingBlock(null)
    }
  }

  function handleClientOnly() {
    if (!overrideModal) return
    onApplyOverride(overrideModal.blockId, overrideModal.newValues)
    setOverrideModal(null)
  }

  function handleMasterUpdate() {
    if (!overrideModal) return
    onUpdateMaster(overrideModal.weekId, overrideModal.dayId, overrideModal.blockId, overrideModal.newValues)
    setOverrideModal(null)
  }

  const cfg = getServiceConfig(client.serviceType)
  const hasConditions = client.healthConditions?.length > 0

  return (
    <div className="cpv">
      {/* Edit mode banner */}
      {isEditMode && (
        <div className="cpv-edit-mode-banner">
          <Edit2 size={14} className="cpv-edit-mode-icon" />
          <span>You are editing <strong>{client.name}</strong>'s version of this program. Changes here only affect them.</span>
          <div className="cpv-edit-mode-actions">
            <button className="cpv-edit-mode-cancel" onClick={() => { setIsEditMode(false); setEditingBlock(null) }}>
              Cancel
            </button>
            <button className="cpv-edit-mode-save" onClick={() => setIsEditMode(false)}>
              <Check size={13} /> Save changes
            </button>
          </div>
        </div>
      )}

      {/* Health conditions strip */}
      {hasConditions && (
        <div className="health-warning-strip">
          <AlertTriangle size={16} />
          <strong>Health conditions:</strong>
          <span>{client.healthConditions.join(' · ')}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="cpv-header-bar">
        <button className="cpv-back" onClick={onBack}>
          <ArrowLeft size={14} /> Back to program
        </button>
        <div className="cpv-header-inner">
          <div className="cpv-avatar" style={{ background: client.avatarGrad }}>{client.initials}</div>
          <div className="cpv-header-info">
            <div className="cpv-client-name">{client.name}</div>
            <div className="cpv-client-meta">
              <span className="prog-service-badge">{cfg.label}</span>
              <span className="cpv-week-label">Week {clientData.currentWeek} of {program.weeks.length}</span>
            </div>
          </div>
          <div className="cpv-header-stats">
            <div className="cpv-hstat">
              <div className="cpv-hstat-value">{completionPct}%</div>
              <div className="cpv-hstat-label">Completion</div>
            </div>
            <div className="cpv-hstat">
              <div className="cpv-hstat-value">{streak > 0 ? streak : '—'}</div>
              <div className="cpv-hstat-label">Streak</div>
            </div>
            <div className="cpv-hstat">
              <div className="cpv-hstat-value">{clientData.currentWeek}</div>
              <div className="cpv-hstat-label">Current Week</div>
            </div>
          </div>
          {!isEditMode && (
            <button className="cpv-edit-program-btn" onClick={() => setIsEditMode(true)}>
              <Edit2 size={13} /> Edit client program
            </button>
          )}
        </div>
      </div>

      {/* Week tabs */}
      <div className="cpv-week-tabs">
        {program.weeks.map((w, i) => (
          <button
            key={w.id}
            className={`cpv-week-tab ${i === activeWeekIdx ? 'active' : ''}`}
            onClick={() => setActiveWeekIdx(i)}
          >
            Week {w.weekNumber}
            {i === (clientData.currentWeek ?? 1) - 1 && <span className="cpv-current-dot" />}
          </button>
        ))}
      </div>

      {/* Two-column body */}
      <div className={`cpv-body ${isEditMode ? 'cpv-body--edit' : ''}`}>

        {/* Left: day columns */}
        <div className="cpv-left">
          {currentWeekData ? (
            <div className="cpv-days-scroll">
              <div className="cpv-days-row">
              {currentWeekData.days.map(day => {
                const sessionLog = weekLogs[day.id] ?? { completed: false, exercises: {} }
                return (
                  <div key={day.id} className={`cpv-day-card ${sessionLog.completed ? 'cpv-day-card--done' : ''}`}>
                    <div className="cpv-day-header">
                      <div className="cpv-day-header-top">
                        <span className="cpv-day-name">{day.label}</span>
                        {sessionLog.completed && sessionLog.rating != null && (
                          <StarRating value={sessionLog.rating} />
                        )}
                      </div>
                      <span className={`cpv-session-status ${sessionLog.completed ? 'status-done' : 'status-missed'}`}>
                        {sessionLog.completed ? `Completed · ${formatDate(sessionLog.date)}` : 'Not completed'}
                      </span>
                    </div>

                    {day.exercises.length === 0 && (
                      <div className="cpv-day-empty">No exercises</div>
                    )}

                    {day.exercises.map(block => {
                      const override = overrides[block.id]
                      const prescribed = override ?? block
                      const logged = sessionLog.exercises[block.id]
                      const weightUp = logged ? isWeightIncrease(prescribed.weight, logged.weight) : false
                      const isEditingThis = editingBlock?.blockId === block.id

                      return (
                        <div key={block.id} className="cpv-ex-item">
                          <div className="cpv-ex-item-name">
                            {getExerciseName(block.exerciseId)}
                            {override && <span className="override-chip">Override</span>}
                          </div>
                          <div className="cpv-ex-item-values">
                            <div className="cpv-ex-col">
                              <div className="cpv-ex-col-label">Prescribed</div>
                              {isEditingThis ? (
                                <div className="inline-edit-row">
                                  <input className="cpv-edit-input cpv-edit-small" value={editingBlock.sets}
                                    onChange={e => setEditingBlock(p => ({ ...p, sets: e.target.value }))}
                                    placeholder="Sets" />
                                  <span className="inline-edit-sep">×</span>
                                  <input className="cpv-edit-input cpv-edit-small" value={editingBlock.reps}
                                    onChange={e => setEditingBlock(p => ({ ...p, reps: e.target.value }))}
                                    placeholder="Reps" />
                                  <input className="cpv-edit-input cpv-edit-weight" value={editingBlock.weight}
                                    onChange={e => setEditingBlock(p => ({ ...p, weight: e.target.value }))}
                                    placeholder="Weight" />
                                  <button className="cpv-edit-save" onClick={commitEdit}><Check size={12} /></button>
                                  <button className="cpv-edit-cancel" onClick={cancelEdit}><X size={12} /></button>
                                </div>
                              ) : (
                                <div className="cpv-prescribed-display">
                                  <span className="cpv-prescribed-text">
                                    {prescribed.sets} × {prescribed.reps}
                                    {prescribed.weight ? ` @ ${prescribed.weight}` : ''}
                                  </span>
                                  <button
                                    className="cpv-edit-btn"
                                    onClick={() => startEdit(block, currentWeekData.id, day.id)}
                                    title="Edit prescribed values"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="cpv-ex-col">
                              <div className="cpv-ex-col-label">Logged</div>
                              <div className={`cpv-logged-val ${weightUp ? 'weight-increase' : ''}`}>
                                {logged ? (
                                  <>
                                    {logged.sets} × {logged.reps}
                                    {logged.weight ? ` @ ${logged.weight}` : ''}
                                    {weightUp && <span className="weight-up-badge">▲</span>}
                                  </>
                                ) : (
                                  <span className="not-logged">—</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {prescribed.notes && (
                            <div className="cpv-ex-item-notes">{prescribed.notes}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              </div>
            </div>
          ) : (
            <div className="days-empty"><p>No sessions for this week.</p></div>
          )}
        </div>

        {/* Right: notes + ratings */}
        <div className="cpv-right">
          {clientData.trainerNotes?.length > 0 && (
            <div className="cpv-right-section">
              <div className="cpv-section-label"><StickyNote size={13} /> Trainer Notes</div>
              <div className="cpv-trainer-notes">
                {clientData.trainerNotes.map(note => (
                  <div key={note.id} className="cpv-trainer-note">
                    <StickyNote size={12} className="note-icon" />
                    <div className="cpv-note-body">
                      <span className="note-content">{note.content}</span>
                      <span className="note-date">{formatDate(note.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessionRatings.length > 0 && (
            <div className="cpv-right-section">
              <div className="cpv-section-label"><Star size={13} /> Recent Sessions</div>
              <div className="cpv-ratings-list">
                {sessionRatings.slice(0, 8).map((s, i) => (
                  <div key={i} className="cpv-rating-row">
                    <div className="cpv-rating-info">
                      <span className="cpv-rating-label">{s.dayLabel}</span>
                      <span className="cpv-rating-date">{formatDate(s.date)}</span>
                    </div>
                    <StarRating value={s.rating} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {clientData.personalBests?.length > 0 && (
            <div className="cpv-right-section">
              <div className="cpv-section-label"><Award size={13} /> Personal Bests</div>
              <div className="cpv-pb-list">
                {clientData.personalBests.map((pb, i) => (
                  <div key={i} className="cpv-pb-chip">
                    <Award size={10} /> {pb.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Override modal (non-edit mode only) */}
      {!isEditMode && overrideModal && (
        <OverrideModal
          clientName={client.name}
          exerciseName={overrideModal.exerciseName}
          changes={overrideModal.changes}
          onClientOnly={handleClientOnly}
          onMaster={handleMasterUpdate}
          onCancel={() => setOverrideModal(null)}
        />
      )}
    </div>
  )
}

// ── Main ProgramDetail ────────────────────────────────────────────────────────

export default function ProgramDetail({ program: initialProgram, clients, exerciseLibrary, clientLogs, onSave, onBack }) {
  const [program, setProgram]     = useState(() => JSON.parse(JSON.stringify(initialProgram)))
  const [activeTab, setActiveTab] = useState('program')  // 'program' | 'clients'
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [tmplModal, setTmplModal] = useState(false)
  const [saveBanner, setSaveBanner] = useState(null)  // { activeCount, oldVersion, newVersion }

  // Builder drag state (Program tab)
  const [activeWeek, setActiveWeek]                   = useState(0)
  const [dragExercise, setDragExercise]               = useState(null)
  const [dragOverExercise, setDragOverExercise]       = useState(null)
  const [dragDay, setDragDay]                         = useState(null)
  const [dragOverDay, setDragOverDay]                 = useState(null)

  // Local copy of client logs (holds overrides, version migrations)
  const [localClientLogs, setLocalClientLogs] = useState(() => JSON.parse(JSON.stringify(clientLogs ?? {})))

  // Derive assigned clients from logs (fall back to single clientId)
  const programLogs = localClientLogs[program.id]
  const assignedClientIds = programLogs?.assignedClientIds ?? (program.clientId ? [program.clientId] : [])
  const assignedClients = assignedClientIds.map(id => clients.find(c => c.id === id)).filter(Boolean)

  const currentVersion = program.version ?? 1

  // Active clients on older versions
  const outdatedCount = assignedClients.filter(c => {
    const d = programLogs?.clients?.[c.id]
    return d && (d.programVersion ?? 1) < currentVersion
  }).length

  // Any assigned client with health conditions
  const clientsWithConditions = assignedClients.filter(c => c.healthConditions?.length > 0)

  const cfg    = getServiceConfig(program.serviceType)
  const status = STATUS_CONFIG[program.status] ?? STATUS_CONFIG.draft

  // ── Program mutations ──────────────────────────────────────────────────────

  function updateDay(weekId, dayId, changes) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.map(d => d.id !== dayId ? d : { ...d, ...changes }),
      }),
    }))
  }

  function updateExercise(weekId, dayId, blockId, changes) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.map(d => d.id !== dayId ? d : {
          ...d, exercises: d.exercises.map(e => e.id !== blockId ? e : { ...e, ...changes }),
        }),
      }),
    }))
  }

  function deleteExercise(weekId, dayId, blockId) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.map(d => d.id !== dayId ? d : {
          ...d, exercises: d.exercises.filter(e => e.id !== blockId),
        }),
      }),
    }))
  }

  function addExercise(weekId, dayId) {
    const newBlock = { id: uid(), exerciseId: null, sets: 3, reps: '10', weight: '', notes: '' }
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.map(d => d.id !== dayId ? d : {
          ...d, exercises: [...d.exercises, newBlock],
        }),
      }),
    }))
  }

  function reorderExercise(weekId, dayId, fromIdx, toIdx) {
    if (fromIdx == null || toIdx == null || fromIdx === toIdx) return
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.map(d => d.id !== dayId ? d : {
          ...d, exercises: reorder(d.exercises, fromIdx, toIdx),
        }),
      }),
    }))
  }

  function deleteDay(weekId, dayId) {
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: w.days.filter(d => d.id !== dayId),
      }),
    }))
  }

  function addDay(weekId) {
    const newDay = { id: uid(), label: 'New Day', exercises: [], sessionNotes: '' }
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: [...w.days, newDay],
      }),
    }))
  }

  function reorderDay(weekId, fromIdx, toIdx) {
    if (fromIdx == null || toIdx == null || fromIdx === toIdx) return
    setProgram(p => ({
      ...p,
      weeks: p.weeks.map(w => w.id !== weekId ? w : {
        ...w, days: reorder(w.days, fromIdx, toIdx),
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
      ...d, id: uid(), exercises: d.exercises.map(e => ({ ...e, id: uid() })),
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

  // ── Client log mutations ───────────────────────────────────────────────────

  function applyClientOverride(clientId, blockId, changes) {
    setLocalClientLogs(prev => {
      const progData = prev[program.id] ?? { assignedClientIds: [], clients: {} }
      const clientData = progData.clients?.[clientId] ?? {}
      return {
        ...prev,
        [program.id]: {
          ...progData,
          clients: {
            ...progData.clients,
            [clientId]: {
              ...clientData,
              overrides: { ...(clientData.overrides ?? {}), [blockId]: changes },
            },
          },
        },
      }
    })
  }

  function migrateClient(clientId, toVersion) {
    setLocalClientLogs(prev => {
      const progData = prev[program.id] ?? { assignedClientIds: [], clients: {} }
      const clientData = progData.clients?.[clientId] ?? {}
      return {
        ...prev,
        [program.id]: {
          ...progData,
          clients: {
            ...progData.clients,
            [clientId]: { ...clientData, programVersion: toVersion },
          },
        },
      }
    })
  }

  function assignClient(clientId) {
    setLocalClientLogs(prev => {
      const progData = prev[program.id] ?? { assignedClientIds: [], clients: {} }
      if (progData.assignedClientIds.includes(clientId)) return prev
      return {
        ...prev,
        [program.id]: {
          ...progData,
          assignedClientIds: [...progData.assignedClientIds, clientId],
          clients: {
            ...progData.clients,
            [clientId]: progData.clients[clientId] ?? {
              programVersion: currentVersion,
              currentWeek: 1,
              completedSessions: 0,
              totalSessions: program.weeks.length * program.sessionsPerWeek,
              personalBests: [],
              weekLogs: {},
              trainerNotes: [],
              overrides: {},
            },
          },
        },
      }
    })
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  function handleSave() {
    const activeClientsOnOlderVersion = assignedClients.filter(c => {
      const d = programLogs?.clients?.[c.id]
      return d && (d.programVersion ?? 1) <= currentVersion
    })

    const newVersion = currentVersion + 1

    if (activeClientsOnOlderVersion.length > 0) {
      setProgram(p => ({ ...p, version: newVersion }))
      setSaveBanner({
        activeCount: activeClientsOnOlderVersion.length,
        oldVersion: currentVersion,
        newVersion,
      })
      onSave({ ...program, version: newVersion })
    } else {
      onSave(program)
    }
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
      version: 1,
      weeks: program.weeks.map(w => ({
        ...w, id: uid(),
        days: w.days.map(d => ({
          ...d, id: uid(), exercises: d.exercises.map(e => ({ ...e, id: uid() })),
        })),
      })),
    }
    setTmplModal(false)
    onSave(template)
  }

  // ── Client-Program view ────────────────────────────────────────────────────

  const selectedClient     = selectedClientId ? clients.find(c => c.id === selectedClientId) : null
  const selectedClientData = selectedClientId ? programLogs?.clients?.[selectedClientId] : null
  const selectedClientOverrides = selectedClientData?.overrides ?? {}

  if (selectedClientId && selectedClientData && selectedClient) {
    return (
      <div className="program-detail">
        <ClientProgramView
          program={program}
          client={selectedClient}
          clientData={selectedClientData}
          overrides={selectedClientOverrides}
          onBack={() => setSelectedClientId(null)}
          onApplyOverride={(blockId, changes) => applyClientOverride(selectedClientId, blockId, changes)}
          onUpdateMaster={(weekId, dayId, blockId, changes) => updateExercise(weekId, dayId, blockId, changes)}
        />
      </div>
    )
  }

  // ── Main detail view ───────────────────────────────────────────────────────

  const currentWeek = program.weeks[activeWeek] ?? program.weeks[0]

  return (
    <div className="program-detail">
      {/* Top bar */}
      <div className="detail-topbar">
        <button className="builder-back" onClick={onBack}>
          <ArrowLeft size={16} /> Programs
        </button>

        <input
          className="builder-name-input"
          value={program.name}
          onChange={e => setProgram(p => ({ ...p, name: e.target.value }))}
          placeholder="Program name…"
        />

        <div className="detail-topbar-badges">
          {program.isTemplate ? (
            <span className={`prog-badge ${status.className}`}>{status.label}</span>
          ) : (
            <select
              className={`status-select prog-badge ${status.className}`}
              value={program.status}
              onChange={e => setProgram(p => ({ ...p, status: e.target.value }))}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          )}
          <span className="version-badge version-badge--current">v{currentVersion}</span>
        </div>

        <div className="detail-topbar-controls">
          <span className="prog-service-badge">{cfg.label}</span>

          <button
            className={`visibility-toggle ${program.visibility === 'shared' ? 'shared' : ''}`}
            onClick={() => setProgram(p => ({
              ...p, visibility: p.visibility === 'shared' ? 'trainer_only' : 'shared',
            }))}
          >
            {program.visibility === 'shared' ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{program.visibility === 'shared' ? 'Shared' : 'Trainer only'}</span>
          </button>

          <button className="builder-btn builder-btn--ghost" onClick={() => setTmplModal(true)}>
            <LayoutTemplate size={14} /> Save as template
          </button>

          <button className="builder-btn builder-btn--publish" onClick={handleSave}>
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Save banner */}
      {saveBanner && (
        <div className="save-version-banner">
          <span>
            <strong>{saveBanner.activeCount} {saveBanner.activeCount === 1 ? 'client' : 'clients'} active on this program</strong>
            {' '}will keep their existing version (v{saveBanner.oldVersion}). New clients will receive v{saveBanner.newVersion}.
          </span>
          <button className="save-banner-dismiss" onClick={() => setSaveBanner(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'program' ? 'active' : ''}`}
          onClick={() => setActiveTab('program')}
        >
          Program
        </button>
        <button
          className={`detail-tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
          {assignedClients.length > 0 && (
            <span className="detail-tab-count">{assignedClients.length}</span>
          )}
          {outdatedCount > 0 && (
            <span className="detail-tab-outdated" title={`${outdatedCount} client${outdatedCount > 1 ? 's' : ''} on older version`}>
              {outdatedCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'program' ? (
        <div className="detail-program-tab">
          {/* Week tabs */}
          <div className="week-tabs-bar">
            <div className="week-tabs">
              {program.weeks.map((w, i) => (
                <div key={w.id} className="week-tab-wrap">
                  <button
                    className={`week-tab ${i === activeWeek ? 'active' : ''}`}
                    onClick={() => setActiveWeek(i)}
                  >
                    Week {w.weekNumber}
                    <span className="week-tab-count">{w.days.length} days</span>
                  </button>
                  {i === activeWeek && program.weeks.length > 1 && (
                    <button className="week-tab-delete" onClick={() => deleteWeek(i)}>
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="week-tab-actions">
              <button className="week-action-btn" onClick={() => duplicateWeek(activeWeek)}>
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
      ) : (
        <div className="detail-clients-tab">
          <ClientsTab
            assignedClients={assignedClients}
            allClients={clients}
            programLogs={programLogs}
            currentVersion={currentVersion}
            onSelectClient={setSelectedClientId}
            onMigrateClient={migrateClient}
            onAssignClient={assignClient}
          />
        </div>
      )}

      {/* Save as template modal */}
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
