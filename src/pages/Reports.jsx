import {
  Sparkles, TrendingUp, TrendingDown, Lightbulb, AlertTriangle,
  BarChart2, Users, Calendar, Zap,
} from 'lucide-react'
import './Reports.css'

const accentMap = {
  coral: { icon: '#FF6B5B', bg: 'rgba(255,107,91,0.1)', border: 'rgba(255,107,91,0.2)' },
  amber: { icon: '#FFA733', bg: 'rgba(255,167,51,0.1)', border: 'rgba(255,167,51,0.2)' },
  teal:  { icon: '#2EC4A0', bg: 'rgba(46,196,160,0.1)', border: 'rgba(46,196,160,0.2)' },
}

const patternGroups = [
  {
    id: 'session',
    label: 'Session Patterns',
    icon: Calendar,
    patterns: [
      {
        id: 1,
        icon: TrendingUp,
        title: 'Monday sessions are your most completed',
        body: '87% of Monday workouts logged on time across your client base. Consider scheduling heavier sessions then.',
        accent: 'teal',
        stat: '87%',
        statLabel: 'completion',
      },
      {
        id: 2,
        icon: TrendingDown,
        title: 'Friday dropout rate is 2× the weekly average',
        body: '6 clients skipped their Friday sessions in the last 2 weeks. Lighter programming or rest days may help.',
        accent: 'amber',
        stat: '2×',
        statLabel: 'dropout rate',
      },
      {
        id: 3,
        icon: TrendingDown,
        title: 'Average rest time between sessions is increasing',
        body: 'Your clients are averaging 3.4 rest days vs 2.1 last month. Could signal fatigue or motivation dip.',
        accent: 'amber',
        stat: '+1.3d',
        statLabel: 'avg rest',
      },
      {
        id: 4,
        icon: TrendingUp,
        title: 'Morning sessions have a 91% show rate',
        body: 'Sessions scheduled before 9 am have the highest attendance of any time slot across all clients.',
        accent: 'teal',
        stat: '91%',
        statLabel: 'show rate',
      },
    ],
  },
  {
    id: 'engagement',
    label: 'Client Engagement',
    icon: Users,
    patterns: [
      {
        id: 5,
        icon: Lightbulb,
        title: 'Clients who log mood complete 23% more sessions',
        body: 'Prompting clients to log mood before workouts correlates with higher follow-through. Try enabling mood check-ins.',
        accent: 'coral',
        stat: '+23%',
        statLabel: 'sessions done',
      },
      {
        id: 6,
        icon: TrendingUp,
        title: 'Check-in messages boost next-session attendance',
        body: 'Clients who received a message within 24 hours of a missed session showed up 68% of the time the following week.',
        accent: 'teal',
        stat: '68%',
        statLabel: 'recovery rate',
      },
      {
        id: 7,
        icon: AlertTriangle,
        title: '3 clients have not logged in for over 7 days',
        body: 'Inactive app users tend to miss their next session at 2× the rate. A quick check-in message may help re-engage them.',
        accent: 'amber',
        stat: '3',
        statLabel: 'at risk',
      },
    ],
  },
  {
    id: 'performance',
    label: 'Performance Trends',
    icon: BarChart2,
    patterns: [
      {
        id: 8,
        icon: TrendingUp,
        title: 'Strength metrics up 12% across active clients',
        body: "Clients on structured strength programs this quarter are logging heavier lifts compared to last quarter's cohort.",
        accent: 'teal',
        stat: '+12%',
        statLabel: 'strength gains',
      },
      {
        id: 9,
        icon: Lightbulb,
        title: 'HIIT sessions generate the most post-session ratings',
        body: 'HIIT clients rate sessions 4.2 on average — the highest of any session type — and often include positive notes.',
        accent: 'coral',
        stat: '4.2★',
        statLabel: 'avg rating',
      },
      {
        id: 10,
        icon: TrendingDown,
        title: 'Plan completion rate dips in week 3',
        body: 'Across all programs, week 3 sees the steepest drop in session completions. Consider a lighter deload week at this point.',
        accent: 'amber',
        stat: 'Week 3',
        statLabel: 'dropout peak',
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI Recommendations',
    icon: Zap,
    patterns: [
      {
        id: 11,
        icon: Lightbulb,
        title: 'Consider adding a rest-day habit for high-frequency clients',
        body: '4 clients are training 5+ days per week. Adding a structured rest-day check-in habit may reduce injury risk and improve retention.',
        accent: 'coral',
        stat: '4',
        statLabel: 'clients affected',
      },
      {
        id: 12,
        icon: Lightbulb,
        title: 'Renewal conversations are most effective at week 6',
        body: 'Clients whose plans were renewed in week 6–7 had a 94% retention rate vs 61% when renewals happened in the final week.',
        accent: 'teal',
        stat: '94%',
        statLabel: 'retention',
      },
    ],
  },
]

export default function Reports() {
  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">AI-detected patterns across your client base</p>
        </div>
        <span className="reports-ai-badge">
          <Sparkles size={12} />
          AI Insights
        </span>
      </header>

      <div className="reports-groups">
        {patternGroups.map((group) => {
          const GroupIcon = group.icon
          return (
            <section key={group.id} className="reports-group">
              <div className="reports-group-header">
                <GroupIcon size={15} className="reports-group-icon" />
                <h2 className="reports-group-title">{group.label}</h2>
                <span className="reports-group-count">{group.patterns.length}</span>
              </div>

              <div className="reports-cards">
                {group.patterns.map((pattern) => {
                  const Icon = pattern.icon
                  const colors = accentMap[pattern.accent]
                  return (
                    <div key={pattern.id} className="report-card">
                      <div className="report-card-top">
                        <div
                          className="report-icon-wrap"
                          style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.icon }}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="report-stat">
                          <span className="report-stat-value" style={{ color: colors.icon }}>{pattern.stat}</span>
                          <span className="report-stat-label">{pattern.statLabel}</span>
                        </div>
                      </div>
                      <p className="report-card-title">{pattern.title}</p>
                      <p className="report-card-body">{pattern.body}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
