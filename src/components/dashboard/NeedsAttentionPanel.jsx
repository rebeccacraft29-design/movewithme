import { AlertCircle, MessageSquare, RefreshCw, ChevronRight } from 'lucide-react'
import './NeedsAttentionPanel.css'

const clients = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    initials: 'SM',
    issue: 'Missed 3 workouts this week',
    tag: 'Overdue',
    tagType: 'overdue',
    lastSeen: '4 days ago',
    avatar: null,
  },
  {
    id: 2,
    name: 'Marcus Lee',
    initials: 'ML',
    issue: 'No check-in logged since Monday',
    tag: 'Check-in due',
    tagType: 'checkin',
    lastSeen: '5 days ago',
    avatar: null,
  },
  {
    id: 3,
    name: 'Priya Nair',
    initials: 'PN',
    issue: 'Reported knee pain in last log',
    tag: 'Health flag',
    tagType: 'health',
    lastSeen: '2 days ago',
    avatar: null,
  },
  {
    id: 4,
    name: 'Tom Richter',
    initials: 'TR',
    issue: 'Completion rate dropped to 40%',
    tag: 'Low effort',
    tagType: 'effort',
    lastSeen: '1 day ago',
    avatar: null,
  },
  {
    id: 5,
    name: 'Elena Vasquez',
    initials: 'EV',
    issue: 'Asked about nutrition plan update',
    tag: 'Message',
    tagType: 'message',
    lastSeen: '3 hours ago',
    avatar: null,
  },
]

const tagColors = {
  overdue:  { bg: 'rgba(255,107,91,0.12)', color: '#FF6B5B' },
  checkin:  { bg: 'rgba(255,167,51,0.12)', color: '#FFA733' },
  health:   { bg: 'rgba(255,100,100,0.12)', color: '#FF6464' },
  effort:   { bg: 'rgba(255,167,51,0.12)', color: '#FFA733' },
  message:  { bg: 'rgba(46,196,160,0.12)', color: '#2EC4A0' },
}

const avatarColors = [
  'linear-gradient(135deg,#FF6B5B,#FFA733)',
  'linear-gradient(135deg,#FFA733,#2EC4A0)',
  'linear-gradient(135deg,#2EC4A0,#6C63FF)',
  'linear-gradient(135deg,#FF6B5B,#6C63FF)',
  'linear-gradient(135deg,#6C63FF,#2EC4A0)',
]

export default function NeedsAttentionPanel() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <AlertCircle size={16} color="var(--amber)" />
          <h2 className="panel-title">Needs Attention</h2>
          <span className="panel-count">{clients.length}</span>
        </div>
        <button className="panel-action-btn">View all</button>
      </div>

      <div className="attention-list">
        {clients.map((client, i) => {
          const tag = tagColors[client.tagType]
          return (
            <div key={client.id} className="attention-item">
              <div
                className="client-avatar"
                style={{ background: avatarColors[i % avatarColors.length] }}
              >
                {client.initials}
              </div>
              <div className="client-details">
                <div className="client-name-row">
                  <span className="client-name">{client.name}</span>
                  <span
                    className="client-tag"
                    style={{ background: tag.bg, color: tag.color }}
                  >
                    {client.tag}
                  </span>
                </div>
                <p className="client-issue">{client.issue}</p>
                <p className="client-last-seen">Last active: {client.lastSeen}</p>
              </div>
              <div className="client-actions">
                <button className="icon-btn" title="Send message">
                  <MessageSquare size={14} />
                </button>
                <button className="icon-btn" title="Update plan">
                  <RefreshCw size={14} />
                </button>
                <button className="icon-btn icon-btn--chevron" title="View profile">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
