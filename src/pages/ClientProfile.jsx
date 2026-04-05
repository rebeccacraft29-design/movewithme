import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ArrowLeft, TrendingUp, Flame, Plus, Send,
  CheckCircle2, Clock, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts'
import { getClientById, getServiceConfig } from '../data/mockData'
import { getClientExtras, getSessionExtras } from '../data/clientExtras'
import { getProgressData, WEEK_LABELS } from '../data/progressData'
import './ClientProfile.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
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

function getThisWeekCompletion(client) {
  const monday = getMondayOfWeek(new Date())
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  const sessions = [...client.trainerSessions, ...client.independentSessions].filter(s => {
    const d = new Date(s.date)
    return d >= monday && d <= endOfToday
  })
  if (sessions.length === 0) return null
  return Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100)
}

function getAllTimeAvg(client) {
  const all = [...client.trainerSessions, ...client.independentSessions]
  if (all.length === 0) return null
  return Math.round((all.filter(s => s.completed).length / all.length) * 100)
}

function getStreak(client) {
  const completed = [...client.trainerSessions, ...client.independentSessions]
    .filter(s => s.completed)
    .map(s => { const d = new Date(s.date); d.setHours(0, 0, 0, 0); return d })
  if (completed.length === 0) return 0

  const thisWeekMon = getMondayOfWeek(new Date())
  const thisWeekSun = new Date(thisWeekMon)
  thisWeekSun.setDate(thisWeekMon.getDate() + 6)
  thisWeekSun.setHours(23, 59, 59, 999)
  const hasThisWeek = completed.some(d => d >= thisWeekMon && d <= thisWeekSun)

  let weekMon = new Date(thisWeekMon)
  if (!hasThisWeek) weekMon.setDate(weekMon.getDate() - 7)

  let streak = 0
  for (let i = 0; i < 52; i++) {
    const weekSun = new Date(weekMon)
    weekSun.setDate(weekMon.getDate() + 6)
    weekSun.setHours(23, 59, 59, 999)
    if (!completed.some(d => d >= weekMon && d <= weekSun)) break
    streak++
    weekMon.setDate(weekMon.getDate() - 7)
  }
  return streak
}

function getWeekInPlan(startDate) {
  const diffDays = Math.floor((new Date() - new Date(startDate)) / 86400000)
  return Math.max(1, Math.ceil(diffDays / 7))
}

function getTotalPlanWeeks(startDate, endDate) {
  return Math.ceil((new Date(endDate) - new Date(startDate)) / (86400000 * 7))
}

function getPlanSessions(client) {
  if (!client.currentPlan) return null
  const start = new Date(client.currentPlan.startDate)
  const end   = new Date(client.currentPlan.endDate)
  const planSessions = client.trainerSessions.filter(s => {
    const d = new Date(s.date)
    return d >= start && d <= end
  })
  return {
    done:  planSessions.filter(s => s.completed).length,
    total: planSessions.length,
  }
}

function formatSessionDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((d - today) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === -1) return 'Yesterday'
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function formatTimestamp(ts) {
  const d = new Date(ts)
  const today     = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const msgDay    = new Date(d);    msgDay.setHours(0, 0, 0, 0)
  const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (msgDay.getTime() === today.getTime())     return `Today ${time}`
  if (msgDay.getTime() === yesterday.getTime()) return `Yesterday ${time}`
  return `${d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} ${time}`
}

const SESSION_LABELS = {
  strength:       'Strength Training',
  hiit:           'HIIT',
  cardio:         'Cardio',
  rehabilitation: 'Rehabilitation',
  massage:        'Massage Session',
  mobility:       'Mobility Work',
}

