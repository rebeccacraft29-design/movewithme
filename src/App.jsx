import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Schedule from './pages/Schedule'
import Settings from './pages/Settings'
import Reports from './pages/Reports'
import Progress from './pages/Progress'
import MessagesPage from './pages/Messages'
import NewSessionPanel from './components/NewSessionPanel'
import { scheduleSessions } from './data/scheduleData'
import { defaultSessionTypes } from './data/sessionTypes'
import { initialConversations } from './data/messagesData'
import './App.css'

export default function App() {
  const [activePage,      setActivePage]      = useState('dashboard')
  const [activeClientId,  setActiveClientId]  = useState(null)
  const [activeClientTab, setActiveClientTab] = useState('overview')
  const [clientsFilter,   setClientsFilter]   = useState('allActive')
  const [sessions,        setSessions]        = useState(scheduleSessions)
  const [sessionTypes,    setSessionTypes]    = useState(defaultSessionTypes)
  const [newSessionOpen,  setNewSessionOpen]  = useState(false)
  const [conversations,   setConversations]   = useState(initialConversations)

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

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

  const knownPages = ['dashboard', 'clients', 'schedule', 'settings', 'reports', 'messages', 'progress']

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
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

        {activePage === 'reports' && (
          <Reports />
        )}

        {activePage === 'progress' && (
          <Progress />
        )}

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
