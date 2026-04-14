import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { getActiveClients, getClientExtras } from '../lib/db'
import SearchDropdown from '../components/SearchDropdown'
import './Progress.css'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CORAL = '#FF6B5B'
const AMBER = '#FFA733'
const TEAL  = '#2EC4A0'
const NAVY_LIGHTER = '#2E2E4A'
const GRID_STROKE  = 'rgba(255,255,255,0.05)'

const DL_RANGES = [
  { id: '4w',  label: 'Last 4 weeks',  weeks: 4  },
  { id: '8w',  label: 'Last 8 weeks',  weeks: 8  },
  { id: 'all', label: 'All time',      weeks: 999 },
]

function barColor(rate) {
  if (rate >= 75) return TEAL
  if (rate >= 50) return AMBER
  return CORAL
}

// ─── LEVEL 1 — Trainer Overview ───────────────────────────────────────────────

function TrainerOverview({ onClientClick }) {
  const { trainer } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!trainer?.id) return
    getActiveClients(trainer.id).then(list => {
      setClients(list)
      setLoading(false)
    })
  }, [trainer?.id])

  const weekAgo = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d
  }, [])

  const sessionsThisWeek = clients.reduce((s, c) =>
    s + c.trainerSessions.filter(sess => new Date(sess.date) > weekAgo).length, 0)

  const atRisk = clients.filter(c => c.attentionFlag !== null)

  return (
    <div className="progress-page">
      <header className="prog-header">
        <div className="prog-header-left">
          <h1 className="prog-title">Progress</h1>
          {clients.length > 0 && (
            <SearchDropdown
              items={clients}
              selectedId={null}
              onSelect={onClientClick}
              placeholder="View a client…"
            />
          )}
        </div>
      </header>

      <div className="prog-body">
        {loading ? (
          <p className="prog-empty">Loading…</p>
        ) : clients.length === 0 ? (
          <div className="prog-empty-state">
            <p className="prog-empty-icon">📈</p>
            <p className="prog-empty-heading">No clients yet</p>
            <p className="prog-empty-sub">Add clients and log sessions to start tracking progress.</p>
          </div>
        ) : (
          <>
            {/* ── Pulse stats ─────────────────────────────────────────────── */}
            <section className="prog-section">
              <h2 className="prog-section-title">Overview</h2>
              <div className="pulse-grid">
                <div className="pulse-card">
                  <p className="pulse-label">Active Clients</p>
                  <span className="pulse-value">{clients.length}</span>
                </div>
                <div className="pulse-card">
                  <p className="pulse-label">Sessions This Week</p>
                  <span className="pulse-value" style={{ color: TEAL }}>{sessionsThisWeek}</span>
                </div>
                <div className={`pulse-card${atRisk.length ? ' pulse-card--risk' : ''}`}>
                  <p className="pulse-label">Clients at Risk</p>
                  <span className="pulse-value" style={{ color: atRisk.length ? CORAL : TEAL }}>
                    {atRisk.length}
                  </span>
                  {atRisk.length === 0
                    ? <span className="pulse-trend pulse-trend--up">All on track</span>
                    : (
                      <div className="pulse-risk-names">
                        {atRisk.map(c => (
                          <button key={c.id} className="pulse-client-btn" onClick={() => onClientClick(c.id)}>
                            {c.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )
                  }
                </div>
                <div className="pulse-card">
                  <p className="pulse-label">Total Sessions</p>
                  <span className="pulse-value">
                    {clients.reduce((s, c) => s + c.trainerSessions.length, 0)}
                  </span>
                </div>
              </div>
            </section>

            {/* ── Client progress cards ──────────────────────────────────── */}
            <section className="prog-section">
              <h2 className="prog-section-title">Client Progress</h2>
              <div className="prog-client-grid">
                {clients.map(client => {
                  const thisWeek = client.trainerSessions.filter(s => new Date(s.date) > weekAgo).length
                  const plan     = client.currentPlan
                  return (
                    <button
                      key={client.id}
                      className="prog-client-card"
                      onClick={() => onClientClick(client.id)}
                    >
                      <div className="prog-client-avatar" style={{ background: client.avatarGrad }}>
                        {client.initials}
                      </div>
                      <div className="prog-client-info">
                        <p className="prog-client-name">{client.name}</p>
                        {plan
                          ? <p className="prog-client-plan">{plan.name} · {plan.progress}% complete</p>
                          : <p className="prog-client-plan prog-client-plan--none">No active program</p>
                        }
                        <p className="prog-client-meta">
                          {client.trainerSessions.length} sessions · {thisWeek} this week
                        </p>
                      </div>
                      <span className="prog-client-chevron">›</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* ── Unlock hint ────────────────────────────────────────────── */}
            {clients.reduce((s, c) => s + c.trainerSessions.length, 0) < 15 && (
              <section className="prog-section">
                <div className="prog-card prog-unlock-card">
                  <p className="prog-unlock-icon">📊</p>
                  <p className="prog-unlock-heading">More insights are on the way</p>
                  <p className="prog-unlock-sub">
                    As you log more sessions, completion rate trends, engagement rankings,
                    and exercise analytics will appear here automatically.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── LEVEL 2 — Client Drill-Down ──────────────────────────────────────────────

function ClientDrillDown({ initialClientId, onBack, onClientClick }) {
  const { trainer } = useAuth()
  const [clients,    setClients]    = useState([])
  const [extras,     setExtras]     = useState(null)
  const [selectedId, setSelectedId] = useState(initialClientId)
  const [rangeId,    setRangeId]    = useState('8w')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!trainer?.id) return
    getActiveClients(trainer.id).then(list => {
      setClients(list)
      setLoading(false)
    })
  }, [trainer?.id])

  useEffect(() => {
    if (!trainer?.id || !selectedId) return
    setExtras(null)
    getClientExtras(trainer.id, selectedId).then(setExtras)
  }, [trainer?.id, selectedId])

  const client    = clients.find(c => c.id === selectedId) ?? null
  const weekCount = DL_RANGES.find(r => r.id === rangeId)?.weeks ?? 8

  // ── Weekly completion chart data ─────────────────────────────────────────
  const weeklyCompletion = useMemo(() => {
    if (!client) return []
    const sessions = client.trainerSessions
    if (sessions.length === 0) return []

    const weekMap = {}
    sessions.forEach(s => {
      const d = new Date(s.date)
      const mon = new Date(d)
      mon.setHours(0, 0, 0, 0)
      mon.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1))
      const key = mon.toISOString().slice(0, 10)
      if (!weekMap[key]) weekMap[key] = { key, done: 0 }
      weekMap[key].done++
    })

    const spw = client.currentPlan ? 3 : 3
    return Object.values(weekMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-weekCount)
      .map(w => ({
        date: new Date(w.key + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
        rate: Math.min(100, Math.round((w.done / spw) * 100)),
      }))
  }, [client, weekCount])

  const avgCompletion = weeklyCompletion.length
    ? Math.round(weeklyCompletion.reduce((s, w) => s + w.rate, 0) / weeklyCompletion.length)
    : 0

  if (loading) return (
    <div className="progress-page">
      <header className="prog-header">
        <div className="prog-header-left">
          <button className="prog-back-btn" onClick={onBack}>← Overview</button>
          <h1 className="prog-title">Progress</h1>
        </div>
      </header>
      <div className="prog-body"><p className="prog-empty">Loading…</p></div>
    </div>
  )

  if (!client) return (
    <div className="progress-page">
      <header className="prog-header">
        <div className="prog-header-left">
          <button className="prog-back-btn" onClick={onBack}>← Overview</button>
          <h1 className="prog-title">Progress</h1>
        </div>
      </header>
      <div className="prog-body"><p className="prog-empty">Client not found.</p></div>
    </div>
  )

  const currentWeek = client.currentPlan?.startDate
    ? Math.max(1, Math.ceil((Date.now() - new Date(client.currentPlan.startDate)) / (86400000 * 7)))
    : null

  return (
    <div className="progress-page">
      <header className="prog-header">
        <div className="prog-header-left">
          <button className="prog-back-btn" onClick={onBack}>← Overview</button>
          <h1 className="prog-title">Progress</h1>
          <SearchDropdown
            items={clients}
            selectedId={selectedId}
            onSelect={id => { setSelectedId(id); onClientClick(id) }}
          />
        </div>
        <div className="prog-range-picker">
          {DL_RANGES.map(r => (
            <button
              key={r.id}
              className={`prog-range-btn${rangeId === r.id ? ' active' : ''}`}
              onClick={() => setRangeId(r.id)}
            >{r.label}</button>
          ))}
        </div>
      </header>

      <div className="prog-body">

        {/* ── Client summary ─────────────────────────────────────────────── */}
        <section className="prog-section">
          <div className="prog-card prog-summary-card">
            <div className="prog-summary-avatar" style={{ background: client.avatarGrad }}>
              {client.initials}
            </div>
            <div className="prog-summary-info">
              <h2 className="prog-summary-name">{client.name}</h2>
              {client.currentPlan ? (
                <p className="prog-summary-plan">
                  {client.currentPlan.name}
                  {currentWeek ? ` · Week ${currentWeek}` : ''}
                  {` · ${client.currentPlan.progress}% complete`}
                </p>
              ) : (
                <p className="prog-summary-plan prog-summary-plan--none">No active program</p>
              )}
              <p className="prog-summary-meta">
                {client.trainerSessions.length} sessions logged
                {client.lastSeen ? ` · Last seen ${client.lastSeen}` : ''}
              </p>
            </div>
          </div>
        </section>

        {/* ── Session completion chart ────────────────────────────────────── */}
        <section className="prog-section">
          <div className="prog-section-head">
            <h2 className="prog-section-title">Session Completion</h2>
            {weeklyCompletion.length > 0 && (
              <span className="prog-section-sub">{avgCompletion}% avg</span>
            )}
          </div>
          {weeklyCompletion.length > 0 ? (
            <div className="prog-card">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyCompletion} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9090B0', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: GRID_STROKE }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fill: '#9090B0', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    formatter={v => [`${v}%`, 'Completion']}
                    contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#9090B0' }}
                    itemStyle={{ color: TEAL }}
                  />
                  <Bar dataKey="rate" radius={[5, 5, 0, 0]} maxBarSize={52}>
                    {weeklyCompletion.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.rate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="prog-card prog-empty-card">
              <p>No sessions logged yet.</p>
            </div>
          )}
        </section>

        {/* ── Goals ──────────────────────────────────────────────────────── */}
        {client.goals.length > 0 && (
          <section className="prog-section">
            <h2 className="prog-section-title">Goals</h2>
            <div className="prog-goals-grid">
              {client.goals.map(goal => {
                const pct = goal.targetValue
                  ? Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100)))
                  : 0
                return (
                  <div key={goal.id} className="prog-goal-card">
                    <div className="prog-goal-top">
                      <span className="prog-goal-name">{goal.description}</span>
                      <span className="prog-goal-pct" style={{ color: barColor(pct) }}>{pct}%</span>
                    </div>
                    <div className="prog-goal-bar-track">
                      <div className="prog-goal-bar-fill" style={{ width: `${pct}%`, background: barColor(pct) }} />
                    </div>
                    <div className="prog-goal-footer">
                      <span className="prog-goal-current">{goal.currentValue} {goal.unit}</span>
                      <span>Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Session history ─────────────────────────────────────────────── */}
        <section className="prog-section">
          <h2 className="prog-section-title">Session History</h2>
          {client.trainerSessions.length > 0 ? (
            <div className="prog-card prog-session-list">
              {[...client.trainerSessions]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 12)
                .map(s => (
                  <div key={s.id} className="prog-session-row">
                    <div className="prog-session-left">
                      <span className="prog-session-date">
                        {new Date(s.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="prog-session-type">{s.type}</span>
                      <span className="prog-session-duration">{s.durationMinutes} min</span>
                    </div>
                    <div className="prog-session-right">
                      {s.rating != null && (
                        <span className="prog-session-rating" aria-label={`${s.rating} stars`}>
                          {'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}
                        </span>
                      )}
                      {s.notes && <p className="prog-session-notes">{s.notes}</p>}
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="prog-card prog-empty-card">
              <p>No sessions logged yet.</p>
            </div>
          )}
        </section>

        {/* ── Habits this week ────────────────────────────────────────────── */}
        {extras?.weeklyHabits?.length > 0 && (
          <section className="prog-section">
            <h2 className="prog-section-title">Habits This Week</h2>
            <div className="prog-card prog-habit-card">
              {extras.weeklyHabits.map((habit, i) => {
                const tracked = habit.days.filter(d => d !== null)
                const done    = habit.days.filter(Boolean).length
                const pct     = tracked.length > 0 ? Math.round((done / tracked.length) * 100) : 0
                return (
                  <div key={i} className="prog-habit-grid prog-habit-row-grid">
                    <div className="prog-habit-label-col">
                      <span className="prog-habit-name">{habit.name}</span>
                      <span className="prog-habit-pct" style={{ color: barColor(pct) }}>{pct}%</span>
                    </div>
                    <div className="prog-habit-weeks-col">
                      {habit.days.map((done, di) => (
                        <div
                          key={di}
                          className="prog-habit-cell"
                          style={{
                            background: done === null ? 'transparent' : done ? TEAL : NAVY_LIGHTER,
                            opacity: done === null ? 0 : 1,
                          }}
                          title={['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][di]}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function Progress() {
  const [view,     setView]     = useState('overview')
  const [clientId, setClientId] = useState(null)

  function handleClientClick(id) {
    setClientId(id)
    setView('client')
  }

  if (view === 'client') {
    return (
      <ClientDrillDown
        initialClientId={clientId}
        onBack={() => setView('overview')}
        onClientClick={handleClientClick}
      />
    )
  }
  return <TrainerOverview onClientClick={handleClientClick} />
}
