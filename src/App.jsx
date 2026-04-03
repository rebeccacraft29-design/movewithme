import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import NewSessionPanel from './components/NewSessionPanel'
import { scheduleSessions } from './data/scheduleData'
import { defaultSessionTypes } from './data/sessionTypes'
import './App.css'

export default function App() {
  const [activePage,      setActivePage]      = useState('dashboard')
  const [activeClientId,  setActiveClientId]  = useState(null)
  const [clientsFilter,   setClientsFilter]   = useState('allActive')
  const [sessions,        setSessions]        = useState(scheduleSessions)
  const [sessionTypes,    setSessionTypes]    = useState(defaultSessionTypes)
  const [newSessionOpen,  setNewSessionOpen]  = useState(false)

  function handleNavigate(page) {
    setActivePage(page)
    setActiveClientId(null)
  }

  function handleNavigateToClients(filter) {
    setClientsFilter(filter)
    setActivePage('clients')
    setActiveClientId(null)
  }

  function handleSelectClient(clientId) {
    setActiveClientId(clientId)
    setActivePage('clients')
  }

  const knownPages = ['dashboard', 'clients', 'schedule', 'settings']

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard
            onNavigateToClients={handleNavigateToClients}
            onSelectClient={handleSelectClient}
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
    </div>
  )
}
