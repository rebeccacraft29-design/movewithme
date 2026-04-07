import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart2,
  FileBarChart,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import './Sidebar.css'

// ── Nav config ────────────────────────────────────────────────────────────────

const navItems = [
  { id: 'programs',  label: 'Programs',  icon: ClipboardList },
  { id: 'progress',  label: 'Progress',  icon: BarChart2 },
  { id: 'reports',   label: 'Reports',   icon: FileBarChart },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare },
  { id: 'schedule',  label: 'Schedule',  icon: Calendar },
]

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar({ activePage, onNavigate, onLogout, unreadMessages = 0 }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} />
        </div>
        <span className="logo-text">MoveWithMe</span>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {/* Dashboard */}
          <li>
            <button
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          </li>

          {/* Clients */}
          <li>
            <button
              id="tour-clients"
              className={`nav-item ${activePage === 'clients' ? 'active' : ''}`}
              onClick={() => onNavigate('clients')}
            >
              <Users size={18} />
              <span>Clients</span>
            </button>
          </li>

          {/* Remaining nav items */}
          {navItems.map(({ id, label, icon: Icon }) => {
            const badge = id === 'messages' && unreadMessages > 0 ? unreadMessages : null
            return (
              <li key={id}>
                <button
                  id={id === 'programs' ? 'tour-programs' : undefined}
                  className={`nav-item ${activePage === id ? 'active' : ''}`}
                  onClick={() => onNavigate(id)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {badge && <span className="nav-badge">{badge}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <ul className="nav-list">
          {bottomItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                className={`nav-item ${activePage === id ? 'active' : ''}`}
                onClick={() => onNavigate(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            </li>
          ))}
          <li>
            <button className="nav-item nav-item--logout" onClick={onLogout}>
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </li>
        </ul>

        <div className="trainer-profile">
          <div className="trainer-avatar">
            <span>RC</span>
          </div>
          <div className="trainer-info">
            <p className="trainer-name">Rebecca Craft</p>
            <p className="trainer-role">Head Coach</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
