import StatCard from '../components/dashboard/StatCard'
import NeedsAttentionPanel from '../components/dashboard/NeedsAttentionPanel'
import SmartInsightsPanel from '../components/dashboard/SmartInsightsPanel'
import PlansEndingSoonPanel from '../components/dashboard/PlansEndingSoonPanel'
import CalendarPanel from '../components/dashboard/CalendarPanel'
import { Users, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import './Dashboard.css'

const today = new Date()
const dateStr = today.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const stats = [
  {
    label: 'Active Clients',
    value: '24',
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
    value: '5',
    delta: '3 overdue check-ins',
    deltaPositive: false,
    icon: AlertCircle,
    accent: 'amber',
  },
  {
    label: 'Plans Ending Soon',
    value: '3',
    delta: 'Within 7 days',
    deltaPositive: null,
    icon: Calendar,
    accent: 'coral',
  },
]

export default function Dashboard() {
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
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-panels">
        <div className="panels-left">
          <NeedsAttentionPanel />
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
