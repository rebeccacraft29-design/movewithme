import { useState, useEffect } from 'react'
import { Plus, Copy, Edit2, LayoutTemplate, FileText, Layers, X, ChevronRight, Users } from 'lucide-react'
import { getServiceConfig } from '../data/mockData'
import { exerciseLibrary, uid, getExerciseName } from '../data/programsData'
import { useAuth } from '../context/AuthContext'
import { getPrograms, saveProgram, deleteProgram, getClients, getClientProgramLogs } from '../lib/db'
import ProgramDetail from './ProgramDetail'
import './Programs.css'

// ── Helpers ───────────────────────────────────────────────────────────────────


function deepCloneProgram(program) {
  return JSON.parse(JSON.stringify(program))
}

function getClientCount(program) {
  return program._clientCount ?? 0
}

const STATUS_SORT_ORDER = { active: 0, draft: 1, template: 2, completed: 3 }

function sortPrograms(programs) {
  return [...programs].sort((a, b) => {
    // Templates first
    if (a.isTemplate !== b.isTemplate) return a.isTemplate ? -1 : 1
    // Then by status
    const as = STATUS_SORT_ORDER[a.status] ?? 99
    const bs = STATUS_SORT_ORDER[b.status] ?? 99
    if (as !== bs) return as - bs
    return a.name.localeCompare(b.name)
  })
}

function blankProgram() {
  const weekId = uid()
  return {
    id: uid(),
    name: 'New Program',
    clientId: null,
    serviceType: 'personal_trainer',
    status: 'draft',
    startDate: '',
    sessionsPerWeek: 3,
    visibility: 'trainer_only',
    isTemplate: false,
    templateName: null,
    templateDescription: null,
    weeks: [{ id: weekId, weekNumber: 1, days: [] }],
  }
}

function cloneFromTemplate(template) {
  const cloned = deepCloneProgram(template)
  // Re-generate all IDs to avoid collisions
  cloned.id = uid()
  cloned.clientId = null
  cloned.status = 'draft'
  cloned.startDate = ''
  cloned.isTemplate = false
  cloned.templateName = null
  cloned.templateDescription = null
  cloned.weeks = cloned.weeks.map(w => ({
    ...w,
    id: uid(),
    days: w.days.map(d => ({
      ...d,
      id: uid(),
      exercises: d.exercises.map(e => ({ ...e, id: uid() })),
    })),
  }))
  return cloned
}

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:    { label: 'Active',    className: 'badge-active' },
  draft:     { label: 'Draft',     className: 'badge-draft' },
  template:  { label: 'Template',  className: 'badge-template' },
  completed: { label: 'Completed', className: 'badge-completed' },
}

// ── Program card ──────────────────────────────────────────────────────────────

function ProgramCard({ program, clientCount, onEdit, onDuplicate, onUseTemplate }) {
  const cfg = getServiceConfig(program.serviceType)
  const status = STATUS_CONFIG[program.status] ?? STATUS_CONFIG.draft
  const totalWeeks = program.weeks.length

  return (
    <div
      className={`program-card ${program.isTemplate ? 'program-card--template' : ''}`}
      onClick={() => onEdit(program)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onEdit(program)}
    >
      <div className="program-card-header">
        <div className="program-card-badges">
          <span className={`prog-badge ${status.className}`}>{status.label}</span>
        </div>
        <div className="program-card-actions" onClick={e => e.stopPropagation()}>
          {program.isTemplate ? (
            <button className="prog-action-btn prog-action-btn--use" onClick={() => onUseTemplate(program)}>
              Use template
            </button>
          ) : (
            <button className="prog-action-btn" title="Duplicate" onClick={() => onDuplicate(program)}>
              <Copy size={14} />
            </button>
          )}
          <button className="prog-action-btn" title="Edit" onClick={() => onEdit(program)}>
            <Edit2 size={14} />
          </button>
        </div>
      </div>

      <div className="program-card-name">{program.name}</div>

      {program.isTemplate && program.templateDescription && (
        <p className="program-card-desc">{program.templateDescription}</p>
      )}

      <div className="program-card-meta">
        <span className="prog-service-badge">{cfg.label}</span>
        <span className="prog-meta-dot" />
        <span>{totalWeeks} {totalWeeks === 1 ? 'week' : 'weeks'}</span>
        <span className="prog-meta-dot" />
        <span>{program.sessionsPerWeek}×/week</span>
      </div>

      <div className="program-card-client-count">
        {clientCount > 0
          ? <span className="prog-client-count"><Users size={13} />{clientCount} {clientCount === 1 ? 'client' : 'clients'}</span>
          : <span className="prog-client-count prog-client-count--none"><Users size={13} />No clients</span>
        }
      </div>
    </div>
  )
}

// ── Template picker modal ─────────────────────────────────────────────────────

