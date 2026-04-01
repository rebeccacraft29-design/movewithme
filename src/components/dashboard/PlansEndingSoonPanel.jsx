import { Calendar, ArrowRight, RefreshCw } from 'lucide-react'
import './PlansEndingSoonPanel.css'

const plans = [
  {
    id: 1,
    name: 'Alex Turner',
    initials: 'AT',
    plan: '12-Week Strength Build',
    daysLeft: 3,
    progress: 92,
    avatarGrad: 'linear-gradient(135deg,#FF6B5B,#FFA733)',
  },
  {
    id: 2,
    name: 'Keiko Tanaka',
    initials: 'KT',
    plan: 'Summer Shred Program',
    daysLeft: 5,
    progress: 85,
    avatarGrad: 'linear-gradient(135deg,#FFA733,#2EC4A0)',
  },
  {
    id: 3,
    name: 'Damien Cross',
    initials: 'DC',
    plan: 'Mobility & Recovery',
    daysLeft: 7,
    progress: 78,
    avatarGrad: 'linear-gradient(135deg,#2EC4A0,#6C63FF)',
  },
]

function urgencyColor(days) {
  if (days <= 3) return { color: '#FF6B5B', bg: 'rgba(255,107,91,0.12)' }
  if (days <= 5) return { color: '#FFA733', bg: 'rgba(255,167,51,0.12)' }
  return { color: '#2EC4A0', bg: 'rgba(46,196,160,0.12)' }
}

export default function PlansEndingSoonPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Calendar size={16} color="var(--coral)" />
          <h2 className="panel-title">Plans Ending Soon</h2>
        </div>
      </div>

      <div className="plans-list">
        {plans.map((client) => {
          const urgency = urgencyColor(client.daysLeft)
          return (
            <div key={client.id} className="plan-item">
              <div
                className="plan-avatar"
                style={{ background: client.avatarGrad }}
              >
                {client.initials}
              </div>

              <div className="plan-details">
                <div className="plan-name-row">
                  <span className="plan-client-name">{client.name}</span>
                  <span
                    className="plan-days-badge"
                    style={{ color: urgency.color, background: urgency.bg }}
                  >
                    {client.daysLeft}d left
                  </span>
                </div>

                <p className="plan-name">{client.plan}</p>

                <div className="plan-progress-row">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${client.progress}%`,
                        background: `linear-gradient(90deg, var(--coral), var(--amber))`,
                      }}
                    />
                  </div>
                  <span className="progress-pct">{client.progress}%</span>
                </div>
              </div>

              <div className="plan-actions">
                <button className="plan-btn plan-btn--renew" title="Renew plan">
                  <RefreshCw size={13} />
                </button>
                <button className="plan-btn plan-btn--view" title="View plan">
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="panel-footer">
        <button className="panel-footer-btn">
          <Calendar size={13} />
          <span>Create renewal reminders</span>
        </button>
      </div>
    </div>
  )
}
