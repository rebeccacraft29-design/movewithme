import { useState, useEffect } from 'react'
import StatCard from '../components/dashboard/StatCard'
import NeedsAttentionPanel from '../components/dashboard/NeedsAttentionPanel'
import SmartInsightsPanel from '../components/dashboard/SmartInsightsPanel'
import PlansEndingSoonPanel from '../components/dashboard/PlansEndingSoonPanel'
import CalendarPanel from '../components/dashboard/CalendarPanel'
import { useAuth } from '../context/AuthContext'
import { getActiveClients, getClientsNeedingAttention, getClientsWithEndingPlans } from '../lib/db'
import { Users, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import './Dashboard.css'

const today = new Date()
const dateStr = today.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export default function Dashboard({ onNavigateToClients, onSelectClient, onNavigate }) {
  const { trainer } = useAuth()
  const firstName = trainer?.full_name?.split(' ')[0] ?? 'there'

  const [activeClients,  setActiveClients]  = useState([])
  const [needsAttention, setNeedsAttention] = useState([])
  const [endingSoon,     setEndingSoon]     = useState([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    if (!trainer?.id) return
    Promise.all([
      getActiveClients(trainer.id),
      getClientsNeedingAttention(trainer.id),
      getClientsWithEndingPlans(trainer.id, 7),
    ]).then(([active, attention, ending]) => {
      setActiveClients(active)
      setNeedsAttention(attention)
      setEndingSoon(ending)
      setLoading(false)
    })
  }, [trainer?.id])

  const overdueCount = needsAttention.filter(c => c.attentionFlag?.tagType === 'overdue').length

  const stats = [
    {
      label: 'Active Clients',
      value: loading ? '—' : String(activeClients.length),
      delta: loading ? '' : `${activeClients.length} total`,
      deltaPositive: true,
      icon: Users,
      accent: 'coral',
    },
    {
      label: 'Avg. Completion Rate',
      value: '78%',
      delta: '+5% vs last month',
      deltaPositive: true,
      icon: TrendingUp,
      accent: 'teal',
    },
    {
      label: 'Needs Attention',
      value: loading ? '—' : String(needsAttention.length),
      delta: overdueCount > 0 ? `${overdueCount} overdue` : 'No overdue clients',
      deltaPositive: false,
      icon: AlertCircle,
      accent: 'amber',
    },
    {
      label: 'Plans Ending Soon',
      value: loading ? '—' : String(endingSoon.length),
      delta: 'Within 7 days',
      deltaPositive: null,
      icon: Calendar,
      accent: 'coral',
    },
  ]

  const statClicks = {
    'Active Clients':     () => onNavigateToClients?.('allActive'),
    'Needs Attention':    () => onNavigateToClients?.('attention'),
    'Plans Ending Soon':  () => onNavigateToClients?.('ending'),
  }

  return (
    <div className="dashboard">
      <header id="tour-dashboard" className="dashboard-header">
        <div>
          <p className="dashboard-date">{dateStr}</p>
          <h1 className="dashboard-greeting">Good morning, {firstName} 👋</h1>
          <p className="dashboard-subtitle">Here's what needs your attention today.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} onClick={statClicks[stat.label]} />
        ))}
      </div>

      <div className="dashboard-panels">
        <div className="panels-left">
          <div id="tour-attention">
            <NeedsAttentionPanel
              clients={needsAttention}
              loading={loading}
              onSelectClient={onSelectClient}
              onViewAll={() => onNavigateToClients?.('attention')}
            />
          </div>
          <SmartInsightsPanel onNavigate={onNavigate} />
        </div>
        <div className="panels-right">
          <CalendarPanel />
          <PlansEndingSoonPanel
            clients={endingSoon}
            loading={loading}
            onSelectClient={onSelectClient}
          />
        </div>
      </div>
    </div>
  )
}
