import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  MessageSquare,
  User,
  X,
  Users,
  Check,
  Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getActiveClients } from '../lib/db'
import SearchDropdown from '../components/SearchDropdown'
import './Schedule.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const CAL_START   = 7
const CAL_END     = 21
const PX_PER_HR   = 80
const PX_PER_MIN  = PX_PER_HR / 60
const CAL_HEIGHT  = (CAL_END - CAL_START) * PX_PER_HR

const SERVICE_COLORS = {
  personal_trainer:  { label: 'PT',      colorKey: 'coral'  },
  physiotherapist:   { label: 'Physio',  colorKey: 'teal'   },
  massage_therapist: { label: 'Massage', colorKey: 'amber'  },
}

const FILTERS = [
  { id: 'all',               label: 'All'    },
  { id: 'personal_trainer',  label: 'PT',      colorKey: 'coral'  },
  { id: 'physiotherapist',   label: 'Physio',  colorKey: 'teal'   },
  { id: 'massage_therapist', label: 'Massage', colorKey: 'amber'  },
]

// ─── Date helpers ─────────────────────────────────────────────────────────────
function getMondayOf(date) {
  const d = new Date(date)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

function formatMonthRange(start, end) {
  const fmt = d => d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
  const s = fmt(start), e = fmt(end)
  return s === e ? s : `${s} – ${e}`
}

function formatTime12(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}${period}` : `${h12}:${m.toString().padStart(2, '0')}${period}`
}

function minsFromTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function timeFromMins(totalMins) {
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function snapTo15(mins) {
  return Math.round(mins / 15) * 15
}

function cssClass(serviceType) {
  return serviceType.replaceAll('_', '-')
}

// ─── ServiceBadge ─────────────────────────────────────────────────────────────
function ServiceBadge({ serviceType }) {
  const cfg = SERVICE_COLORS[serviceType] ?? { label: 'Session', colorKey: 'teal' }
  return (
    <span className={`sched-service-badge sched-service-badge--${cfg.colorKey}`}>
      {cfg.label}
    </span>
  )
}

// ─── SessionDetailModal ───────────────────────────────────────────────────────
function SessionDetailModal({ session, clients, onClose, onViewProfile }) {
  const client = session.isGroupClass ? null : clients.find(c => c.id === session.clientId)
  const [editMode, setEditMode] = useState(false)
  const [editDate, setEditDate] = useState(session.date)
  const [editTime, setEditTime] = useState(session.startTime)

  let planInfo = null
  if (client?.currentPlan) {
    const sessDate  = new Date(session.date + 'T12:00:00')
    const planStart = new Date(client.currentPlan.startDate + 'T12:00:00')
    const planEnd   = new Date(client.currentPlan.endDate   + 'T12:00:00')
    const weekNum   = Math.max(1, Math.ceil((sessDate - planStart) / (7 * 24 * 60 * 60 * 1000)))
    const totalWeeks = Math.round((planEnd - planStart) / (7 * 24 * 60 * 60 * 1000))
    planInfo = { name: client.currentPlan.name, weekNum, totalWeeks }
  }

  const recentNote = client?.trainerSessions
    ?.filter(ts => ts.notes)
    ?.sort((a, b) => b.date.localeCompare(a.date))[0]?.notes ?? null

  const endMins  = minsFromTime(session.startTime) + session.durationMinutes
  const dayLabel = new Date(session.date + 'T12:00:00').toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'short',
  })

  function handleSaveTime() {
    document.dispatchEvent(new CustomEvent('mwm:reschedule', {
      detail: { id: session.id, date: editDate, startTime: editTime },
    }))
    setEditMode(false)
    onClose()
  }

  return (
    <div className="sched-modal-overlay" onClick={onClose}>
      <div className="sched-detail-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sched-detail-header">
          {session.isGroupClass ? (
            <div className="sched-detail-avatar sched-detail-avatar--group">
              <Users size={18} />
            </div>
          ) : (
            <div className="sched-detail-avatar" style={{ background: session.clientAvatarGrad }}>
              {session.clientInitials}
            </div>
          )}
          <div className="sched-detail-identity">
            <div className="sched-detail-name">
              {session.isGroupClass ? (
                session.groupClassName
              ) : (
                // ── Clickable client name (feature 2) ──
                <button
                  className="sched-detail-name-link"
                  onClick={() => { onViewProfile?.(session.clientId); onClose() }}
                >
                  {session.clientName}
                </button>
              )}
            </div>
            <ServiceBadge serviceType={session.serviceType} />
          </div>
          <button className="sched-modal-close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="sched-detail-sep" />

        {/* Info rows */}
        <div className="sched-detail-rows">
          <div className="sched-detail-row">
            <span className="sched-detail-label">When</span>
            <span className="sched-detail-value">
              {dayLabel}
              <span className="sched-detail-time">
                {formatTime12(session.startTime)}–{formatTime12(timeFromMins(endMins))}
                <span className="sched-detail-duration">{session.durationMinutes} min</span>
              </span>
            </span>
          </div>

          {session.sessionType && (
            <div className="sched-detail-row">
              <span className="sched-detail-label">Type</span>
              <span className="sched-detail-value">{session.sessionType}</span>
            </div>
          )}

          {planInfo && (
            <div className="sched-detail-row">
              <span className="sched-detail-label">Plan</span>
              <span className="sched-detail-value">
                {planInfo.name}
                <span className="sched-detail-week-pill">
                  Week {planInfo.weekNum} of {planInfo.totalWeeks}
                </span>
              </span>
            </div>
          )}

          {session.isGroupClass && session.attendees.length > 0 && (
            <div className="sched-detail-row">
              <span className="sched-detail-label">Attendees</span>
              <span className="sched-detail-value sched-detail-attendees">
                {session.attendees.join(' · ')}
              </span>
            </div>
          )}

          {recentNote && (
            <div className="sched-detail-row">
              <span className="sched-detail-label">Last note</span>
              <span className="sched-detail-value sched-detail-note">"{recentNote}"</span>
            </div>
          )}
        </div>

        {/* Inline time edit */}
        {editMode && (
          <>
            <div className="sched-detail-sep" />
            <div className="sched-detail-edit-form">
              <div className="sched-form-row-2">
                <div className="sched-form-row">
                  <label>Date</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                </div>
                <div className="sched-form-row">
                  <label>Start time</label>
                  <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} />
                </div>
              </div>
              <div className="sched-detail-edit-actions">
                <button className="sched-modal-btn sched-modal-btn--cancel" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
                <button className="sched-modal-btn sched-modal-btn--confirm" onClick={handleSaveTime}>
                  <Check size={13} /> Save
                </button>
              </div>
            </div>
          </>
        )}

        {!editMode && (
          <>
            <div className="sched-detail-sep" />
            <div className="sched-detail-actions">
              <button className="sched-detail-btn" onClick={() => setEditMode(true)}>
                <Clock size={13} /> Edit time
              </button>
              {!session.isGroupClass && (
                <>
                  <button className="sched-detail-btn">
                    <MessageSquare size={13} /> Message
                  </button>
                  <button
                    className="sched-detail-btn sched-detail-btn--primary"
                    onClick={() => { onViewProfile?.(session.clientId); onClose() }}
                  >
                    <User size={13} /> View profile
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── SessionBlock ─────────────────────────────────────────────────────────────
function SessionBlock({ session, isDragging, onDragStart, onDragEnd, onClick }) {
  const top    = (minsFromTime(session.startTime) - CAL_START * 60) * PX_PER_MIN
  const height = Math.max(22, session.durationMinutes * PX_PER_MIN)
  const compact = height < 48
  const dragged = useRef(false)

  return (
    <div
      draggable
      onDragStart={e => { dragged.current = true; onDragStart(e, session) }}
      onDragEnd={e => { onDragEnd(e); setTimeout(() => { dragged.current = false }, 50) }}
      onClick={() => { if (!dragged.current) onClick?.(session) }}
      className={[
        'sched-session-block',
        `sched-session-block--${cssClass(session.serviceType)}`,
        session.isGroupClass ? 'sched-session-block--group' : '',
        isDragging ? 'sched-session-block--dragging' : '',
      ].filter(Boolean).join(' ')}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      {session.isGroupClass ? (
        <div className={`sched-block-inner${compact ? ' compact' : ''}`}>
          <Users size={10} className="sched-block-group-icon" />
          <div className="sched-block-info">
            <div className="sched-block-name">{session.groupClassName}</div>
            {!compact && <div className="sched-block-sub">{session.attendees.length} attendees</div>}
          </div>
        </div>
      ) : (
        <div className={`sched-block-inner${compact ? ' compact' : ''}`}>
          <div className="sched-block-avatar" style={{ background: session.clientAvatarGrad }}>
            {session.clientInitials}
          </div>
          <div className="sched-block-info">
            <div className="sched-block-name">{session.clientName}</div>
            {!compact && <div className="sched-block-sub">{session.sessionType}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AgendaItem ───────────────────────────────────────────────────────────────
function AgendaItem({ session, onSelectClient, onClick }) {
  const endMins = minsFromTime(session.startTime) + session.durationMinutes

  return (
    // ── Whole item is clickable (feature 1) ──
    <div
      className={`sched-agenda-item sched-agenda-item--${cssClass(session.serviceType)}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="sched-agenda-time">
        <span className="sched-agenda-time-start">{formatTime12(session.startTime)}</span>
        <span className="sched-agenda-time-end">{formatTime12(timeFromMins(endMins))}</span>
      </div>

      <div className="sched-agenda-divider" />

      <div className="sched-agenda-content">
        {session.isGroupClass ? (
          <div className="sched-agenda-group-icon"><Users size={15} /></div>
        ) : (
          <div className="sched-agenda-avatar" style={{ background: session.clientAvatarGrad }}>
            {session.clientInitials}
          </div>
        )}

        <div className="sched-agenda-info">
          <div className="sched-agenda-name">
            {session.isGroupClass ? session.groupClassName : session.clientName}
          </div>
          <div className="sched-agenda-meta">
            <ServiceBadge serviceType={session.serviceType} />
            <span className="sched-agenda-duration">{session.durationMinutes}min</span>
            {session.isGroupClass && (
              <span className="sched-agenda-attendee-count">
                <Users size={10} /> {session.attendees.length}
              </span>
            )}
          </div>
        </div>

        {!session.isGroupClass && (
          <div className="sched-agenda-actions">
            <button
              className="sched-agenda-btn"
              title="Message"
              onClick={e => e.stopPropagation()}
            >
              <MessageSquare size={13} />
            </button>
            <button
              className="sched-agenda-btn"
              title="View profile"
              onClick={e => { e.stopPropagation(); onSelectClient?.(session.clientId) }}
            >
              <User size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
function ConfirmModal({ modal, onConfirm, onCancel }) {
  if (!modal) return null
  const { session, newDate, newTime } = modal
  const dayLabel = new Date(newDate + 'T12:00:00').toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const name = session.isGroupClass ? session.groupClassName : session.clientName

  return (
    <div className="sched-modal-overlay" onClick={onCancel}>
      <div className="sched-modal-card" onClick={e => e.stopPropagation()}>
        <h3 className="sched-modal-title">Reschedule session?</h3>
        <p className="sched-modal-body">
          Move <strong>{name}</strong> to{' '}
          <strong>{dayLabel}</strong> at{' '}
          <strong>{formatTime12(newTime)}</strong>?
        </p>
        <label className="sched-modal-notify">
          <input type="checkbox" defaultChecked />
          Notify client
        </label>
        <div className="sched-modal-actions">
          <button className="sched-modal-btn sched-modal-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="sched-modal-btn sched-modal-btn--confirm" onClick={onConfirm}>
            <Check size={13} /> Move session
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Schedule (main) ──────────────────────────────────────────────────────────
export default function Schedule({
  sessions,
  setSessions,
  onSelectClient,
  onOpenNewSession,
}) {
  const TODAY    = new Date('2026-04-02T10:00:00')
  const todayStr = toDateStr(TODAY)

  const { trainer } = useAuth()
  const [clients, setClients] = useState([])

  const [weekStart,     setWeekStart]     = useState(() => getMondayOf(TODAY))
  const [agendaOpen,    setAgendaOpen]    = useState(() => {
    try { return localStorage.getItem('mwm_agendaOpen') !== 'false' } catch { return true }
  })
  const [activeFilter,      setActiveFilter]      = useState('all')
  const [searchQuery,       setSearchQuery]       = useState('')
  const [selectedClientId,  setSelectedClientId]  = useState(null)
  const [draggedId,         setDraggedId]         = useState(null)
  const [dragOverDay,   setDragOverDay]   = useState(null)
  const [confirmModal,  setConfirmModal]  = useState(null)
  const [detailSession, setDetailSession] = useState(null)

  const calendarScrollRef = useRef(null)

  useEffect(() => {
    if (trainer?.id) getActiveClients(trainer.id).then(setClients)
  }, [trainer?.id])

  useEffect(() => {
    try { localStorage.setItem('mwm_agendaOpen', String(agendaOpen)) } catch {}
  }, [agendaOpen])

  useEffect(() => {
    if (calendarScrollRef.current) {
      calendarScrollRef.current.scrollTop = (8 - CAL_START) * PX_PER_HR
    }
  }, [])

  // Listen for inline time-edit saves from detail modal
  useEffect(() => {
    function handler(e) {
      const { id, date, startTime } = e.detail
      setSessions(prev =>
        prev.map(s => s.id === id ? { ...s, date, startTime } : s)
      )
    }
    document.addEventListener('mwm:reschedule', handler)
    return () => document.removeEventListener('mwm:reschedule', handler)
  }, [setSessions])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd  = weekDays[6]

  // ── Unique clients from sessions for the search dropdown ───────────────────
  const sessionClients = useMemo(() => {
    const seen = new Set()
    return sessions
      .filter(s => !s.isGroupClass && s.clientId && !seen.has(s.clientId) && seen.add(s.clientId))
      .map(s => ({ id: s.clientId, name: s.clientName, avatarGrad: s.clientAvatarGrad, initials: s.clientInitials }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [sessions])

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const filtered = sessions.filter(s => {
    if (activeFilter !== 'all' && s.serviceType !== activeFilter) return false
    // ── Search by client name (feature 3) ──
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const name = (s.isGroupClass ? s.groupClassName : s.clientName) ?? ''
      if (!name.toLowerCase().includes(q)) return false
    }
    return true
  })

  const todaySessions = filtered
    .filter(s => s.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  function sessionsForDay(dateStr) {
    return filtered.filter(s => s.date === dateStr)
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(e, session) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', session.id)
    setDraggedId(session.id)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverDay(null)
  }

  function handleDayDragOver(e, dateStr) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverDay !== dateStr) setDragOverDay(dateStr)
  }

  function handleDayDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverDay(null)
  }

  function handleDayDrop(e, dateStr) {
    e.preventDefault()
    const sessionId = e.dataTransfer.getData('text/plain')
    const session   = sessions.find(s => s.id === sessionId)
    if (!session) { setDragOverDay(null); return }

    const scrollEl  = calendarScrollRef.current
    const rect      = scrollEl.getBoundingClientRect()
    const relY      = e.clientY - rect.top + scrollEl.scrollTop
    const rawMins   = snapTo15(relY / PX_PER_MIN)
    const totalMins = CAL_START * 60 + rawMins
    const clamped   = Math.max(
      CAL_START * 60,
      Math.min(CAL_END * 60 - session.durationMinutes, totalMins)
    )
    const newTime = timeFromMins(clamped)

    setDragOverDay(null)
    setDraggedId(null)

    if (newTime !== session.startTime || dateStr !== session.date) {
      setConfirmModal({ session, newDate: dateStr, newTime })
    }
  }

  // ── Confirm reschedule ────────────────────────────────────────────────────
  function handleConfirm() {
    setSessions(prev =>
      prev.map(s =>
        s.id === confirmModal.session.id
          ? { ...s, date: confirmModal.newDate, startTime: confirmModal.newTime }
          : s
      )
    )
    setConfirmModal(null)
  }

  // ── Hour labels ───────────────────────────────────────────────────────────
  const hourLabels = []
  for (let h = CAL_START; h < CAL_END; h++) {
    hourLabels.push({ h, top: (h - CAL_START) * PX_PER_HR })
  }

  const nowMins = TODAY.getHours() * 60 + TODAY.getMinutes()
  const nowTop  = (nowMins - CAL_START * 60) * PX_PER_MIN

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="schedule-page">

      {/* ── Page header ── */}
      <div className="schedule-header">
        <div className="schedule-header-left">
          <button
            className="sched-agenda-toggle"
            onClick={() => setAgendaOpen(o => !o)}
            title={agendaOpen ? 'Hide agenda' : 'Show agenda'}
          >
            {agendaOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
          <h1 className="schedule-title">Schedule</h1>
          <div className="sched-filter-pills">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={[
                  'sched-filter-pill',
                  activeFilter === f.id ? 'active' : '',
                  f.colorKey ? `sched-filter-pill--${f.colorKey}` : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="schedule-header-right">
          <SearchDropdown
            items={sessionClients}
            selectedId={selectedClientId}
            onSelect={id => {
              const client = sessionClients.find(c => c.id === id)
              setSelectedClientId(id)
              setSearchQuery(client?.name ?? '')
            }}
            onClear={() => { setSelectedClientId(null); setSearchQuery('') }}
            placeholder="Search client…"
            searchPlaceholder="Search clients…"
            align="right"
          />

          <div className="sched-week-nav">
            <button className="sched-week-btn" onClick={() => setWeekStart(d => addDays(d, -7))}>
              <ChevronLeft size={16} />
            </button>
            <span className="sched-week-label">{formatMonthRange(weekStart, weekEnd)}</span>
            <button className="sched-week-btn" onClick={() => setWeekStart(d => addDays(d, 7))}>
              <ChevronRight size={16} />
            </button>
          </div>

          <button className="sched-new-btn" onClick={onOpenNewSession}>
            <Plus size={15} /> New session
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="schedule-body">

        {/* Agenda panel */}
        {agendaOpen && (
          <div className="sched-agenda-panel">
            <div className="sched-agenda-header">
              <span className="sched-agenda-title">Today</span>
              <span className="sched-agenda-date">
                {TODAY.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="sched-agenda-list">
              {todaySessions.length === 0 ? (
                <p className="sched-agenda-empty">
                  {searchQuery ? 'No matches today' : 'No sessions today'}
                </p>
              ) : (
                todaySessions.map(s => (
                  <AgendaItem
                    key={s.id}
                    session={s}
                    onSelectClient={onSelectClient}
                    onClick={() => setDetailSession(s)}   // ── feature 1
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="sched-calendar-wrapper">
          {/* Sticky day-header row */}
          <div className="sched-day-headers">
            <div className="sched-time-gutter" />
            {weekDays.map(day => {
              const dateStr = toDateStr(day)
              const isToday = dateStr === todayStr
              return (
                <div
                  key={dateStr}
                  className={`sched-day-header${isToday ? ' sched-day-header--today' : ''}`}
                >
                  <span className="sched-day-name">
                    {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                  </span>
                  {isToday ? (
                    <span className="sched-day-num sched-day-num--today">{day.getDate()}</span>
                  ) : (
                    <span className="sched-day-num">{day.getDate()}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Scrollable grid */}
          <div className="sched-cal-scroll" ref={calendarScrollRef}>
            <div className="sched-cal-grid" style={{ height: `${CAL_HEIGHT}px` }}>

              {/* Time column */}
              <div className="sched-time-col">
                {hourLabels.map(({ h, top }) => (
                  <div key={h} className="sched-time-label" style={{ top: `${top}px` }}>
                    {formatTime12(`${String(h).padStart(2, '0')}:00`)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map(day => {
                const dateStr    = toDateStr(day)
                const isToday    = dateStr === todayStr
                const isDragOver = dragOverDay === dateStr
                const daySessions = sessionsForDay(dateStr)

                return (
                  <div
                    key={dateStr}
                    className={[
                      'sched-day-col',
                      isToday    ? 'sched-day-col--today'     : '',
                      isDragOver ? 'sched-day-col--drag-over' : '',
                    ].filter(Boolean).join(' ')}
                    onDragOver={e => handleDayDragOver(e, dateStr)}
                    onDragLeave={handleDayDragLeave}
                    onDrop={e => handleDayDrop(e, dateStr)}
                  >
                    {hourLabels.map(({ h, top }) => (
                      <div key={h}       className="sched-hour-line"  style={{ top: `${top}px` }} />
                    ))}
                    {hourLabels.map(({ h, top }) => (
                      <div key={`h${h}`} className="sched-half-line"  style={{ top: `${top + PX_PER_HR / 2}px` }} />
                    ))}

                    {isToday && nowTop >= 0 && nowTop <= CAL_HEIGHT && (
                      <div className="sched-now-line" style={{ top: `${nowTop}px` }} />
                    )}

                    {daySessions.map(s => (
                      <SessionBlock
                        key={s.id}
                        session={s}
                        isDragging={draggedId === s.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={setDetailSession}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Session detail popup ── */}
      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          clients={clients}
          onClose={() => setDetailSession(null)}
          onViewProfile={id => { onSelectClient?.(id); setDetailSession(null) }}
        />
      )}

      {/* ── Reschedule confirm ── */}
      <ConfirmModal
        modal={confirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  )
}
