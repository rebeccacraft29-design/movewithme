import './StatCard.css'

const accentColors = {
  coral: { bg: 'rgba(255,107,91,0.12)', icon: '#FF6B5B', glow: 'rgba(255,107,91,0.2)' },
  amber: { bg: 'rgba(255,167,51,0.12)', icon: '#FFA733', glow: 'rgba(255,167,51,0.2)' },
  teal:  { bg: 'rgba(46,196,160,0.12)', icon: '#2EC4A0', glow: 'rgba(46,196,160,0.2)' },
}

export default function StatCard({ label, value, delta, deltaPositive, icon: Icon, accent, onClick }) {
  const colors = accentColors[accent] || accentColors.coral
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag className={`stat-card${onClick ? ' stat-card--clickable' : ''}`} onClick={onClick}>
      <div className="stat-card-top">
        <div
          className="stat-icon"
          style={{ background: colors.bg, color: colors.icon, boxShadow: `0 0 0 1px ${colors.glow}` }}
        >
          <Icon size={18} />
        </div>
        <p className="stat-label">{label}</p>
      </div>
      <p className="stat-value">{value}</p>
      {delta && (
        <p
          className={`stat-delta ${
            deltaPositive === true ? 'positive' : deltaPositive === false ? 'negative' : 'neutral'
          }`}
        >
          {delta}
        </p>
      )}
    </Tag>
  )
}