const RATING_EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '💪' }
const DAYS         = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SERVICE_BADGE = {
  personal_trainer:  { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  physiotherapist:   { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
  massage_therapist: { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  chiropractor:      { bg: 'rgba(108,99,255,0.12)',  color: '#6C63FF' },
  other:             { bg: 'rgba(144,144,176,0.12)', color: '#9090B0' },
}

// ── Schedule tab constants ─────────────────────────────────────────────────────
const PROF_CAL_START  = 7
const PROF_CAL_END    = 21
const PROF_PX_PER_HR  = 64
const PROF_PX_PER_MIN = PROF_PX_PER_HR / 60
const PROF_CAL_HEIGHT = (PROF_CAL_END - PROF_CAL_START) * PROF_PX_PER_HR

// ── ScheduleTab (feature 4) ───────────────────────────────────────────────────
function ScheduleTab({ client, sessions }) {
  const TODAY    = new Date('2026-04-02T10:00:00')
  const todayStr = toDateStr(TODAY)

  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(TODAY))
  const calScrollRef = useRef(null)

  useEffect(() => {
    if (calScrollRef.current) {
      calScrollRef.current.scrollTop = (8 - PROF_CAL_START) * PROF_PX_PER_HR
    }
  }, [])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd  = weekDays[6]

  // Trainer-scheduled sessions for this client (from global sessions state)
  const trainerSessions = sessions.filter(s => s.clientId === client.id)

  // Independent sessions keyed by date (no startTime — shown as day markers)
  const indepByDay = {}
  client.independentSessions.forEach(s => {
    if (!indepByDay[s.date]) indepByDay[s.date] = []
    indepByDay[s.date].push(s)
  })

  const hourLabels = []
  for (let h = PROF_CAL_START; h < PROF_CAL_END; h++) {
    hourLabels.push({ h, top: (h - PROF_CAL_START) * PROF_PX_PER_HR })
  }

  function formatRange(start, end) {
    const fmt = d => d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    const s = fmt(start), e = fmt(end)
    return s === e ? s : `${s} – ${e}`
  }

  return (
    <div className="prf-sched-tab">
      {/* Week navigation */}
      <div className="prf-sched-nav">
        <button className="prf-sched-nav-btn" onClick={() => setWeekStart(d => addDays(d, -7))}>
          <ChevronLeft size={14} />
        </button>
        <span className="prf-sched-nav-label">{formatRange(weekStart, weekEnd)}</span>
        <button className="prf-sched-nav-btn" onClick={() => setWeekStart(d => addDays(d, 7))}>
          <ChevronRight size={14} />
        </button>

        {/* Legend */}
        <div className="prf-sched-legend">
          <span className="prf-sched-legend-item">
            <span className="prf-sched-legend-dot prf-sched-legend-dot--coral" />
            With trainer
          </span>
          <span className="prf-sched-legend-item">
            <span className="prf-sched-legend-dot prf-sched-legend-dot--teal" />
            Independent
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="prf-sched-cal-wrap">
        {/* Sticky day headers */}
        <div className="prf-sched-day-headers">
          <div className="prf-sched-gutter" />
          {weekDays.map(day => {
            const ds       = toDateStr(day)
            const isToday  = ds === todayStr
            const indeps   = indepByDay[ds] ?? []
            return (
              <div key={ds} className={`prf-sched-dh${isToday ? ' prf-sched-dh--today' : ''}`}>
                <span className="prf-sched-dayname">
                  {day.toLocaleDateString('en-AU', { weekday: 'short' })}
                </span>
                <span className={`prf-sched-daynum${isToday ? ' prf-sched-daynum--today' : ''}`}>
                  {day.getDate()}
                </span>
                {/* Teal dots for independent sessions (no scheduled time) */}
                {indeps.length > 0 && (
                  <div className="prf-sched-indep-row">
                    {indeps.map(s => (
                      <div
                        key={s.id}
                        className="prf-sched-indep-chip"
                        title={`${SESSION_LABELS[s.type] ?? s.type} · ${s.durationMinutes}min`}
                      >
                        {SESSION_LABELS[s.type] ?? s.type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Scrollable grid */}
        <div className="prf-sched-scroll" ref={calScrollRef}>
          <div className="prf-sched-grid" style={{ height: `${PROF_CAL_HEIGHT}px` }}>

            {/* Time column */}
            <div className="prf-sched-time-col">
              {hourLabels.map(({ h, top }) => (
                <div key={h} className="prf-sched-time-label" style={{ top: `${top}px` }}>
                  {formatTime12(`${String(h).padStart(2, '0')}:00`)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const ds      = toDateStr(day)
              const isToday = ds === todayStr
              const daySessions = trainerSessions.filter(s => s.date === ds)

              return (
                <div
                  key={ds}
                  className={`prf-sched-day-col${isToday ? ' prf-sched-day-col--today' : ''}`}
                >
                  {hourLabels.map(({ h, top }) => (
                    <div key={h} className="prf-sched-hour-line" style={{ top: `${top}px` }} />
                  ))}

                  {/* Coral blocks — trainer sessions */}
                  {daySessions.map(s => {
                    const top    = (minsFromTime(s.startTime) - PROF_CAL_START * 60) * PROF_PX_PER_MIN
                    const height = Math.max(24, s.durationMinutes * PROF_PX_PER_MIN)
                    const compact = height < 44
                    return (
                      <div
                        key={s.id}
                        className="prf-sched-sess-block prf-sched-sess-block--coral"
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="prf-sched-sess-name">{s.sessionType || 'Session'}</div>
                        {!compact && (
                          <div className="prf-sched-sess-time">{formatTime12(s.startTime)}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, accent }) {
  return (
    <div className={`prf-stat-chip${accent ? ` prf-stat-chip--${accent}` : ''}`}>
      <span className="prf-stat-value">{value}</span>
      <span className="prf-stat-label">{label}</span>
    </div>
  )
}

// ── Current plan card ─────────────────────────────────────────────────────────
function PlanCard({ client, svcConfig }) {
  const plan = client.currentPlan
  if (!plan) return (
    <div className="prf-card">
      <div className="prf-card-header">
        <h2 className="prf-card-title">Current {svcConfig.programNoun}</h2>
      </div>
      <p className="prf-empty">No active {svcConfig.programNoun.toLowerCase()}.</p>
    </div>
  )

  const weekNum    = getWeekInPlan(plan.startDate)
  const totalWeeks = getTotalPlanWeeks(plan.startDate, plan.endDate)
  const sessions   = getPlanSessions(client)

  return (
    <div className="prf-card">
      <div className="prf-card-header">
        <h2 className="prf-card-title">Current {svcConfig.programNoun}</h2>
        <span className="prf-week-badge">Week {weekNum} of {totalWeeks}</span>
      </div>
      <p className="prf-plan-name">{plan.name}</p>
      <div className="prf-progress-row">
        <div className="prf-progress-track">
          <div className="prf-progress-fill" style={{ width: `${plan.progress}%` }} />
        </div>
        <span className="prf-progress-pct">{plan.progress}%</span>
      </div>
      <div className="prf-plan-meta">
        {sessions && (
          <div className="prf-plan-meta-item">
            <CheckCircle2 size={13} className="prf-meta-icon prf-meta-icon--done" />
            <span>{sessions.done} of {sessions.total} {svcConfig.sessionNoun.toLowerCase()}s done</span>
          </div>
        )}
        <div className="prf-plan-meta-item">
          <Calendar size={13} className="prf-meta-icon" />
          <span className={plan.daysLeft <= 7 ? 'prf-urgent' : ''}>{plan.daysLeft}d left</span>
        </div>
      </div>
    </div>
  )
}

// ── Recent sessions ───────────────────────────────────────────────────────────
function SessionsSection({ client, svcConfig }) {
  const all = [
    ...client.trainerSessions.map(s => ({ ...s, isTrainer: true })),
    ...client.independentSessions.map(s => ({ ...s, isTrainer: false })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div className="prf-card">
      <div className="prf-card-header">
        <h2 className="prf-card-title">Recent {svcConfig.sessionNoun}s</h2>
      </div>
      <div className="prf-sessions">
        {all.map(s => {
          const extras = getSessionExtras(s.id)
          return (
            <div key={s.id} className={`prf-session${!s.completed ? ' prf-session--missed' : ''}`}>
              <div className="prf-session-left">
                <div className={`prf-session-dot${s.completed ? ' prf-session-dot--done' : ' prf-session-dot--missed'}`} />
                <div className="prf-session-info">
                  <div className="prf-session-name-row">
                    <span className="prf-session-name">{SESSION_LABELS[s.type] ?? s.type}</span>
                    {!s.isTrainer && (
                      <span className="prf-session-tag prf-session-tag--independent">
                        {svcConfig.independentSessionNoun}
                      </span>
                    )}
                    {!s.completed && (
                      <span className="prf-session-tag prf-session-tag--missed">Missed</span>
                    )}
                  </div>
                  {s.notes ? <p className="prf-session-notes">{s.notes}</p> : null}
                </div>
              </div>
              <div className="prf-session-right">
                <span className="prf-session-date">{formatSessionDate(s.date)}</span>
                <div className="prf-session-badges">
                  {extras.heavierThanPrescribed && client.serviceType === 'personal_trainer' && (
                    <span className="prf-badge prf-badge--heavier" title="Heavier than prescribed">↑ Heavier</span>
                  )}
                  {extras.rating && (
                    <span className="prf-badge prf-badge--rating" title={`${extras.rating}/5`}>
                      {RATING_EMOJI[extras.rating]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Habit tracker ─────────────────────────────────────────────────────────────
function HabitTracker({ weeklyHabits }) {
  const dow        = new Date().getDay()
  const todayIndex = dow === 0 ? 6 : dow - 1

  return (
    <div className="prf-card">
      <div className="prf-card-header">
        <h2 className="prf-card-title">This Week's Habits</h2>
      </div>
      {weeklyHabits.length === 0 ? (
        <p className="prf-empty">No habits tracked this week.</p>
      ) : (
        <div className="prf-habit-grid">
          <div className="prf-habit-day-row">
            <div className="prf-habit-name-col" />
            {DAYS.map((day, i) => (
              <span key={day} className={`prf-habit-day${i === todayIndex ? ' prf-habit-day--today' : ''}`}>
                {day}
              </span>
            ))}
          </div>
          {weeklyHabits.map((habit, hi) => (
            <div key={hi} className="prf-habit-row">
              <span className="prf-habit-name">{habit.name}</span>
              {habit.days.map((done, di) => (
                <div
                  key={di}
                  title={`${DAYS[di]}: ${done === true ? 'Completed' : done === false ? 'Missed' : 'Upcoming'}`}
                  className={[
                    'prf-habit-dot',
                    done === true  ? 'prf-habit-dot--done'   : '',
                    done === false ? 'prf-habit-dot--missed' : '',
                    done === null  ? 'prf-habit-dot--future' : '',
                    di === todayIndex ? 'prf-habit-dot--today' : '',
                  ].filter(Boolean).join(' ')}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Notes ─────────────────────────────────────────────────────────────────────
function NotesSection({ notes }) {
  return (
    <div className="prf-card">
      <div className="prf-card-header">
        <h2 className="prf-card-title">Notes</h2>
        <button className="prf-add-note-btn"><Plus size={12} /> Add Note</button>
      </div>
      {notes.length === 0 ? (
        <p className="prf-empty">No notes yet.</p>
      ) : (
        <div className="prf-notes">
          {notes.map(note => (
            <div key={note.id} className={`prf-note prf-note--${note.type}`}>
              {note.type === 'auto' ? (
                <span className="prf-note-tag prf-note-tag--auto">
                  <TrendingUp size={9} /> Auto-detected
                </span>
              ) : (
                <span className="prf-note-tag prf-note-tag--manual">
                  {new Date(note.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              )}
              <p className="prf-note-content">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Messages ──────────────────────────────────────────────────────────────────
function MessageThread({ messages }) {
  const [reply, setReply] = useState('')
  const recent = messages.slice(-3)

  return (
    <div className="prf-card prf-card--messages">
      <div className="prf-card-header">
        <h2 className="prf-card-title">Messages</h2>
      </div>
      {recent.length === 0 ? (
        <p className="prf-empty">No messages yet.</p>
      ) : (
        <div className="prf-messages">
          {recent.map(msg => (
            <div key={msg.id} className={`prf-bubble prf-bubble--${msg.from}`}>
              <p className="prf-bubble-text">{msg.text}</p>
              <span className="prf-bubble-time">{formatTimestamp(msg.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="prf-reply-row">
        <input
          className="prf-reply-input"
          type="text"
          placeholder="Reply…"
          value={reply}
          onChange={e => setReply(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) setReply('') }}
        />
        <button
          className="prf-reply-send"
          disabled={!reply.trim()}
          onClick={() => setReply('')}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Progress tab ──────────────────────────────────────────────────────────────

const PROG_RANGES = [
  { id: '4w',  label: 'Last 4 weeks',  weeks: 4  },
  { id: '8w',  label: 'Last 8 weeks',  weeks: 8  },
  { id: '3m',  label: 'Last 3 months', weeks: 13 },
  { id: 'all', label: 'All time',      weeks: 16 },
]

const CORAL = '#FF6B5B'
const AMBER = '#FFA733'
const TEAL  = '#2EC4A0'
const NAVY  = '#2E2E4A'
const GRID  = 'rgba(255,255,255,0.05)'

function barColor(rate) {
  if (rate >= 75) return TEAL
  if (rate >= 50) return AMBER
  return CORAL
}

function goalProgressPct(goal) {
  const start = goal.progressHistory[0]?.value ?? goal.currentValue
  if (goal.lowerIsBetter) {
    const total = start - goal.targetValue
    const done  = start - goal.currentValue
    return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
  }
  const total = goal.targetValue - start
  const done  = goal.currentValue - start
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)))
}

function goalAccent(goal) {
  if (goal.category === 'strength')       return TEAL
  if (goal.category === 'cardio')         return AMBER
  if (goal.category === 'rehabilitation') return CORAL
  if (goal.lowerIsBetter)                 return CORAL
  return TEAL
}

function makeDot(color, pbIdx, lowerIsBetter, allValues) {
  const pb = lowerIsBetter ? Math.min(...allValues) : Math.max(...allValues)
  return function Dot(props) {
    const { cx, cy, index, payload, dataKey } = props
    const val = payload[dataKey]
    if (val == null) return null
    const isPB = val === pb && index === pbIdx
    if (isPB) {
      return (
        <g key={`pb-${dataKey}-${index}`}>
          <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.15} />
          <circle cx={cx} cy={cy} r={5}  fill={color} />
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
            fontSize={11} fill="#fff" fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>★</text>
        </g>
      )
    }
    return <circle key={`dot-${dataKey}-${index}`} cx={cx} cy={cy} r={3} fill={color} />
  }
}

function StrengthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="prog-tooltip">
      <p className="prog-tooltip-label">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} className="prog-tooltip-row" style={{ color: entry.color }}>
          <span className="prog-tooltip-name">{entry.name.split(' (')[0]}</span>
          <span className="prog-tooltip-val">{entry.value} {entry.name.match(/\((.+)\)/)?.[1]}</span>
        </p>
      ))}
    </div>
  )
}

function CompletionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const rate = payload[0]?.value
  return (
    <div className="prog-tooltip">
      <p className="prog-tooltip-label">{label}</p>
      <p className="prog-tooltip-row" style={{ color: barColor(rate) }}>
        <span className="prog-tooltip-name">Completion</span>
        <span className="prog-tooltip-val">{rate}%</span>
      </p>
    </div>
  )
}

const GOAL_CATEGORIES = ['strength', 'cardio', 'weight', 'rehabilitation', 'other']

function ProgressTab({ client }) {
  const [rangeId,     setRangeId]     = useState('8w')
  const [goals,       setGoals]       = useState(client.goals)
  const [addingGoal,  setAddingGoal]  = useState(false)
  const [newGoal,     setNewGoal]     = useState({
    description: '', category: 'strength',
    currentValue: '', targetValue: '', unit: '', targetDate: '',
  })

  const raw       = getProgressData(client.id)
  const weekCount = PROG_RANGES.find(r => r.id === rangeId)?.weeks ?? 8

  const { mergedData, exerciseMeta } = useMemo(() => {
    const sliced = raw.exercises.map(ex => ({ ...ex, sliced: ex.data.slice(-weekCount) }))
    const merged = sliced[0]?.sliced.map((_, i) => {
      const row = { date: sliced[0].sliced[i].date }
      sliced.forEach(ex => { row[`${ex.name} (${ex.unit})`] = ex.sliced[i]?.value ?? null })
      return row
    }) ?? []
    const meta = sliced.map(ex => {
      const values = ex.sliced.map(d => d.value)
      const pb     = ex.lowerIsBetter ? Math.min(...values) : Math.max(...values)
      let pbIdx = 0
      values.forEach((v, i) => { if (v === pb) pbIdx = i })
      return {
        key: `${ex.name} (${ex.unit})`,
        color: ex.color, lowerIsBetter: ex.lowerIsBetter,
        pb, pbIdx, values,
      }
    })
    return { mergedData: merged, exerciseMeta: meta }
  }, [client.id, weekCount])

  const weeklyCompletion = useMemo(
    () => raw.weeklyCompletion.slice(-weekCount),
    [client.id, weekCount],
  )
  const habits = useMemo(
    () => raw.habits.map(h => ({ ...h, weeks: h.weeks.slice(-weekCount) })),
    [client.id, weekCount],
  )
  const habitWeekLabels = WEEK_LABELS.slice(-weekCount)

  const split        = raw.sessionsPerWeek
  const totalPerWeek = split.trainer + split.independent
  const splitData    = [
    { name: 'With you', value: split.trainer     },
    { name: 'Solo',     value: split.independent },
  ]
  const avgCompletion = weeklyCompletion.length
    ? Math.round(weeklyCompletion.reduce((s, w) => s + w.rate, 0) / weeklyCompletion.length)
    : 0

  function handleAddGoal() {
    if (!newGoal.description || !newGoal.currentValue || !newGoal.targetValue) return
    const goal = {
      id: `goal-new-${Date.now()}`,
      description:    newGoal.description,
      category:       newGoal.category,
      targetValue:    parseFloat(newGoal.targetValue),
      currentValue:   parseFloat(newGoal.currentValue),
      unit:           newGoal.unit,
      targetDate:     newGoal.targetDate || null,
      createdAt:      new Date().toISOString().slice(0, 10),
      lowerIsBetter:  false,
      progressHistory: [{ date: new Date().toISOString().slice(0, 10), value: parseFloat(newGoal.currentValue) }],
    }
    setGoals(prev => [...prev, goal])
    setAddingGoal(false)
    setNewGoal({ description: '', category: 'strength', currentValue: '', targetValue: '', unit: '', targetDate: '' })
  }

  return (
    <div className="prf-progress-tab">

      {/* Range picker */}
      <div className="prf-prog-range-row">
        {PROG_RANGES.map(r => (
          <button
            key={r.id}
            className={`prf-prog-range-btn${rangeId === r.id ? ' active' : ''}`}
            onClick={() => setRangeId(r.id)}
          >{r.label}</button>
        ))}
      </div>

      {/* Goals */}
      <section className="prog-section">
        <div className="prog-section-head">
          <h2 className="prog-section-title">Goals</h2>
          <span className="prog-section-sub">{goals.length} active</span>
          <button
            className="prf-prog-add-btn"
            onClick={() => setAddingGoal(o => !o)}
          >
            <Plus size={13} /> {addingGoal ? 'Cancel' : 'Add Goal'}
          </button>
        </div>

        {addingGoal && (
          <div className="prf-prog-add-goal-form">
            <input
              className="prf-prog-input"
              placeholder="Goal description…"
              value={newGoal.description}
              onChange={e => setNewGoal(g => ({ ...g, description: e.target.value }))}
            />
            <div className="prf-prog-form-row">
              <select
                className="prf-prog-input"
                value={newGoal.category}
                onChange={e => setNewGoal(g => ({ ...g, category: e.target.value }))}
              >
                {GOAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <input className="prf-prog-input" placeholder="Unit (kg, min…)"
                value={newGoal.unit}
                onChange={e => setNewGoal(g => ({ ...g, unit: e.target.value }))} />
              <input className="prf-prog-input" type="number" placeholder="Current value"
                value={newGoal.currentValue}
                onChange={e => setNewGoal(g => ({ ...g, currentValue: e.target.value }))} />
              <input className="prf-prog-input" type="number" placeholder="Target value"
                value={newGoal.targetValue}
                onChange={e => setNewGoal(g => ({ ...g, targetValue: e.target.value }))} />
              <input className="prf-prog-input" type="date"
                value={newGoal.targetDate}
                onChange={e => setNewGoal(g => ({ ...g, targetDate: e.target.value }))} />
            </div>
            <button
              className="prf-prog-save-btn"
              onClick={handleAddGoal}
              disabled={!newGoal.description || !newGoal.currentValue || !newGoal.targetValue}
            >Save Goal</button>
          </div>
        )}

        {goals.length > 0 ? (
          <div className="prog-goals-grid">
            {goals.map(goal => {
              const pct    = goalProgressPct(goal)
              const accent = goalAccent(goal)
              const start  = goal.progressHistory[0]?.value ?? goal.currentValue
              return (
                <div key={goal.id} className="prog-goal-card">
                  <div className="prog-goal-top">
                    <p className="prog-goal-name">{goal.description}</p>
                    <span className="prog-goal-pct" style={{ color: accent }}>{pct}%</span>
                  </div>
                  <div className="prog-goal-bar-track">
                    <div className="prog-goal-bar-fill" style={{ width: `${pct}%`, background: accent }} />
                  </div>
                  <div className="prog-goal-footer">
                    <span>Start: {start}{goal.unit ? ` ${goal.unit}` : ''}</span>
                    <span className="prog-goal-current" style={{ color: accent }}>
                      Now: {goal.currentValue}{goal.unit ? ` ${goal.unit}` : ''}
                    </span>
                    <span>Target: {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : !addingGoal && (
          <p className="prf-prog-empty">No goals set yet. Add one above.</p>
        )}
      </section>

      {/* Strength progression */}
      <section className="prog-section">
        <div className="prog-section-head">
          <h2 className="prog-section-title">Strength Progression</h2>
          <span className="prog-section-sub">★ = personal best in range</span>
        </div>
        {exerciseMeta.length > 0 ? (
          <div className="prog-card">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mergedData} margin={{ top: 12, right: 24, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="date" tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false}
                  axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                <Tooltip content={<StrengthTooltip />} />
                <Legend formatter={name => <span style={{ color: '#9090B0', fontSize: 12 }}>{name}</span>} />
                {exerciseMeta.map(ex => (
                  <Line key={ex.key} type="monotone" dataKey={ex.key} name={ex.key}
                    stroke={ex.color} strokeWidth={2}
                    dot={makeDot(ex.color, ex.pbIdx, ex.lowerIsBetter, ex.values)}
                    activeDot={{ r: 5, fill: ex.color }}
                    connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="prf-prog-empty">No exercise data tracked yet.</p>
        )}
      </section>

      {/* Completion + session split */}
      <div className="prog-row-2col">
        <section className="prog-section">
          <div className="prog-section-head">
            <h2 className="prog-section-title">Weekly Completion</h2>
            <span className="prog-badge" style={{ background: `${barColor(avgCompletion)}22`, color: barColor(avgCompletion) }}>
              avg {avgCompletion}%
            </span>
          </div>
          <div className="prog-card">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyCompletion} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false}
                  axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#9090B0', fontSize: 11 }}
                  tickLine={false} axisLine={false} width={38} />
                <Tooltip content={<CompletionTooltip />} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {weeklyCompletion.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="prog-section">
          <h2 className="prog-section-title">Session Split</h2>
          <div className="prog-card prog-split-card">
            {totalPerWeek > 0 ? (
              <>
                <div className="prog-donut-wrap">
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie data={splitData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                        <Cell fill={CORAL} />
                        <Cell fill={TEAL} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="prog-donut-center">
                    <span className="prog-donut-total">{totalPerWeek}×</span>
                    <span className="prog-donut-label">/ week</span>
                  </div>
                </div>
                <div className="prog-split-legend">
                  <div className="prog-split-legend-item">
                    <span className="prog-split-dot" style={{ background: CORAL }} />
                    <span className="prog-split-text"><strong>{split.trainer}</strong> with you</span>
                  </div>
                  <div className="prog-split-legend-item">
                    <span className="prog-split-dot" style={{ background: TEAL }} />
                    <span className="prog-split-text"><strong>{split.independent}</strong> solo</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="prf-prog-empty">No session data.</p>
            )}
          </div>
        </section>
      </div>

      {/* Habit consistency */}
      <section className="prog-section">
        <div className="prog-section-head">
          <h2 className="prog-section-title">Habit Consistency</h2>
          <span className="prog-section-sub">week-by-week</span>
        </div>
        {habits.length > 0 ? (
          <div className="prog-card prog-habit-card">
            <div className="prog-habit-grid">
              <div className="prog-habit-label-col" />
              <div className="prog-habit-weeks-col">
                {habitWeekLabels.map(w => (
                  <span key={w} className="prog-habit-week-label">{w}</span>
                ))}
              </div>
            </div>
            {habits.map(habit => {
              const doneCount = habit.weeks.filter(Boolean).length
              const pct = Math.round((doneCount / habit.weeks.length) * 100)
              return (
                <div key={habit.name} className="prog-habit-grid prog-habit-row-grid">
                  <div className="prog-habit-label-col">
                    <span className="prog-habit-name">{habit.name}</span>
                    <span className="prog-habit-pct"
                      style={{ color: pct >= 75 ? TEAL : pct >= 50 ? AMBER : CORAL }}>{pct}%</span>
                  </div>
                  <div className="prog-habit-weeks-col">
                    {habit.weeks.map((done, i) => (
                      <div key={i} className="prog-habit-cell"
                        style={{ background: done ? TEAL : NAVY, opacity: done ? 1 : 0.45 }}
                        title={`${habitWeekLabels[i]}: ${done ? 'Completed' : 'Missed'}`}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="prf-prog-empty">No habit data for this client.</p>
        )}
      </section>

    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClientProfile({ clientId, onBack, sessions = [], initialTab = 'overview' }) {
  const client = getClientById(clientId)
  const [activeTab, setActiveTab] = useState(initialTab)

  if (!client) return (
    <div className="profile-page">
      <button className="profile-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Clients
      </button>
      <p style={{ color: 'var(--text-muted)', marginTop: 32 }}>Client not found.</p>
    </div>
  )

  const svcConfig  = getServiceConfig(client.serviceType)
  const extras     = getClientExtras(client.id)
  const badgeStyle = SERVICE_BADGE[client.serviceType] ?? SERVICE_BADGE.other

  const thisWeek = getThisWeekCompletion(client)
  const allTime  = getAllTimeAvg(client)
  const streak   = getStreak(client)

  return (
    <div className="profile-page">
      <button className="profile-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Clients
      </button>

      {/* ── Header ── */}
      <div className="prf-header">
        <div className="prf-identity">
          <div className="profile-avatar" style={{ background: client.avatarGrad }}>
            {client.initials}
          </div>
          <div>
            <h1 className="profile-name">{client.name}</h1>
            <div className="prf-meta">
              <span className="prf-service-badge" style={badgeStyle}>{svcConfig.label}</span>
              <span className="profile-dot">·</span>
              <span className="prf-since">
                Since {new Date(client.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="prf-stats-row">
          <StatChip
            label="This Week"
            value={thisWeek !== null ? `${thisWeek}%` : '—'}
            accent={thisWeek !== null && thisWeek < 50 ? 'amber' : null}
          />
          <StatChip label="All-Time Avg" value={allTime !== null ? `${allTime}%` : '—'} />
          <StatChip
            label="Streak"
            value={streak > 0 ? `${streak}w` : '—'}
            accent={streak >= 3 ? 'coral' : null}
          />
          <StatChip label={`${svcConfig.programNoun}s Done`} value={extras.plansCompleted} />
          {client.currentPlan && (
            <StatChip
              label="Days Left"
              value={`${client.currentPlan.daysLeft}d`}
              accent={client.currentPlan.daysLeft <= 7 ? 'amber' : null}
            />
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="prf-tabs">
        <button
          className={`prf-tab${activeTab === 'overview' ? ' prf-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`prf-tab${activeTab === 'program' ? ' prf-tab--active' : ''}`}
          onClick={() => setActiveTab('program')}
        >
          {svcConfig.programNoun}
        </button>
        <button
          className={`prf-tab${activeTab === 'schedule' ? ' prf-tab--active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button
          className={`prf-tab${activeTab === 'progress' ? ' prf-tab--active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="prf-body">
          <div className="prf-col-left">
            <PlanCard client={client} svcConfig={svcConfig} />
            <SessionsSection client={client} svcConfig={svcConfig} />
            <HabitTracker weeklyHabits={extras.weeklyHabits} />
          </div>
          <div className="prf-col-right">
            <NotesSection notes={extras.notes} />
            <MessageThread messages={extras.messages} />
          </div>
        </div>
      )}

      {/* ── Program tab ── */}
      {activeTab === 'program' && (
        <div className="prf-body">
          <div className="prf-col-left">
            <PlanCard client={client} svcConfig={svcConfig} />
            <SessionsSection client={client} svcConfig={svcConfig} />
          </div>
          <div className="prf-col-right">
            <HabitTracker weeklyHabits={extras.weeklyHabits} />
          </div>
        </div>
      )}

      {/* ── Schedule tab ── */}
      {activeTab === 'schedule' && (
        <ScheduleTab client={client} sessions={sessions} />
      )}

      {/* ── Progress tab ── */}
      {activeTab === 'progress' && (
        <ProgressTab client={client} />
      )}
    </div>
  )
}
