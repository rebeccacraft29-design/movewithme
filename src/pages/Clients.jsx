import { useState, useMemo, useEffect, useRef } from 'react'
import { Flame, ChevronRight, SlidersHorizontal, GripVertical, X } from 'lucide-react'
import { getServiceConfig } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { getClients } from '../lib/db'
import SearchDropdown from '../components/SearchDropdown'
import './Clients.css'

// ── Date helpers ──────────────────────────────────────────────────────────────

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
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  return d >= today && d < tomorrow
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const monday = getMondayOfWeek(new Date())
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23, 59, 59, 999)
  const d = new Date(dateStr + 'T00:00:00')
  return d >= monday && d <= sunday
}

function formatNextSession(dateStr) {
  if (!dateStr) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
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

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMN_DEFS = {
  plan:        { label: 'Current Plan',  width: '2fr'   },
  completion:  { label: 'This Week',    width: '170px' },
  streak:      { label: 'Streak',       width: '70px'  },
  status:      { label: 'Status',       width: '120px' },
  nextSession: { label: 'Next Session', width: '110px' },
}

const DEFAULT_COL_ORDER = ['plan', 'completion', 'streak', 'status', 'nextSession']

function buildGrid(colOrder) {
  return `44px 2fr ${colOrder.map(k => COLUMN_DEFS[k].width).join(' ')} 28px`
}

// ── Accordion groups ──────────────────────────────────────────────────────────

const GROUPS = [
  { key: 'allActive', label: 'All Active',        filter: c => c.status === 'active',                        accent: null  },
  { key: 'today',     label: 'Today',             filter: c => isToday(c.nextSession),                       accent: null  },
  { key: 'week',      label: 'This Week',         filter: c => isThisWeek(c.nextSession),                    accent: null  },
  { key: 'attention', label: 'Needs Attention',   filter: c => !!c.attentionFlag,                            accent: 'amber' },
  { key: 'ending',    label: 'Plans Ending Soon', filter: c => c.currentPlan && c.currentPlan.daysLeft <= 7, accent: 'red' },
  { key: 'inactive',  label: 'Inactive',          filter: c => c.status === 'inactive',                      accent: null  },
]

// ── Style constants ───────────────────────────────────────────────────────────

const SERVICE_COLORS = {
  personal_trainer:  { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  physiotherapist:   { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
  massage_therapist: { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  chiropractor:      { bg: 'rgba(108,99,255,0.12)',  color: '#6C63FF' },
  other:             { bg: 'rgba(144,144,176,0.12)', color: '#9090B0' },
}

const ATTENTION_COLORS = {
  overdue: { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  checkin: { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  health:  { bg: 'rgba(255,100,100,0.12)', color: '#FF6464' },
  effort:  { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  message: { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
}

// ── ClientRow ─────────────────────────────────────────────────────────────────

function ClientRow({ client, onClick, columnOrder }) {
  const svcConfig = getServiceConfig(client.serviceType)
  const svcColors = SERVICE_COLORS[client.serviceType] ?? SERVICE_COLORS.other
  const completion = getThisWeekCompletion(client)
  const streak = getStreak(client)
  const flag = client.attentionFlag
  const planEndingSoon = !flag && client.currentPlan && client.currentPlan.daysLeft <= 7

  const weekNum    = client.currentPlan ? getWeekInPlan(client.currentPlan.startDate) : null
  const totalWeeks = client.currentPlan ? getTotalPlanWeeks(client.currentPlan.startDate, client.currentPlan.endDate) : null

  let statusBg, statusColor, statusLabel
  if (client.status === 'inactive') {
    statusBg = 'rgba(144,144,176,0.12)'; statusColor = '#9090B0'; statusLabel = 'Inactive'
  } else if (flag) {
    const ac = ATTENTION_COLORS[flag.tagType] ?? ATTENTION_COLORS.checkin
    statusBg = ac.bg; statusColor = ac.color; statusLabel = flag.tag
  } else if (planEndingSoon) {
    statusBg = 'rgba(255,167,51,0.12)'; statusColor = '#FFA733'; statusLabel = `${client.currentPlan.daysLeft}d left`
  } else {
    statusBg = 'rgba(46,196,160,0.12)'; statusColor = '#2EC4A0'; statusLabel = 'Active'
  }

  let barGradient = 'linear-gradient(90deg,#2EC4A0,#4DD4B3)'
  if (completion !== null && completion < 75) barGradient = 'linear-gradient(90deg,#FFA733,#FFB955)'
  if (completion !== null && completion < 40) barGradient = 'linear-gradient(90deg,#FF6B5B,#FF8A7D)'

  const nextSessionLabel = formatNextSession(client.nextSession)
  const nextIsToday = isToday(client.nextSession)

  const cells = {
    plan: (
      <div className="cr-plan" key="plan">
        {client.currentPlan ? (
          <>
            <span className="cr-plan-name">{client.currentPlan.name}</span>
            <span className="cr-plan-week">Wk {weekNum} of {totalWeeks}</span>
          </>
        ) : (
          <span className="cr-muted">No active plan</span>
        )}
      </div>
    ),
    completion: (
      <div className="cr-completion" key="completion">
        {completion !== null ? (
          <>
            <div className="cr-progress-track">
              <div className="cr-progress-fill" style={{ width: `${completion}%`, background: barGradient }} />
            </div>
            <span className="cr-completion-pct">{completion}%</span>
          </>
        ) : (
          <span className="cr-muted">—</span>
        )}
      </div>
    ),
    streak: (
      <div className="cr-streak" key="streak">
        {streak > 0 ? (
          <><Flame size={12} className="streak-flame" /><span>{streak}w</span></>
        ) : (
          <span className="cr-muted">—</span>
        )}
      </div>
    ),
    status: (
      <div className="cr-status" key="status">
        <span className="cr-status-badge" style={{ background: statusBg, color: statusColor }}>
          {statusLabel}
        </span>
      </div>
    ),
    nextSession: (
      <div className={`cr-next-session${nextIsToday ? ' cr-next-session--today' : ''}`} key="nextSession">
        {nextSessionLabel ?? <span className="cr-muted">—</span>}
      </div>
    ),
  }

  return (
    <button
      className="client-row"
      onClick={onClick}
      style={{ gridTemplateColumns: buildGrid(columnOrder) }}
    >
      <div className="cr-avatar" style={{ background: client.avatarGrad }}>{client.initials}</div>
      <div className="cr-identity">
        <span className="cr-name">{client.name}</span>
        <span className="cr-service-badge" style={{ background: svcColors.bg, color: svcColors.color }}>
          {svcConfig.label}
        </span>
      </div>
      {columnOrder.map(k => cells[k])}
      <div className="cr-arrow"><ChevronRight size={15} /></div>
    </button>
  )
}

// ── Column settings panel ─────────────────────────────────────────────────────

function ColumnSettings({ columnOrder, setColumnOrder, onClose }) {
  const [dragIdx, setDragIdx] = useState(null)

  function handleDrop(dropIdx) {
    if (dragIdx === null || dragIdx === dropIdx) return setDragIdx(null)
    const next = [...columnOrder]
    const [item] = next.splice(dragIdx, 1)
    next.splice(dropIdx, 0, item)
    setColumnOrder(next)
    setDragIdx(null)
  }

  return (
    <div className="col-settings-panel">
      <div className="col-settings-header">
        <span className="col-settings-title">Customize Columns</span>
        <button className="col-settings-close" onClick={onClose}><X size={14} /></button>
      </div>
      <p className="col-settings-hint">Drag to reorder</p>
      <ul className="col-settings-list">
        {columnOrder.map((key, idx) => (
          <li
            key={key}
            className={`col-settings-item${dragIdx === idx ? ' col-settings-item--dragging' : ''}`}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            onDragEnd={() => setDragIdx(null)}
          >
            <GripVertical size={14} className="col-drag-handle" />
            <span>{COLUMN_DEFS[key].label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── ClientsPage ───────────────────────────────────────────────────────────────

export default function ClientsPage({ onSelectClient, initialFilter = 'allActive' }) {
  const { trainer } = useAuth()
  const [clients,         setClients]         = useState([])
  const [activeFilter,    setActiveFilter]    = useState(initialFilter)
  const [columnOrder,     setColumnOrder]     = useState(DEFAULT_COL_ORDER)
  const [colSettingsOpen, setColSettingsOpen] = useState(false)
  const colSettingsRef = useRef(null)

  // Load clients from Supabase
  useEffect(() => {
    if (!trainer?.id) return
    getClients(trainer.id).then(setClients)
  }, [trainer?.id])

  // Sync active filter when navigating from sidebar dropdown
  useEffect(() => {
    setActiveFilter(initialFilter)
  }, [initialFilter])

  // Close column settings on outside click
  useEffect(() => {
    if (!colSettingsOpen) return
    function handleOutside(e) {
      if (colSettingsRef.current && !colSettingsRef.current.contains(e.target)) {
        setColSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [colSettingsOpen])

  const filteredClients = useMemo(() => {
    const group = GROUPS.find(g => g.key === activeFilter) ?? GROUPS[0]
    return clients.filter(group.filter)
  }, [activeFilter, clients])

  const colHeader = (
    <div className="clients-list-cols" style={{ gridTemplateColumns: buildGrid(columnOrder) }}>
      <span />
      <span>Client</span>
      {columnOrder.map(k => <span key={k}>{COLUMN_DEFS[k].label}</span>)}
      <span />
    </div>
  )

  return (
    <div className="clients-page">
      <header className="clients-header">
        <div className="clients-title-group">
          <h1 className="clients-title">Clients</h1>
          <span className="clients-total-badge">{clients.length}</span>
        </div>

        <div className="clients-header-actions">
          <SearchDropdown
            items={clients}
            onSelect={onSelectClient}
            placeholder="Search all clients…"
            searchPlaceholder="Search clients…"
          />

          <div className="col-settings-wrap" ref={colSettingsRef}>
            <button
              className={`col-settings-btn${colSettingsOpen ? ' active' : ''}`}
              onClick={() => setColSettingsOpen(o => !o)}
              title="Customize columns"
            >
              <SlidersHorizontal size={15} />
            </button>
            {colSettingsOpen && (
              <ColumnSettings
                columnOrder={columnOrder}
                setColumnOrder={setColumnOrder}
                onClose={() => setColSettingsOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      <div className="clients-filters">
        {GROUPS.map(group => {
          const count = clients.filter(group.filter).length
          return (
            <button
              key={group.key}
              className={`filter-pill${group.accent ? ` filter-pill--${group.accent}` : ''}${activeFilter === group.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(group.key)}
            >
              {group.label}
              <span className="filter-pill-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="clients-list">
        {colHeader}
        {filteredClients.length > 0
          ? filteredClients.map(client => (
              <ClientRow
                key={client.id}
                client={client}
                onClick={() => onSelectClient(client.id)}
                columnOrder={columnOrder}
              />
            ))
          : <div className="clients-empty">No clients in this group.</div>
        }
      </div>
    </div>
  )
}
