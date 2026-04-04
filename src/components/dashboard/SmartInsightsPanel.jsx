import { Sparkles, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react'
import './SmartInsightsPanel.css'

const insights = [
  {
    id: 1,
    type: 'trend-up',
    icon: TrendingUp,
    title: 'Monday sessions are your most completed',
    body: '87% of Monday workouts logged on time across your client base. Consider scheduling heavier sessions then.',
    accent: 'teal',
  },
  {
    id: 2,
    type: 'trend-down',
    icon: TrendingDown,
    title: 'Friday dropout rate is 2× the weekly average',
    body: '6 clients skipped their Friday sessions in the last 2 weeks. Lighter programming or rest days may help.',
    accent: 'amber',
  },
  {
    id: 3,
    type: 'insight',
    icon: Lightbulb,
    title: 'Clients who log mood also complete 23% more sessions',
    body: 'Prompting clients to log mood before workouts correlates with higher follow-through. Try enabling mood check-ins.',
    accent: 'coral',
  },
  {
    id: 4,
    type: 'alert',
    icon: AlertTriangle,
    title: 'Average rest time between sessions is increasing',
    body: 'Your clients are averaging 3.4 rest days vs 2.1 last month. Could signal fatigue or motivation dip.',
    accent: 'amber',
  },
]

const accentMap = {
  coral: { icon: '#FF6B5B', bg: 'rgba(255,107,91,0.1)', border: 'rgba(255,107,91,0.2)' },
  amber: { icon: '#FFA733', bg: 'rgba(255,167,51,0.1)', border: 'rgba(255,167,51,0.2)' },
  teal:  { icon: '#2EC4A0', bg: 'rgba(46,196,160,0.1)', border: 'rgba(46,196,160,0.2)' },
}

export default function SmartInsightsPanel({ onNavigate }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Sparkles size={16} color="var(--coral)" />
          <h2 className="panel-title">Smart Insights</h2>
          <span className="insights-badge">AI</span>
        </div>
        <button className="panel-action-btn" onClick={() => onNavigate?.('reports')}>See all patterns</button>
      </div>

      <div className="insights-list">
        {insights.map((insight) => {
          const Icon = insight.icon
          const colors = accentMap[insight.accent]
          return (
            <div key={insight.id} className="insight-item">
              <div
                className="insight-icon-wrap"
                style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.icon }}
              >
                <Icon size={15} />
              </div>
              <div className="insight-body">
                <p className="insight-title">{insight.title}</p>
                <p className="insight-desc">{insight.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
