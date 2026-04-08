import { AlertCircle, MessageSquare, RefreshCw, ChevronRight } from 'lucide-react'
import './NeedsAttentionPanel.css'

const tagColors = {
  overdue:  { bg: 'rgba(255,107,91,0.12)', color: '#FF6B5B' },
  checkin:  { bg: 'rgba(255,167,51,0.12)', color: '#FFA733' },
  health:   { bg: 'rgba(255,100,100,0.12)', color: '#FF6464' },
  effort:   { bg: 'rgba(255,167,51,0.12)', color: '#FFA733' },
  message:  { bg: 'rgba(46,196,160,0.12)', color: '#2EC4A0' },
}

export default function NeedsAttentionPanel({ clients = [], loading = false, onSelectClient, onViewAll }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <AlertCircle size={16} color="var(--amber)" />
          <h2 className="panel-title">Needs Attention</h2>
          <span className="panel-count">{loading ? '—' : clients.length}</span>
        </div>
        <button className="panel-action-btn" onClick={onViewAll}>View all</button>
      </div>

      <div className="attention-list">
        {loading && (
          <p className="panel-loading">Loading…</p>
        )}
        {!loading && clients.length === 0 && (
          <p className="panel-empty">All clients are on track 🎉</p>
        )}
        {!loading && clients.map((client) => {
          const flag = client.attentionFlag
          const tag  = tagColors[flag.tagType] ?? tagColors.checkin
          return (
            <div
              key={client.id}
              className={`attention-item${onSelectClient ? ' attention-item--clickable' : ''}`}
              onClick={() => onSelectClient?.(client.id)}
            >
              <div className="client-avatar" style={{ background: client.avatarGrad }}>
                {client.initials}
              </div>
              <div className="client-details">
                <div className="client-name-row">
                  <span className="client-name">{client.name}</span>
                  <span className="client-tag" style={{ background: tag.bg, color: tag.color }}>
                    {flag.tag}
                  </span>
                </div>
                <p className="client-issue">{flag.issue}</p>
                <p className="client-last-seen">Last active: {client.lastSeen ?? 'Unknown'}</p>
              </div>
              <div className="client-actions">
                <button className="icon-btn" title="Send message" onClick={e => e.stopPropagation()}>
                  <MessageSquare size={14} />
                </button>
                <button className="icon-btn" title="Update plan" onClick={e => e.stopPropagation()}>
                  <RefreshCw size={14} />
                </button>
                <button
                  className="icon-btn icon-btn--chevron"
                  title="View profile"
                  onClick={e => { e.stopPropagation(); onSelectClient?.(client.id) }}
                >
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
