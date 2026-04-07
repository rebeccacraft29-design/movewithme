import { useState } from 'react'
import Landing from './pages/auth/Landing'
import Login from './pages/auth/Login'
import Onboarding from './pages/onboarding/Onboarding'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Progress from './pages/Progress'
import MessagesPage from './pages/Messages'
import Programs from './pages/Programs'
import NewSessionPanel from './components/NewSessionPanel'
import GuidedTour from './components/GuidedTour'
import { scheduleSessions } from './data/scheduleData'
import { defaultSessionTypes } from './data/sessionTypes'
import { initialConversations } from './data/messagesData'
import './App.css'

// appScreen: 'landing' | 'login' | 'onboarding' | 'app'

export default function App() {
  const [appScreen,      setAppScreen]      = useState('landing')
  const [userProfile,    setUserProfile]    = useState(null)
  const [showTour,       setShowTour]       = useState(false)

  const [activePage,      setActivePage]      = useState('dashboard')
  const [activeClientId,  setActiveClientId]  = useState(null)
  const [activeClientTab, setActiveClientTab] = useState('overview')
  const [clientsFilter,   setClientsFilter]   = useState('allActive')
  const [sessions,        setSessions]        = useState(scheduleSessions)
  const [sessionTypes,    setSessionTypes]    = useState(defaultSessionTypes)
  const [newSessionOpen,  setNewSessionOpen]  = useState(false)
  const [conversations,   setConversations]   = useState(initialConversations)

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  function handleSignUp(data) {
    setAppScreen('onboarding')
  }

  function handleLogin(data) {
    // Mock login — go straight to dashboard
    setUserProfile({ firstName: 'Rebecca' })
    setActivePage('dashboard')
    setAppScreen('app')
  }

  function handleOnboardingComplete(profile) {
    setUserProfile(profile)
    if (profile.startAction === 'tour') {
      setActivePage('dashboard')
      setAppScreen('app')
      // Small delay so dashboard is mounted before tour starts
      setTimeout(() => setShowTour(true), 300)
    } else if (profile.startAction === 'clients') {
      setActivePage('clients')
      setAppScreen('app')
    } else if (profile.startAction === 'programs') {
      setActivePage('programs')
      setAppScreen('app')
    } else {
      setActivePage('dashboard')
      setAppScreen('app')
    }
  }

  function handleLogout() {
    setUserProfile(null)
    setActivePage('dashboard')
    setAppScreen('landing')
  }

  function handleNavigate(page) {
    setActivePage(page)
    setActiveClientId(null)
  }

  function handleNavigateToClients(filter) {
    setClientsFilter(filter)
    setActivePage('clients')
    setActiveClientId(null)
  }

  function handleSelectClient(clientId, tab = 'overview') {
    setActiveClientId(clientId)
    setActiveClientTab(tab)
    setActivePage('clients')
  }

  // ── Auth / onboarding screens (no sidebar) ──────────────────────────────

  if (appScreen === 'landing') {
    return (
      <Landing
        onSignUp={handleSignUp}
        onLogin={() => setAppScreen('login')}
      />
    )
  }

  if (appScreen === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onSignUp={() => setAppScreen('landing')}
      />
    )
  }

  if (appScreen === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
      />
    )
  }

  // ── Main app ─────────────────────────────────────────────────────────────

  const knownPages = ['dashboard', 'clients', 'schedule', 'settings', 'reports', 'messages', 'progress', 'programs']

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        unreadMessages={unreadMessages}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard
            onNavigateToClients={handleNavigateToClients}
            onSelectClient={handleSelectClient}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'clients' && activeClientId === null && (
          <ClientsPage
            onSelectClient={handleSelectClient}
            initialFilter={clientsFilter}
          />
        )}

        {activePage === 'clients' && activeClientId !== null && (
          <ClientProfile
            clientId={activeClientId}
            sessions={sessions}
            initialTab={activeClientTab}
            onBack={() => setActiveClientId(null)}
          />
        )}

        {activePage === 'schedule' && (
          <Schedule
            sessions={sessions}
            setSessions={setSessions}
            sessionTypes={sessionTypes}
            onSelectClient={handleSelectClient}
            onOpenNewSession={() => setNewSessionOpen(true)}
          />
        )}

        {activePage === 'settings' && (
          <Settings
            sessionTypes={sessionTypes}
            setSessionTypes={setSessionTypes}
            onNavigate={handleNavigate}
          />
        )}

        {activePage === 'reports'  && <Reports />}
        {activePage === 'progress' && <Progress />}
        {activePage === 'programs' && <Programs />}

        {activePage === 'messages' && (
          <MessagesPage
            conversations={conversations}
            setConversations={setConversations}
          />
        )}

        {!knownPages.includes(activePage) && (
          <div className="coming-soon">
            <h2>Coming Soon</h2>
            <p>This section is under construction.</p>
          </div>
        )}
      </main>

      {/* ── Global floating action button ── */}
      <button
        id="tour-fab"
        className="global-fab"
        onClick={() => setNewSessionOpen(true)}
        title="New session"
        aria-label="New session"
      >
        +
      </button>

      {/* ── Global new session panel ── */}
      {newSessionOpen && (
        <NewSessionPanel
          sessions={sessions}
          setSessions={setSessions}
          sessionTypes={sessionTypes}
          onClose={() => setNewSessionOpen(false)}
        />
      )}

      {/* ── Guided tour ── */}
      {showTour && (
        <GuidedTour onEnd={() => setShowTour(false)} />
      )}
    </div>
  )
}
