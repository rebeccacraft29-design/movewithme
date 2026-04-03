import { useState, useMemo } from 'react'
import { Search, Flame, ChevronRight, AlertCircle, Calendar as CalendarIcon } from 'lucide-react'
import { clients, getServiceConfig } from '../data/mockData'
import './Clients.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay()
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d
}

function getWeekInPlan(startDate) {
  if (!startDate) return 1
  const diffDays = Math.floor((new Date() - new Date(startDate)) / 86400000)
  return Math.max(1, Math.ceil(diffDays / 7))
}

function getTotalPlanWeeks(startDate, endDate) {
  return Math.ceil((new Date(endDate) - new Date(startDate)) / (86400000 * 7))
}

function getThisWeekCompletion(client) {
  const monday = getMondayOfWeek(new Date())
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const sessions = [...client.trainerSessions, ...client.independentSessions].filter(s => {
    const d = new Date(s.date)
    return d >= monday && d <= today
  })

  if (sessions.length === 0) return null
  return Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100)
}

function getStreak(client) {
  const completedDates = [...client.trainerSessions, ...client.independentSessions]
    .filter(s => s.completed)
    .map(s => { const d = new Date(s.date); d.setHours(0, 0, 0, 0); return d })

  if (completedDates.length === 0) return 0

  const thisWeekMon = getMondayOfWeek(new Date())
  const thisWeekSun = new Date(thisWeekMon)
  thisWeekSun.setDate(thisWeekMon.getDate() + 6)
  thisWeekSun.setHours(23, 59, 59, 999)

  const hasThisWeek = completedDates.some(d => d >= thisWeekMon && d <= thisWeekSun)

  let weekMon = new Date(thisWeekMon)
  if (!hasThisWeek) weekMon.setDate(weekMon.getDate() - 7)

  let streak = 0
  for (let i = 0; i < 52; i++) {
    const weekSun = new Date(weekMon)
    weekSun.setDate(weekMon.getDate() + 6)
    weekSun.setHours(23, 59, 59, 999)

    if (!completedDates.some(d => d >= weekMon && d <= weekSun)) break
    streak++
    weekMon.setDate(weekMon.getDate() - 7)
  }

  return streak
}

function isToday(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return d >= today && d < tomorrow
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const monday = getMondayOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  const d = new Date(dateStr + 'T00:00:00')
  return d >= monday && d <= sunday
}

