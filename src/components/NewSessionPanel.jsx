import { useState, useEffect, useRef } from 'react'
import { X, Plus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getActiveClients } from '../lib/db'
import SearchDropdown from './SearchDropdown'
import './NewSessionPanel.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAL_START   = 7
const CAL_END     = 21
const PX_PER_HR   = 56
const PX_PER_MIN  = PX_PER_HR / 60
const CAL_HEIGHT  = (CAL_END - CAL_START) * PX_PER_HR

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

function minsFromTime(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function formatTime12(t) {
  const [h, m] = t.split(':').map(Number)
  const period = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 || 12
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, '0')}${period}`
}

function formatMonthRange(start, end) {
  const fmt = d => d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
  const s = fmt(start), e = fmt(end)
  return s === e ? s : `${s} – ${e}`
}

// ─── NewSessionPanel ──────────────────────────────────────────────────────────

export default function NewSessionPanel({ sessions, setSessions, sessionTypes, onClose }) {
  const TODAY    = new Date('2026-04-02T10:00:00')
  const todayStr = toDateStr(TODAY)

  const { trainer }    = useAuth()
  const [activeClients, setActiveClients] = useState([])
  const calScrollRef   = useRef(null)

  useEffect(() => {
    if (!trainer?.id) return
    getActiveClients(trainer.id).then(setActiveClients).catch(() => {})
  }, [trainer?.id])

  const [weekStart, setWeekStart] = useState(() => getMondayOf(TODAY))
  const [form, setForm] = useState({
    isGroupClass:   false,
    clientId:       '',
    sessionType:    sessionTypes[0]?.label ?? '',
    groupClassName: '',
    date:           todayStr,
    startTime:      '09:00',
    durationMinutes:'60',
  })

  // Sync mini-cal week to selected date
  useEffect(() => {
    if (form.date) setWeekStart(getMondayOf(new Date(form.date + 'T12:00:00')))
  }, [form.date])

  // Scroll to 8 am on mount
  useEffect(() => {
    if (calScrollRef.current) {
      calScrollRef.current.scrollTop = (8 - CAL_START) * PX_PER_HR
    }
  }, [])

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  // ── Conflict detection ────────────────────────────────────────────────────

  const conflict = (() => {
    if (!form.date || !form.startTime || !form.durationMinutes) return null
    const newStart = minsFromTime(form.startTime)
    const newEnd   = newStart + parseInt(form.durationMinutes, 10)
    return sessions.find(s => {
      if (s.date !== form.date) return false
      const sStart = minsFromTime(s.startTime)
      const sEnd   = sStart + s.durationMinutes
      return newStart < sEnd && newEnd > sStart
    }) ?? null
  })()

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit(e) {
    e.preventDefault()
    const clientData = activeClients.find(c => c.id === form.clientId)
    setSessions(prev => [
      ...prev,
      {
        id:               `ss-${Date.now()}`,
        clientId:         form.isGroupClass ? null : form.clientId,
        clientName:       form.isGroupClass ? null : (clientData?.name ?? ''),
        clientInitials:   form.isGroupClass ? null : (clientData?.initials ?? ''),
        clientAvatarGrad: form.isGroupClass ? null : (clientData?.avatarGrad ?? ''),
        serviceType:      form.isGroupClass
                            ? 'personal_trainer'
                            : (clientData?.serviceType ?? 'personal_trainer'),
        sessionType:      form.sessionType || (form.isGroupClass ? 'Group Class' : 'Session'),
        date:             form.date,
        startTime:        form.startTime,
        durationMinutes:  parseInt(form.durationMinutes, 10),
        isGroupClass:     form.isGroupClass,
        groupClassName:   form.isGroupClass ? form.groupClassName : null,
        attendees:        [],
      },
    ])
    onClose()
  }

  // ── Calendar helpers ──────────────────────────────────────────────────────

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd  = weekDays[6]

  const hourLabels = []
  for (let h = CAL_START; h < CAL_END; h++) {
    hourLabels.push({ h, top: (h - CAL_START) * PX_PER_HR })
  }

  const selTop    = form.startTime
    ? (minsFromTime(form.startTime) - CAL_START * 60) * PX_PER_MIN
    : null
  const selHeight = form.durationMinutes
    ? Math.max(10, parseInt(form.durationMinutes, 10) * PX_PER_MIN)
    : null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="nsess-overlay" onClick={onClose}>
      <div className="nsess-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="nsess-header">
          <h3 className="nsess-title">New Session</h3>
          <button className="nsess-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="nsess-body">

          {/* ── Left: Form ── */}
          <form className="nsess-form-col" onSubmit={handleSubmit}>

            <label className="nsess-toggle">
              <input
                type="checkbox"
                checked={form.isGroupClass}
                onChange={e => set('isGroupClass', e.target.checked)}
              />
              <span>Group class</span>
            </label>

            {form.isGroupClass ? (
              <div className="nsess-field">
                <label>Class name</label>
                <input
                  type="text"
                  value={form.groupClassName}
                  onChange={e => set('groupClassName', e.target.value)}
                  placeholder="e.g. Morning Boot Camp"
                  required
                />
              </div>
            ) : (
              <div className="nsess-field">
                <label>Client</label>
                <SearchDropdown
                  items={activeClients.map(c => ({ id: c.id, name: c.name, avatarGrad: c.avatarGrad, initials: c.initials }))}
                  selectedId={form.clientId || null}
                  onSelect={id => set('clientId', id)}
                  onClear={() => set('clientId', '')}
                  placeholder="Select a client…"
                  searchPlaceholder="Search clients…"
                />
              </div>
            )}

            <div className="nsess-field">
              <label>Session type</label>
              <SearchDropdown
                items={sessionTypes.map(st => ({ id: st.label, name: st.label, color: st.color }))}
                selectedId={form.sessionType || null}
                onSelect={val => set('sessionType', val)}
                onClear={() => set('sessionType', '')}
                placeholder="Select a type…"
                searchPlaceholder="Search types…"
              />
            </div>

            <div className="nsess-row2">
              <div className="nsess-field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  required
                />
              </div>
              <div className="nsess-field">
                <label>Start time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => set('startTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="nsess-field">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="15"
                max="240"
                step="15"
                value={form.durationMinutes}
                onChange={e => set('durationMinutes', e.target.value)}
                required
              />
            </div>

            {conflict && (
              <div className="nsess-conflict">
                <AlertTriangle size={13} />
                <span>
                  You already have{' '}
                  <strong>
                    {conflict.isGroupClass ? conflict.groupClassName : conflict.clientName}
                  </strong>{' '}
                  at this time.
                </span>
              </div>
            )}

            <div className="nsess-actions">
              <button type="button" className="nsess-btn nsess-btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="nsess-btn nsess-btn--confirm">
                <Plus size={13} /> Add session
              </button>
            </div>

          </form>

          {/* ── Right: Mini calendar ── */}
          <div className="nsess-cal-col">

            {/* Week nav */}
            <div className="nsess-cal-nav-row">
              <button
                type="button"
                className="nsess-cal-nav"
                onClick={() => setWeekStart(d => addDays(d, -7))}
              >
                <ChevronLeft size={13} />
              </button>
              <span className="nsess-cal-range">
                {formatMonthRange(weekStart, weekEnd)}
              </span>
              <button
                type="button"
                className="nsess-cal-nav"
                onClick={() => setWeekStart(d => addDays(d, 7))}
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Day headers */}
            <div className="nsess-cal-days">
              <div className="nsess-cal-gutter" />
              {weekDays.map(day => {
                const ds         = toDateStr(day)
                const isSelected = ds === form.date
                const isToday    = ds === todayStr
                return (
                  <div
                    key={ds}
                    className={[
                      'nsess-cal-dh',
                      isSelected ? 'nsess-cal-dh--selected' : '',
                      isToday   ? 'nsess-cal-dh--today'    : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => set('date', ds)}
                  >
                    <span className="nsess-cal-dayname">
                      {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                    </span>
                    <span className={[
                      'nsess-cal-daynum',
                      isSelected ? 'nsess-cal-daynum--sel'   : '',
                      isToday    ? 'nsess-cal-daynum--today'  : '',
                    ].filter(Boolean).join(' ')}>
                      {day.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Scrollable grid */}
            <div className="nsess-cal-scroll" ref={calScrollRef}>
              <div className="nsess-cal-grid" style={{ height: `${CAL_HEIGHT}px` }}>

                {/* Time col */}
                <div className="nsess-time-col">
                  {hourLabels.map(({ h, top }) => (
                    <div key={h} className="nsess-time-label" style={{ top: `${top}px` }}>
                      {formatTime12(`${String(h).padStart(2, '0')}:00`)}
                    </div>
                  ))}
                </div>

                {/* Day cols */}
                {weekDays.map(day => {
                  const ds         = toDateStr(day)
                  const isSelected = ds === form.date
                  const daySessions = sessions.filter(s => s.date === ds)

                  return (
                    <div
                      key={ds}
                      className={`nsess-day-col${isSelected ? ' nsess-day-col--selected' : ''}`}
                      onClick={() => set('date', ds)}
                    >
                      {hourLabels.map(({ h, top }) => (
                        <div key={h} className="nsess-hour-line" style={{ top: `${top}px` }} />
                      ))}

                      {/* Existing sessions */}
                      {daySessions.map(s => {
                        const top    = (minsFromTime(s.startTime) - CAL_START * 60) * PX_PER_MIN
                        const height = Math.max(8, s.durationMinutes * PX_PER_MIN)
                        const cls    = s.serviceType === 'physiotherapist' ? 'teal'
                                     : s.serviceType === 'massage_therapist' ? 'amber' : 'coral'
                        return (
                          <div
                            key={s.id}
                            className={`nsess-sess-block nsess-sess-block--${cls}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={s.isGroupClass ? s.groupClassName : s.clientName}
                          />
                        )
                      })}

                      {/* Selected time ghost */}
                      {isSelected && selTop !== null && selHeight !== null && (
                        <div
                          className="nsess-sel-block"
                          style={{ top: `${selTop}px`, height: `${selHeight}px` }}
                        />
                      )}
                    </div>
                  )
                })}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
