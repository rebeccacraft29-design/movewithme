import StatCard from '../components/dashboard/StatCard'
import NeedsAttentionPanel from '../components/dashboard/NeedsAttentionPanel'
import SmartInsightsPanel from '../components/dashboard/SmartInsightsPanel'
import PlansEndingSoonPanel from '../components/dashboard/PlansEndingSoonPanel'
import CalendarPanel from '../components/dashboard/CalendarPanel'
import { getActiveClients, getClientsNeedingAttention, getClientsWithEndingPlans } from '../data/mockData'
import { Users, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import './Dashboard.css'

const today = new Date()
const dateStr = today.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const activeClients = getActiveClients()
const needsAttention = getClientsNeedingAttention()
const endingSoon = getClientsWithEndingPlans(7)

const overdueCount = needsAttention.filter(c => c.attentionFlag.tagType === 'overdue').length

const stats = [
  {
    label: 'Active Clients',
    value: String(activeClients.length),
    delta: '+2 this week',
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
    value: String(needsAttention.length),
    delta: overdueCount > 0 ? `${overdueCount} overdue` : 'No overdue clients',
    deltaPositive: false,
    icon: AlertCircle,
    accent: 'amber',
  },
  {
    label: 'Plans Ending Soon',
    value: String(endingSoon.length),
    delta: 'Within 7 days',
    deltaPositive: null,
    icon: Calendar,
    accent: 'coral',
  },
]

export default function Dashboard({ onNavigateToClients, onSelectClient }) {
  const statClicks = {
    'Active Clients':     () => onNavigateToClients?.('allActive'),
    'Needs Attention':    () => onNavigateToClients?.('attention'),
    'Plans Ending Soon':  () => onNavigateToClients?.('ending'),
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">{dateStr}</p>
          <h1 className="dashboard-greeting">Good morning, Rebecca 👋</h1>
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
          <NeedsAttentionPanel
            onSelectClient={onSelectClient}
            onViewAll={() => onNavigateToClients?.('attention')}
          />
          <SmartInsightsPanel />
        </div>
        <div className="panels-right">
          <CalendarPanel />
          <PlansEndingSoonPanel />
        </div>
      </div>
    </div>
  )
}
