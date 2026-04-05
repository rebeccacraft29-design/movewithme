import { useState, useMemo, useRef, useEffect } from 'react'
import SearchDropdown from '../components/SearchDropdown'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from 'recharts'
import { clients, getActiveClients } from '../data/mockData'
import { getClientExtras } from '../data/clientExtras'
import { getProgressData, WEEK_LABELS } from '../data/progressData'
import { planTypeGroups, mostSkippedExercises, winsThisWeek } from '../data/overviewData'
import './Progress.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const CORAL        = '#FF6B5B'
const AMBER        = '#FFA733'
const TEAL         = '#2EC4A0'
const NAVY_LIGHTER = '#2E2E4A'
const GRID_STROKE  = 'rgba(255,255,255,0.05)'

const OV_RANGES = [
  { id: 'week',    label: 'This Week',     weeks: 1  },
  { id: 'month',   label: 'This Month',    weeks: 4  },
  { id: '3months', label: 'Last 3 Months', weeks: 13 },
  { id: 'all',     label: 'All Time',      weeks: 16 },
]

const DL_RANGES = [
  { id: '4w',  label: 'Last 4 weeks',  weeks: 4  },
  { id: '8w',  label: 'Last 8 weeks',  weeks: 8  },
  { id: '3m',  label: 'Last 3 months', weeks: 13 },
  { id: 'all', label: 'All time',      weeks: 16 },
]

// ─── Shared helpers ───────────────────────────────────────────────────────────

function barColor(rate) {
  if (rate >= 75) return TEAL
  if (rate >= 50) return AMBER
  return CORAL
}