function formatNextSession(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.round((d - today) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 0) return null

  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (diffDays < 7) return `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`
  return `${MON[d.getMonth()]} ${d.getDate()}`
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_COLORS = {
  personal_trainer:  { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  physiotherapist:   { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
  massage_therapist: { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  chiropractor:      { bg: 'rgba(108,99,255,0.12)',  color: '#6C63FF' },
  other:             { bg: 'rgba(144,144,176,0.12)', color: '#9090B0' },
}

const ATTENTION_COLORS = {
  overdue:  { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  checkin:  { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  health:   { bg: 'rgba(255,100,100,0.12)', color: '#FF6464' },
  effort:   { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  message:  { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
}

// ── ClientRow ─────────────────────────────────────────────────────────────────

function ClientRow({ client, onClick }) {
  const svcConfig = getServiceConfig(client.serviceType)
  const svcColors = SERVICE_COLORS[client.serviceType] ?? SERVICE_COLORS.other
  const completion = getThisWeekCompletion(client)
  const streak = getStreak(client)
  const flag = client.attentionFlag
  const planEndingSoon = !flag && client.currentPlan && client.currentPlan.daysLeft <= 7

  const weekNum = client.currentPlan ? getWeekInPlan(client.currentPlan.startDate) : null
  const totalWeeks = client.currentPlan
    ? getTotalPlanWeeks(client.currentPlan.startDate, client.currentPlan.endDate)
    : null

  let statusBg, statusColor, statusLabel
  if (client.status === 'inactive') {
    statusBg = 'rgba(144,144,176,0.12)'
    statusColor = '#9090B0'
    statusLabel = 'Inactive'
  } else if (flag) {
    const ac = ATTENTION_COLORS[flag.tagType] ?? ATTENTION_COLORS.checkin
    statusBg = ac.bg
    statusColor = ac.color
    statusLabel = flag.tag
  } else if (planEndingSoon) {
    statusBg = 'rgba(255,167,51,0.12)'
    statusColor = '#FFA733'
    statusLabel = `${client.currentPlan.daysLeft}d left`
  } else {
    statusBg = 'rgba(46,196,160,0.12)'
    statusColor = '#2EC4A0'
    statusLabel = 'Active'
  }

  let barGradient = 'linear-gradient(90deg,#2EC4A0,#4DD4B3)'
  if (completion !== null && completion < 75) barGradient = 'linear-gradient(90deg,#FFA733,#FFB955)'
  if (completion !== null && completion < 40) barGradient = 'linear-gradient(90deg,#FF6B5B,#FF8A7D)'

  const nextSessionLabel = formatNextSession(client.nextSession)
  const nextIsToday = isToday(client.nextSession)

  return (
    <button className="client-row" onClick={onClick}>
      <div className="cr-avatar" style={{ background: client.avatarGrad }}>
        {client.initials}
      </div>

      <div className="cr-identity">
        <span className="cr-name">{client.name}</span>
        <span
          className="cr-service-badge"
          style={{ background: svcColors.bg, color: svcColors.color }}
        >
          {svcConfig.label}
        </span>
      </div>

      <div className="cr-plan">
        {client.currentPlan ? (
          <>
            <span className="cr-plan-name">{client.currentPlan.name}</span>
            <span className="cr-plan-week">Wk {weekNum} of {totalWeeks}</span>
          </>
        ) : (
          <span className="cr-muted">No active plan</span>
        )}
      </div>

      <div className="cr-completion">
        {completion !== null ? (
          <>
            <div className="cr-progress-track">
              <div
                className="cr-progress-fill"
                style={{ width: `${completion}%`, background: barGradient }}
              />
            </div>
            <span className="cr-completion-pct">{completion}%</span>
          </>
        ) : (
          <span className="cr-muted">—</span>
        )}
      </div>

      <div className="cr-streak">
        {streak > 0 ? (
          <>
            <Flame size={12} className="streak-flame" />
            <span>{streak}w</span>
          </>
        ) : (
          <span className="cr-muted">—</span>
        )}
      </div>

      <div className="cr-status">
        <span
          className="cr-status-badge"
          style={{ background: statusBg, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      <div className={`cr-next-session${nextIsToday ? ' cr-next-session--today' : ''}`}>
        {nextSessionLabel ?? <span className="cr-muted">—</span>}
      </div>

      <div className="cr-arrow">
        <ChevronRight size={15} />
      </div>
    </button>
  )
}

// ── ClientsPage ───────────────────────────────────────────────────────────────

export default function ClientsPage({ onSelectClient, initialFilter = 'allActive' }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(initialFilter)

  const counts = useMemo(() => ({
    today:     clients.filter(c => isToday(c.nextSession)).length,
    week:      clients.filter(c => isThisWeek(c.nextSession)).length,
    allActive: clients.filter(c => c.status === 'active').length,
    inactive:  clients.filter(c => c.status === 'inactive').length,
    attention: clients.filter(c => c.attentionFlag).length,
    ending:    clients.filter(c => c.currentPlan && c.currentPlan.daysLeft <= 7).length,
  }), [])

  const FILTERS = [
    { key: 'today',     label: 'Today',             count: counts.today },
    { key: 'week',      label: 'This Week',         count: counts.week },
    { key: 'allActive', label: 'All Active',        count: counts.allActive },
    { key: 'inactive',  label: 'Inactive',          count: counts.inactive },
    { key: 'attention', label: 'Needs Attention',   count: counts.attention, accent: 'amber' },
    { key: 'ending',    label: 'Plans Ending Soon', count: counts.ending,    accent: 'red' },
  ]

  const filtered = useMemo(() => {
    let list = clients
    switch (filter) {
      case 'today':     list = list.filter(c => isToday(c.nextSession)); break
      case 'week':      list = list.filter(c => isThisWeek(c.nextSession)); break
      case 'allActive': list = list.filter(c => c.status === 'active'); break
      case 'inactive':  list = list.filter(c => c.status === 'inactive'); break
      case 'attention': list = list.filter(c => c.attentionFlag); break
      case 'ending':    list = list.filter(c => c.currentPlan && c.currentPlan.daysLeft <= 7); break
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          getServiceConfig(c.serviceType).label.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, filter])

  return (
    <div className="clients-page">
      <header className="clients-header">
        <div className="clients-title-group">
          <h1 className="clients-title">Clients</h1>
          <span className="clients-total-badge">{clients.length}</span>
        </div>
        <div className="clients-search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="clients-search"
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="clients-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-pill${filter === f.key ? ' active' : ''}${f.accent ? ` filter-pill--${f.accent}` : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="filter-pill-count">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="clients-list">
        <div className="clients-list-cols">
          <span />
          <span>Client</span>
          <span>Current Plan</span>
          <span>This Week</span>
          <span>Streak</span>
          <span>Status</span>
          <span>Next Session</span>
          <span />
        </div>

        {filtered.map(client => (
          <ClientRow
            key={client.id}
            client={client}
            onClick={() => onSelectClient(client.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="clients-empty">No clients match your search.</div>
        )}
      </div>
    </div>
  )
}
