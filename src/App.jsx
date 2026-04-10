import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
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
import { defaultSessionTypes } from './data/sessionTypes'
import { getScheduleSessions } from './lib/db'
import './App.css'

export default function App() {
  const { user, trainer, loading, trainerLoading, signOut, refreshTrainer } = useAuth()

  // Show Landing (sign-up) screen from Login's "Sign up" link
  const [showLanding, setShowLanding] = useState(false)

  // App-level state
  const [activePage,          setActivePage]          = useState('dashboard')
  const [activeClientId,      setActiveClientId]      = useState(null)
  const [activeClientTab,     setActiveClientTab]     = useState('overview')
  const [clientsFilter,       setClientsFilter]       = useState('allActive')
  const [sessionTypes,        setSessionTypes]        = useState(defaultSessionTypes)
  const [newSessionOpen,      setNewSessionOpen]      = useState(false)
  const [showTour,            setShowTour]            = useState(false)

  // Schedule sessions — loaded from Supabase, shared with Schedule + ClientProfile
  const [sessions,    setSessions]    = useState([])
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  // Reload sessions whenever the trainer changes (login/logout)
  useEffect(() => {
    if (!trainer?.id) { setSessions([]); setSessionsLoaded(false); return }
    getScheduleSessions(trainer.id).then(rows => {
      setSessions(rows)
      setSessionsLoaded(true)
    })
  }, [trainer?.id])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleOnboardingComplete(profile) {
    const action = profile.startAction
    if (action === 'tour') {
      setActivePage('dashboard')
      setTimeout(() => setShowTour(true), 300)
    } else if (action === 'clients') {
      setActivePage('clients')
    } else if (action === 'programs') {
      setActivePage('programs')
    } else {
      setActivePage('dashboard')
    }
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

  function handleSessionAdded(newSession) {
    setSessions(prev => [...prev, newSession])
  }

  function handleSessionsChange(updated) {
    setSessions(updated)
  }

  // ── Login screen — always the entry point ──────────────────────────────────
  // Shown during initial session check (loading), while fetching the trainer
  // row (trainerLoading), and when the user is not signed in (!user).
  // Session restore auto-navigates once loading + trainerLoading resolve.
  // Logout resets user → null → returns here.

  if (loading || trainerLoading || !user) {
    if (showLanding) {
      return (
        <Landing
          onSignUp={() => setShowLanding(false)}
          onLogin={() => setShowLanding(false)}
        />
      )
    }
    return (
      <Login
        onLogin={() => {}}
        onSignUp={() => setShowLanding(true)}
      />
    )
  }

  // ── Authenticated but onboarding not complete ──────────────────────────────

  if (!trainer?.onboarding_completed) {
    return (
      <Onboarding
        user={user}
        onComplete={handleOnboardingComplete}
      />
    )
  }

  // ── Main app ───────────────────────────────────────────────────────────────

  const unreadMessages = 0 // computed inside MessagesPage

  const knownPages = ['dashboard', 'clients', 'schedule', 'settings', 'reports', 'messages', 'progress', 'programs']

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onLogout={signOut}
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
            setSessions={handleSessionsChange}
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
          <MessagesPage />
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
          setSessions={handleSessionsChange}
          sessionTypes={sessionTypes}
          onClose={() => setNewSessionOpen(false)}
          onSessionAdded={handleSessionAdded}
        />
      )}

      {/* ── Guided tour ── */}
      {showTour && (
        <GuidedTour onEnd={() => setShowTour(false)} />
      )}
    </div>
  )
}