function tenureMonths(startDate) {
  const ms = new Date('2026-04-04') - new Date(startDate)
  return ms / (1000 * 60 * 60 * 24 * 30.44)
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

// ─── Tooltip components ───────────────────────────────────────────────────────

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

// ─── Star dot for PB markers ──────────────────────────────────────────────────

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


// ─── LEVEL 1 — Trainer Overview ───────────────────────────────────────────────

function TrainerOverview({ onClientClick }) {
  const [rangeId, setRangeId] = useState('month')
  const weekCount   = OV_RANGES.find(r => r.id === rangeId)?.weeks ?? 4
  const activeList  = getActiveClients()

  // ── Business Pulse ──────────────────────────────────────────────────────────
  const pulse = useMemo(() => {
    const atRisk = activeList.filter(c => {
      const data   = getProgressData(c.id)
      const recent = data.weeklyCompletion.slice(-Math.min(weekCount, 4))
      if (!recent.length) return false
      const avg = recent.reduce((s, w) => s + w.rate, 0) / recent.length
      return avg < 70
    })

    const avgTenure = activeList.reduce((s, c) => s + tenureMonths(c.startDate), 0) / activeList.length
    const inactive  = clients.filter(c => c.status === 'inactive')
    const churnRate = Math.round(inactive.length / (activeList.length + inactive.length) * 100)

    return {
      activeNow:  activeList.length,
      activePrev: 9,
      atRisk,
      avgTenure:  avgTenure.toFixed(1),
      churnRate,
      churned:    inactive,
    }
  }, [weekCount])

  // ── Programming effectiveness ───────────────────────────────────────────────
  const planEffectiveness = useMemo(() => planTypeGroups.map(group => {
    const sum = group.ids.reduce((s, id) => {
      const recent = getProgressData(id).weeklyCompletion.slice(-weekCount)
      return s + (recent.length ? recent.reduce((a, w) => a + w.rate, 0) / recent.length : 0)
    }, 0)
    return { label: group.label, completion: Math.round(sum / group.ids.length) }
  }), [weekCount])

  // ── Goal achievement rate ───────────────────────────────────────────────────
  const goalAchievement = useMemo(() => {
    let total = 0, onTrack = 0
    activeList.forEach(c => c.goals.forEach(g => {
      total++
      if (goalProgressPct(g) >= 40) onTrack++
    }))
    return total > 0 ? Math.round(onTrack / total * 100) : 0
  }, [])

  // ── Client engagement ───────────────────────────────────────────────────────
  const engagementData = useMemo(() => activeList.map(client => {
    const data = getProgressData(client.id)
    let done = 0, possible = 0
    data.habits.forEach(h => {
      const sliced = h.weeks.slice(-weekCount)
      done     += sliced.filter(Boolean).length
      possible += sliced.length
    })
    const habitPct = possible > 0 ? Math.round(done / possible * 100) : 0
    const recent   = data.weeklyCompletion.slice(-weekCount)
    const completionPct = recent.length
      ? Math.round(recent.reduce((s, w) => s + w.rate, 0) / recent.length)
      : 0
    return { ...client, habitPct, completionPct, score: Math.round((habitPct + completionPct) / 2) }
  }).sort((a, b) => b.score - a.score), [weekCount])

  const avgHabit     = engagementData.length
    ? Math.round(engagementData.reduce((s, c) => s + c.habitPct, 0) / engagementData.length)
    : 0
  const topEngaged   = engagementData.slice(0, 3)
  const leastEngaged = [...engagementData].reverse().slice(0, 3)

  // ── Trend arrow ─────────────────────────────────────────────────────────────
  const activeDiff = pulse.activeNow - pulse.activePrev
  const trendDir   = activeDiff >= 0 ? 'up' : 'down'

  return (
    <div className="progress-page">

      {/* Header */}
      <header className="prog-header">
        <div className="prog-header-left">
          <h1 className="prog-title">Progress</h1>
          <SearchDropdown
            items={activeList}
            selectedId={null}
            onSelect={onClientClick}
            placeholder="View a client…"
          />
        </div>
        <div className="prog-range-picker">
          {OV_RANGES.map(r => (
            <button
              key={r.id}
              className={`prog-range-btn${rangeId === r.id ? ' active' : ''}`}
              onClick={() => setRangeId(r.id)}
            >{r.label}</button>
          ))}
        </div>
      </header>

      <div className="prog-body">

        {/* ── Business Pulse ─────────────────────────────────────────────── */}
        <section className="prog-section">
          <h2 className="prog-section-title">Business Pulse</h2>
          <div className="pulse-grid">

            <div className="pulse-card">
              <p className="pulse-label">Active Clients</p>
              <span className="pulse-value">{pulse.activeNow}</span>
              <span className={`pulse-trend pulse-trend--${trendDir}`}>
                {trendDir === 'up' ? '▲' : '▼'} {Math.abs(activeDiff)} vs last month
              </span>
            </div>

            <div className={`pulse-card${pulse.atRisk.length ? ' pulse-card--risk' : ''}`}>
              <p className="pulse-label">Clients at Risk</p>
              <span className="pulse-value" style={{ color: pulse.atRisk.length ? CORAL : TEAL }}>
                {pulse.atRisk.length}
              </span>
              {pulse.atRisk.length > 0 && (
                <div className="pulse-risk-names">
                  {pulse.atRisk.map(c => (
                    <button key={c.id} className="pulse-client-btn" onClick={() => onClientClick(c.id)}>
                      {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
              {pulse.atRisk.length === 0 && (
                <span className="pulse-trend pulse-trend--up">All on track</span>
              )}
            </div>

            <div className="pulse-card">
              <p className="pulse-label">Avg Client Tenure</p>
              <span className="pulse-value">{pulse.avgTenure}</span>
              <span className="pulse-unit">months</span>
            </div>

            <div className="pulse-card">
              <p className="pulse-label">Churn Rate (90 days)</p>
              <span className="pulse-value">{pulse.churnRate}%</span>
              {pulse.churned.length > 0 && (
                <span className="pulse-churn-note">
                  {pulse.churned.map(c => c.name.split(' ')[0]).join(' & ')} left
                </span>
              )}
            </div>

          </div>
        </section>

        {/* ── Programming Effectiveness + Client Engagement ──────────────── */}
        <div className="prog-mid-row">

          {/* Programming Effectiveness */}
          <section className="prog-section">
            <h2 className="prog-section-title">Programming Effectiveness</h2>
            <div className="prog-card prog-eff-card">
              <p className="prog-section-sub" style={{ marginBottom: 12 }}>Avg completion rate by plan type</p>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={planEffectiveness} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const val = payload[0]?.value
                    return (
                      <div className="prog-tooltip">
                        <p className="prog-tooltip-label">{label}</p>
                        <p className="prog-tooltip-row" style={{ color: barColor(val) }}>
                          <span className="prog-tooltip-name">Avg completion</span>
                          <span className="prog-tooltip-val">{val}%</span>
                        </p>
                      </div>
                    )
                  }} />
                  <Bar dataKey="completion" radius={[5, 5, 0, 0]} maxBarSize={52}>
                    {planEffectiveness.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.completion)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="eff-stats-row">
                <div className="eff-goal-stat">
                  <span className="eff-goal-value" style={{ color: barColor(goalAchievement) }}>
                    {goalAchievement}%
                  </span>
                  <span className="eff-goal-label">goals on track</span>
                </div>

                <div className="eff-divider" />

                <div className="eff-skipped">
                  <p className="eff-skipped-title">Most skipped exercises</p>
                  {mostSkippedExercises.map((ex, i) => (
                    <div key={i} className="eff-skip-row">
                      <span className="eff-skip-rank">{i + 1}</span>
                      <span className="eff-skip-name">{ex.name}</span>
                      <span className="eff-skip-count" style={{ color: CORAL }}>{ex.skips}×</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Client Engagement */}
          <section className="prog-section">
            <h2 className="prog-section-title">Client Engagement</h2>
            <div className="prog-card prog-engagement-card">
              <div className="engagement-avg-row">
                <span className="engagement-avg-value" style={{ color: barColor(avgHabit) }}>
                  {avgHabit}%
                </span>
                <span className="engagement-avg-label">avg habit consistency</span>
              </div>

              <div className="engagement-group">
                <p className="engagement-group-title">Most engaged</p>
                {topEngaged.map((c, i) => (
                  <div key={c.id} className="engagement-row">
                    <span className="engagement-rank">{i + 1}</span>
                    <div className="engagement-avatar" style={{ background: c.avatarGrad }}>{c.initials}</div>
                    <button className="engagement-name" onClick={() => onClientClick(c.id)}>
                      {c.name.split(' ')[0]}
                    </button>
                    <span className="engagement-score" style={{ color: TEAL }}>{c.score}%</span>
                  </div>
                ))}
              </div>

              <div className="engagement-group engagement-group--warn">
                <p className="engagement-group-title" style={{ color: AMBER }}>Needs attention</p>
                {leastEngaged.map(c => (
                  <div key={c.id} className="engagement-row">
                    <div className="engagement-avatar" style={{ background: c.avatarGrad }}>{c.initials}</div>
                    <button className="engagement-name" onClick={() => onClientClick(c.id)}>
                      {c.name.split(' ')[0]}
                    </button>
                    <span className="engagement-score" style={{ color: AMBER }}>{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* ── Wins This Week ──────────────────────────────────────────────── */}
        <section className="prog-section">
          <h2 className="prog-section-title">Wins This Week</h2>
          <div className="wins-card">

            <div className="wins-group">
              <div className="wins-group-header">
                <span className="wins-icon">★</span>
                <h3 className="wins-group-title">Personal Bests</h3>
              </div>
              {winsThisWeek.personalBests.map((pb, i) => (
                <div key={i} className="win-item">
                  <button className="win-client-btn" onClick={() => onClientClick(pb.clientId)}>
                    {pb.clientName.split(' ')[0]}
                  </button>
                  <span className="win-exercise">{pb.exercise}</span>
                  <span className="win-badge win-badge--pb">🏆 {pb.value}</span>
                </div>
              ))}
            </div>

            <div className="wins-divider" />

            <div className="wins-group">
              <div className="wins-group-header">
                <span className="wins-icon">🎉</span>
                <h3 className="wins-group-title">First Full Week</h3>
              </div>
              {winsThisWeek.firstFullWeek.map((c, i) => (
                <div key={i} className="win-item">
                  <button className="win-client-btn" onClick={() => onClientClick(c.clientId)}>
                    {c.clientName.split(' ')[0]}
                  </button>
                  <span className="win-exercise">completed every session</span>
                  <span className="win-badge win-badge--week">✓ Full week</span>
                </div>
              ))}
            </div>

            <div className="wins-divider" />

            <div className="wins-group">
              <div className="wins-group-header">
                <span className="wins-icon">🔥</span>
                <h3 className="wins-group-title">On a Streak</h3>
              </div>
              {winsThisWeek.streaks.map((s, i) => (
                <div key={i} className="win-item">
                  <button className="win-client-btn" onClick={() => onClientClick(s.clientId)}>
                    {s.clientName.split(' ')[0]}
                  </button>
                  <span className="win-exercise">habit streak</span>
                  <span className="win-badge win-badge--streak">🔥 {s.days} days</span>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

// ─── LEVEL 2 — Client Drill-Down ──────────────────────────────────────────────

function ClientDrillDown({ initialClientId, onBack, onClientClick }) {
  const activeClients = getActiveClients()
  const [selectedId, setSelectedId] = useState(initialClientId ?? activeClients[0]?.id ?? '')
  const [rangeId,    setRangeId]    = useState('8w')

  const client = clients.find(c => c.id === selectedId)
  const raw    = getProgressData(selectedId)
  const weekCount = DL_RANGES.find(r => r.id === rangeId)?.weeks ?? 8

  // ── Strength chart ───────────────────────────────────────────────────────
  const { mergedStrengthData, exerciseMeta } = useMemo(() => {
    const sliced = raw.exercises.map(ex => ({ ...ex, sliced: ex.data.slice(-weekCount) }))
    const merged = sliced[0]?.sliced.map((_, i) => {
      const row = { date: sliced[0].sliced[i].date }
      sliced.forEach(ex => { row[`${ex.name} (${ex.unit})`] = ex.sliced[i]?.value ?? null })
      return row
    }) ?? []
    const meta = sliced.map(ex => {
      const values = ex.sliced.map(d => d.value)
      const pb = ex.lowerIsBetter ? Math.min(...values) : Math.max(...values)
      let pbIdx = 0
      values.forEach((v, i) => { if (v === pb) pbIdx = i })
      return {
        key: `${ex.name} (${ex.unit})`, displayName: ex.name, unit: ex.unit,
        color: ex.color, lowerIsBetter: ex.lowerIsBetter, pb, pbIdx, values,
      }
    })
    return { mergedStrengthData: merged, exerciseMeta: meta }
  }, [selectedId, weekCount])

  // ── Completion + habits ──────────────────────────────────────────────────
  const weeklyCompletion = useMemo(
    () => raw.weeklyCompletion.slice(-weekCount),
    [selectedId, weekCount],
  )
  const habits = useMemo(
    () => raw.habits.map(h => ({ ...h, weeks: h.weeks.slice(-weekCount) })),
    [selectedId, weekCount],
  )
  const habitWeekLabels = WEEK_LABELS.slice(-weekCount)

  // ── Session split ────────────────────────────────────────────────────────
  const split        = raw.sessionsPerWeek
  const totalPerWeek = split.trainer + split.independent
  const splitData    = [
    { name: 'With you', value: split.trainer      },
    { name: 'Solo',     value: split.independent  },
  ]

  if (!client) return (
    <div className="progress-page">
      <p className="prog-empty">No client found.</p>
    </div>
  )

  const avgCompletion = weeklyCompletion.length
    ? Math.round(weeklyCompletion.reduce((s, w) => s + w.rate, 0) / weeklyCompletion.length)
    : 0
  const firstName = client.name.split(' ')[0]

  return (
    <div className="progress-page">

      {/* Header */}
      <header className="prog-header">
        <div className="prog-header-left">
          <button className="prog-back-btn" onClick={onBack}>← Overview</button>
          <h1 className="prog-title">Progress</h1>
          <SearchDropdown
            items={activeClients}
            selectedId={selectedId}
            onSelect={setSelectedId}
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

        {/* ── Strength Progression ──────────────────────────────────────── */}
        <section className="prog-section">
          <div className="prog-section-head">
            <h2 className="prog-section-title">Strength Progression</h2>
            <span className="prog-section-sub">★ = personal best in range</span>
          </div>
          {exerciseMeta.length > 0 ? (
            <div className="prog-card">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mergedStrengthData} margin={{ top: 12, right: 24, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="date" tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false}
                    axisLine={{ stroke: GRID_STROKE }} interval="preserveStartEnd" />
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
            <div className="prog-card prog-empty-card">
              <p>No exercise data tracked yet for this client.</p>
            </div>
          )}
        </section>

        {/* ── Completion + Session Split ───────────────────────────────── */}
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
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#9090B0', fontSize: 11 }} tickLine={false}
                    axisLine={{ stroke: GRID_STROKE }} interval="preserveStartEnd" />
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
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={splitData} cx="50%" cy="50%" innerRadius={58} outerRadius={85}
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
                  <p className="prog-split-summary">
                    {firstName} trains {totalPerWeek}× per week —{' '}
                    {split.trainer === 1 ? '1 session' : `${split.trainer} sessions`} with you,{' '}
                    {split.independent} on their own.
                  </p>
                </>
              ) : (
                <p className="prog-empty-text">No session data available.</p>
              )}
            </div>
          </section>
        </div>

        {/* ── Goals ────────────────────────────────────────────────────── */}
        <section className="prog-section">
          <div className="prog-section-head">
            <h2 className="prog-section-title">Goals</h2>
            <span className="prog-section-sub">{client.goals.length} active</span>
          </div>
          {client.goals.length > 0 ? (
            <div className="prog-goals-grid">
              {client.goals.map(goal => {
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
                      <span className="prog-goal-start">Start: {start} {goal.unit}</span>
                      <span className="prog-goal-current" style={{ color: accent }}>Now: {goal.currentValue} {goal.unit}</span>
                      <span className="prog-goal-target">Target: {goal.targetValue} {goal.unit}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="prog-card prog-empty-card">
              <p>No goals set for this client yet.</p>
            </div>
          )}
        </section>

        {/* ── Habit Consistency ────────────────────────────────────────── */}
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
                      <span className="prog-habit-pct" style={{ color: pct >= 75 ? TEAL : pct >= 50 ? AMBER : CORAL }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="prog-habit-weeks-col">
                      {habit.weeks.map((done, i) => (
                        <div key={i} className="prog-habit-cell"
                          style={{ background: done ? TEAL : NAVY_LIGHTER, opacity: done ? 1 : 0.45 }}
                          title={`${habitWeekLabels[i]}: ${done ? 'Completed' : 'Missed'}`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="prog-card prog-empty-card">
              <p>No habit tracking data for this client.</p>
            </div>
          )}
        </section>

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