function TemplatePicker({ templates, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Choose a template</h2>
            <p className="modal-subtitle">Select a template to pre-fill the program builder</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="template-picker-grid">
          {templates.map(tmpl => {
            const cfg = getServiceConfig(tmpl.serviceType)
            const firstWeek = tmpl.weeks[0]
            const previewExercises = firstWeek
              ? firstWeek.days.flatMap(d => d.exercises).slice(0, 5)
              : []

            return (
              <button key={tmpl.id} className="template-picker-card" onClick={() => onSelect(tmpl)}>
                <div className="tpc-header">
                  <span className="prog-service-badge">{cfg.label}</span>
                  <span className="tpc-meta">{tmpl.weeks.length} wks · {tmpl.sessionsPerWeek}×/week</span>
                </div>
                <div className="tpc-name">{tmpl.templateName}</div>
                {tmpl.templateDescription && (
                  <p className="tpc-desc">{tmpl.templateDescription}</p>
                )}
                {previewExercises.length > 0 && (
                  <div className="tpc-preview">
                    <span className="tpc-preview-label">Week 1 exercises</span>
                    <ul className="tpc-exercise-list">
                      {previewExercises.map(ex => (
                        <li key={ex.id}>{getExerciseName(ex.exerciseId)}</li>
                      ))}
                      {firstWeek && firstWeek.days.flatMap(d => d.exercises).length > 5 && (
                        <li className="tpc-more">+{firstWeek.days.flatMap(d => d.exercises).length - 5} more…</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="tpc-footer">
                  Use this template <ChevronRight size={14} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Copy from existing modal ──────────────────────────────────────────────────

function CopyExistingPicker({ programs, clients, onSelect, onClose }) {
  const clientPrograms = programs.filter(p => !p.isTemplate)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Copy an existing program</h2>
            <p className="modal-subtitle">Creates a draft copy for you to customise</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="copy-picker-list">
          {clientPrograms.map(p => {
            const client = p._clientId ? clients.find(c => c.id === p._clientId) : null
            const cfg = getServiceConfig(p.serviceType)
            const status = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.draft
            return (
              <button key={p.id} className="copy-picker-item" onClick={() => onSelect(p)}>
                <div className="cpi-left">
                  {client && (
                    <div className="prog-avatar prog-avatar--sm" style={{ background: client.avatarGrad }}>
                      {client.initials}
                    </div>
                  )}
                  <div>
                    <div className="cpi-name">{p.name}</div>
                    <div className="cpi-meta">
                      {client?.name ?? 'No client'} · {cfg.label} · {p.weeks.length} weeks
                    </div>
                  </div>
                </div>
                <span className={`prog-badge ${status.className}`}>{status.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── New program modal ─────────────────────────────────────────────────────────

function NewProgramModal({ onClose, onScratch, onTemplate, onCopy }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create a new program</h2>
            <p className="modal-subtitle">How would you like to start?</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="new-prog-options">
          <button className="new-prog-option" onClick={onScratch}>
            <div className="npo-icon" style={{ background: 'rgba(46,196,160,0.15)' }}>
              <FileText size={24} color="var(--teal)" />
            </div>
            <div className="npo-text">
              <div className="npo-title">Build from scratch</div>
              <div className="npo-desc">Start with a blank canvas and build your program day by day</div>
            </div>
            <ChevronRight size={16} className="npo-arrow" />
          </button>

          <button className="new-prog-option" onClick={onTemplate}>
            <div className="npo-icon" style={{ background: 'rgba(255,167,51,0.15)' }}>
              <LayoutTemplate size={24} color="var(--amber)" />
            </div>
            <div className="npo-text">
              <div className="npo-title">Start from a template</div>
              <div className="npo-desc">Use a saved template as a starting point and customise for your client</div>
            </div>
            <ChevronRight size={16} className="npo-arrow" />
          </button>

          <button className="new-prog-option" onClick={onCopy}>
            <div className="npo-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>
              <Layers size={24} color="#6C63FF" />
            </div>
            <div className="npo-text">
              <div className="npo-title">Copy from existing program</div>
              <div className="npo-desc">Duplicate a current client program and adapt it for someone new</div>
            </div>
            <ChevronRight size={16} className="npo-arrow" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Filter pills ──────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',       label: 'All Programs' },
  { id: 'active',    label: 'Active' },
  { id: 'draft',     label: 'Drafts' },
  { id: 'template',  label: 'Templates' },
  { id: 'completed', label: 'Completed' },
]

// ── Main Programs page ────────────────────────────────────────────────────────

export default function Programs() {
  const { trainer } = useAuth()
  const [programs,      setPrograms]      = useState([])
  const [clients,       setClients]       = useState([])
  const [clientLogs,    setClientLogs]    = useState({})
  const [view,          setView]          = useState('list')
  const [editingProgram, setEditingProgram] = useState(null)
  const [filter,        setFilter]        = useState('all')
  const [modal,         setModal]         = useState(null)

  useEffect(() => {
    if (!trainer?.id) return
    Promise.all([
      getPrograms(trainer.id),
      getClients(trainer.id),
      getClientProgramLogs(trainer.id),
    ]).then(([progs, cls, logs]) => {
      setPrograms(progs)
      setClients(cls)
      setClientLogs(logs)
    })
  }, [trainer?.id])

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = sortPrograms(programs.filter(p => {
    if (filter === 'all')       return true
    if (filter === 'active')    return p.status === 'active'
    if (filter === 'draft')     return p.status === 'draft'
    if (filter === 'template')  return p.isTemplate
    if (filter === 'completed') return p.status === 'completed'
    return true
  }))

  const countFor = f => {
    if (f === 'all')       return programs.length
    if (f === 'active')    return programs.filter(p => p.status === 'active').length
    if (f === 'draft')     return programs.filter(p => p.status === 'draft').length
    if (f === 'template')  return programs.filter(p => p.isTemplate).length
    if (f === 'completed') return programs.filter(p => p.status === 'completed').length
    return 0
  }

  const templates = programs.filter(p => p.isTemplate)

  // ── Actions ────────────────────────────────────────────────────────────────

  function openBuilder(program) {
    setEditingProgram(deepCloneProgram(program))
    setView('detail')
    setModal(null)
  }

  async function handleSave(updatedProgram) {
    try {
      const saved = await saveProgram(trainer.id, updatedProgram)
      setPrograms(prev => {
        const exists = prev.find(p => p.id === updatedProgram.id || p._dbId === updatedProgram._dbId)
        if (exists) return prev.map(p => (p.id === updatedProgram.id || p._dbId === updatedProgram._dbId) ? saved : p)
        return [...prev, saved]
      })
      setView('list')
      setEditingProgram(null)
    } catch (err) {
      console.error('Save program failed:', err)
    }
  }

  async function handleDuplicate(program) {
    const copy = deepCloneProgram(program)
    copy._dbId = null
    copy.name = program.name + ' (Copy)'
    copy.status = 'draft'
    copy.isTemplate = false
    copy.startDate = ''
    copy.clientId = null
    copy.weeks = copy.weeks.map(w => ({
      ...w, id: uid(),
      days: w.days.map(d => ({
        ...d, id: uid(),
        exercises: d.exercises.map(e => ({ ...e, id: uid() })),
      })),
    }))
    try {
      const saved = await saveProgram(trainer.id, copy)
      setPrograms(prev => [...prev, saved])
    } catch (err) {
      console.error('Duplicate program failed:', err)
    }
  }

  function handleNewScratch() {
    openBuilder(blankProgram())
  }

  function handlePickTemplate(tmpl) {
    const program = cloneFromTemplate(tmpl)
    program.name = tmpl.templateName
    openBuilder(program)
  }

  function handleCopyExisting(program) {
    const copy = deepCloneProgram(program)
    copy.id = uid()
    copy.clientId = null
    copy.name = program.name + ' (Copy)'
    copy.status = 'draft'
    copy.isTemplate = false
    copy.startDate = ''
    copy.weeks = copy.weeks.map(w => ({
      ...w, id: uid(),
      days: w.days.map(d => ({
        ...d, id: uid(),
        exercises: d.exercises.map(e => ({ ...e, id: uid() })),
      })),
    }))
    openBuilder(copy)
  }

  // ── Render detail ──────────────────────────────────────────────────────────

  if (view === 'detail') {
    return (
      <ProgramDetail
        program={editingProgram}
        clients={clients}
        exerciseLibrary={exerciseLibrary}
        clientLogs={clientLogs}
        onSave={handleSave}
        onBack={() => { setView('list'); setEditingProgram(null) }}
      />
    )
  }

  // ── Render list ────────────────────────────────────────────────────────────

  return (
    <div className="programs-page">
      <div className="programs-header">
        <div className="programs-title-group">
          <h1 className="programs-title">Programs</h1>
          <span className="programs-total-badge">{programs.length}</span>
        </div>
        <button className="btn-create-program" onClick={() => setModal('new')}>
          <Plus size={16} />
          Create New Program
        </button>
      </div>

      <div className="programs-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="filter-pill-count">{countFor(f.id)}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="programs-empty">
          <p>No programs match this filter.</p>
        </div>
      ) : (
        <div className="programs-grid">
          {filtered.map(p => (
            <ProgramCard
              key={p.id}
              program={p}
              clientCount={getClientCount(p)}
              onEdit={openBuilder}
              onDuplicate={handleDuplicate}
              onUseTemplate={handlePickTemplate}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {modal === 'new' && (
        <NewProgramModal
          onClose={() => setModal(null)}
          onScratch={handleNewScratch}
          onTemplate={() => setModal('template')}
          onCopy={() => setModal('copy')}
        />
      )}

      {modal === 'template' && (
        <TemplatePicker
          templates={templates}
          onSelect={handlePickTemplate}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'copy' && (
        <CopyExistingPicker
          programs={programs}
          clients={clients}
          onSelect={handleCopyExisting}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
