import { useState, useRef, useEffect } from 'react'
import { Search, Paperclip, Send, ArrowLeft, MessageSquare, X, ChevronRight } from 'lucide-react'
import { clients, getServiceConfig } from '../data/mockData'
import './Messages.css'

// ─── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_COLORS = {
  personal_trainer:  { bg: 'rgba(255,107,91,0.12)',  color: '#FF6B5B' },
  physiotherapist:   { bg: 'rgba(46,196,160,0.12)',  color: '#2EC4A0' },
  massage_therapist: { bg: 'rgba(255,167,51,0.12)',  color: '#FFA733' },
  chiropractor:      { bg: 'rgba(108,99,255,0.12)',  color: '#6C63FF' },
  other:             { bg: 'rgba(144,144,176,0.12)', color: '#9090B0' },
}

const TRAINER = {
  id: 'trainer-1',
  initials: 'RC',
  avatarGrad: 'linear-gradient(135deg,#FF6B5B,#FFA733)',
}

// ─── Time helpers ──────────────────────────────────────────────────────────────

function formatInboxTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(todayStart.getDate() - 1)
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - 6)

  if (date >= todayStart) {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (date >= yesterdayStart) return 'Yesterday'
  if (date >= weekStart) return date.toLocaleDateString('en-AU', { weekday: 'short' })
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function formatMsgTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(todayStart.getDate() - 1)

  const time = date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (date >= todayStart) return time
  if (date >= yesterdayStart) return `Yesterday ${time}`
  return `${date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} · ${time}`
}

// ─── Plan / session helpers ────────────────────────────────────────────────────

function getWeekInPlan(startDate) {
  if (!startDate) return 1
  const diffDays = Math.floor((new Date() - new Date(startDate)) / 86400000)
  return Math.max(1, Math.ceil(diffDays / 7))
}

function getTotalPlanWeeks(startDate, endDate) {
  return Math.ceil((new Date(endDate) - new Date(startDate)) / (86400000 * 7))
}

function getLastSessionNote(client) {
  return [...(client.trainerSessions ?? []), ...(client.independentSessions ?? [])]
    .filter(s => s.completed && s.notes)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.notes ?? null
}

// ─── ConversationItem ──────────────────────────────────────────────────────────

function ConversationItem({ conversation, client, isActive, onClick }) {
  const svcConfig = getServiceConfig(client.serviceType)
  const svcColors = SERVICE_COLORS[client.serviceType] ?? SERVICE_COLORS.other
  const lastMsg = conversation.messages[conversation.messages.length - 1]
  const preview = lastMsg
    ? lastMsg.senderId === 'trainer-1'
      ? `You: ${lastMsg.text}`
      : lastMsg.text
    : ''
  const isUnread = conversation.unreadCount > 0

  return (
    <button
      className={`conversation-item${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      <div className="conv-avatar" style={{ background: client.avatarGrad }}>
        {client.initials}
        {isUnread && <span className="conv-unread-dot" aria-label="Unread messages" />}
      </div>

      <div className="conv-body">
        <div className="conv-top-row">
          <span className={`conv-name${isUnread ? ' unread' : ''}`}>{client.name}</span>
          <span className="conv-time">{formatInboxTime(conversation.lastMessageAt)}</span>
        </div>
        <div className="conv-bottom-row">
          <span
            className="conv-service-badge"
            style={{ background: svcColors.bg, color: svcColors.color }}
          >
            {svcConfig.label}
          </span>
          <span className={`conv-preview${isUnread ? ' unread' : ''}`}>{preview}</span>
        </div>
      </div>
    </button>
  )
}

// ─── ContextStrip ──────────────────────────────────────────────────────────────

function ContextStrip({ client, onPlanClick, onSessionClick }) {
  if (!client.currentPlan) return null

  const weekNum = getWeekInPlan(client.currentPlan.startDate)
  const totalWeeks = getTotalPlanWeeks(client.currentPlan.startDate, client.currentPlan.endDate)
  const lastNote = getLastSessionNote(client)

  return (
    <div className="thread-context-strip">
      <button className="context-item context-item--clickable" onClick={onPlanClick}>
        <span className="context-label">Plan</span>
        <span className="context-value context-value--link">
          {client.currentPlan.name}
          <ChevronRight size={11} className="context-chevron" />
        </span>
      </button>
      <div className="context-divider" />
      <div className="context-item">
        <span className="context-label">Week</span>
        <span className="context-value">
          {weekNum} of {totalWeeks}
        </span>
      </div>
      {lastNote && (
        <>
          <div className="context-divider" />
          <button className="context-item context-item--session context-item--clickable" onClick={onSessionClick}>
            <span className="context-label">Last session</span>
            <span className="context-value context-value--truncate context-value--link">
              {lastNote}
              <ChevronRight size={11} className="context-chevron" style={{ flexShrink: 0 }} />
            </span>
          </button>
        </>
      )}
    </div>
  )
}

// ─── DetailDrawer ──────────────────────────────────────────────────────────────

function DetailDrawer({ type, client, onClose }) {
  const plan = client.currentPlan
  const allSessions = [...(client.trainerSessions ?? []), ...(client.independentSessions ?? [])]
    .filter(s => s.completed && s.notes)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const weekNum   = plan ? getWeekInPlan(plan.startDate) : 1
  const totalWeeks = plan ? getTotalPlanWeeks(plan.startDate, plan.endDate) : 1

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <div className="detail-drawer" role="dialog" aria-modal="true">
      <div className="detail-drawer-header">
        <span className="detail-drawer-title">
          {type === 'plan' ? 'Training Plan' : 'Session Notes'}
        </span>
        <button className="detail-drawer-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="detail-drawer-body">
        {type === 'plan' && plan && (
          <>
            <p className="drawer-plan-name">{plan.name}</p>

            <div className="drawer-section">
              <div className="drawer-meta-row">
                <span className="drawer-meta-label">Started</span>
                <span className="drawer-meta-value">{formatDate(plan.startDate)}</span>
              </div>
              <div className="drawer-meta-row">
                <span className="drawer-meta-label">Ends</span>
                <span className="drawer-meta-value">{formatDate(plan.endDate)}</span>
              </div>
              <div className="drawer-meta-row">
                <span className="drawer-meta-label">Days left</span>
                <span className="drawer-meta-value">{plan.daysLeft}</span>
              </div>
            </div>

            <div className="drawer-section">
              <div className="drawer-progress-header">
                <span className="drawer-meta-label">Progress</span>
                <span className="drawer-progress-week">Week {weekNum} of {totalWeeks}</span>
              </div>
              <div className="drawer-progress-track">
                <div className="drawer-progress-fill" style={{ width: `${plan.progress}%` }} />
              </div>
              <span className="drawer-progress-pct">{plan.progress}% complete</span>
            </div>

            {client.goals?.length > 0 && (
              <div className="drawer-section">
                <p className="drawer-section-heading">Goals</p>
                {client.goals.map(goal => (
                  <div key={goal.id} className="drawer-goal">
                    <div className="drawer-goal-top">
                      <span className="drawer-goal-desc">{goal.description}</span>
                      <span className="drawer-goal-values">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="drawer-progress-track drawer-progress-track--sm">
                      <div
                        className="drawer-progress-fill drawer-progress-fill--teal"
                        style={{ width: `${Math.min(100, (goal.currentValue / goal.targetValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {type === 'session' && (
          allSessions.length === 0
            ? <p className="drawer-empty">No session notes yet.</p>
            : allSessions.map(s => (
                <div key={s.id} className="drawer-session-card">
                  <div className="drawer-session-top">
                    <span className="drawer-session-type">{capitalise(s.type)}</span>
                    <span className="drawer-session-date">{formatDate(s.date)}</span>
                  </div>
                  <p className="drawer-session-duration">{s.durationMinutes} min</p>
                  <p className="drawer-session-notes">{s.notes}</p>
                </div>
              ))
        )}
      </div>
    </div>
  )
}

// ─── MessageBubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message, client, onToggleLike }) {
  const isSent = message.senderId === 'trainer-1'
  const avatarGrad = isSent ? TRAINER.avatarGrad : client.avatarGrad
  const initials   = isSent ? TRAINER.initials   : client.initials

  return (
    <div className={`message-group ${isSent ? 'sent' : 'received'}`}>
      <div className="msg-avatar" style={{ background: avatarGrad }}>
        {initials}
      </div>

      <div className="msg-content">
        <div className="msg-bubble">{message.text}</div>

        <div className="msg-meta">
          <span className="msg-time">{formatMsgTime(message.timestamp)}</span>

          {isSent && message.read && (
            <span className="msg-read-receipt">Read</span>
          )}

          <button
            className={`msg-reaction${message.liked ? ' liked' : ''}`}
            onClick={onToggleLike}
            aria-label={message.liked ? 'Unlike' : 'Like'}
          >
            <em className="msg-reaction-heart">♥</em>
            {message.likeCount > 0 && <span>{message.likeCount}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MessagesPage ──────────────────────────────────────────────────────────────

export default function MessagesPage({ conversations, setConversations }) {
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [mobileView,       setMobileView]       = useState('inbox') // 'inbox' | 'thread'
  const [search,           setSearch]           = useState('')
  const [inputText,        setInputText]        = useState('')
  const [linkInputOpen,    setLinkInputOpen]    = useState(false)
  const [linkUrl,          setLinkUrl]          = useState('')
  const [activeDrawer,     setActiveDrawer]     = useState(null) // null | 'plan' | 'session'

  const messageListRef = useRef(null)
  const textareaRef    = useRef(null)

  const selectedClient       = selectedClientId ? clients.find(c => c.id === selectedClientId) : null
  const selectedConversation = selectedClientId
    ? conversations.find(c => c.clientId === selectedClientId)
    : null

  // Build sorted, filtered conversation list
  const enrichedConvs = conversations
    .map(conv => ({ ...conv, client: clients.find(c => c.id === conv.clientId) }))
    .filter(ec => ec.client)
    .filter(ec => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        ec.client.name.toLowerCase().includes(q) ||
        ec.messages.some(m => m.text.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))

  // Scroll to bottom when thread opens or new message arrives
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [selectedClientId, selectedConversation?.messages.length])

  function handleSelectConversation(clientId) {
    setSelectedClientId(clientId)
    setMobileView('thread')
    setInputText('')
    setLinkInputOpen(false)
    setLinkUrl('')

    // Mark all client messages as read
    setActiveDrawer(null)
    setConversations(prev =>
      prev.map(conv =>
        conv.clientId === clientId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map(m => ({ ...m, read: true })),
            }
          : conv
      )
    )
  }

  function handleSend() {
    const text = inputText.trim()
    if (!text || !selectedClientId) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'trainer-1',
      text,
      timestamp: new Date().toISOString(),
      read: false,
      likeCount: 0,
      liked: false,
    }

    setConversations(prev =>
      prev.map(conv =>
        conv.clientId === selectedClientId
          ? { ...conv, lastMessageAt: newMsg.timestamp, messages: [...conv.messages, newMsg] }
          : conv
      )
    )

    setInputText('')
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e) {
    setInputText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  function handleAttachLink() {
    const url = linkUrl.trim()
    if (!url) return
    setInputText(prev => (prev ? `${prev} ${url}` : url))
    setLinkUrl('')
    setLinkInputOpen(false)
    textareaRef.current?.focus()
  }

  function handleToggleLike(clientId, msgId) {
    setConversations(prev =>
      prev.map(conv =>
        conv.clientId === clientId
          ? {
              ...conv,
              messages: conv.messages.map(m =>
                m.id === msgId
                  ? {
                      ...m,
                      liked: !m.liked,
                      likeCount: m.liked ? Math.max(0, m.likeCount - 1) : m.likeCount + 1,
                    }
                  : m
              ),
            }
          : conv
      )
    )
  }

  return (
    <div className="messages-page">

      {/* ── Inbox ── */}
      <div className={`messages-inbox${mobileView === 'thread' ? ' hidden' : ''}`}>
        <div className="messages-inbox-header">
          <h1 className="messages-inbox-title">Messages</h1>
          <div className="messages-search-wrap">
            <Search size={14} className="messages-search-icon" />
            <input
              className="messages-search"
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="conversation-list">
          {enrichedConvs.map(({ client, ...conv }) => (
            <ConversationItem
              key={conv.clientId}
              conversation={conv}
              client={client}
              isActive={selectedClientId === conv.clientId}
              onClick={() => handleSelectConversation(conv.clientId)}
            />
          ))}
          {enrichedConvs.length === 0 && (
            <p className="inbox-empty">No conversations found.</p>
          )}
        </div>
      </div>

      {/* ── Thread ── */}
      <div className={`messages-thread${mobileView === 'thread' ? ' visible' : ''}`} style={{ position: 'relative' }}>
        {selectedClient && selectedConversation ? (
          <>
            {/* Header */}
            <div className="thread-header">
              <button
                className="thread-back-btn"
                onClick={() => setMobileView('inbox')}
                aria-label="Back to inbox"
              >
                <ArrowLeft size={17} />
              </button>
              <div
                className="thread-header-avatar"
                style={{ background: selectedClient.avatarGrad }}
              >
                {selectedClient.initials}
              </div>
              <div className="thread-header-info">
                <div className="thread-header-name">{selectedClient.name}</div>
                <div className="thread-header-service">
                  {getServiceConfig(selectedClient.serviceType).label}
                </div>
              </div>
            </div>

            {/* Context strip */}
            <ContextStrip
              client={selectedClient}
              onPlanClick={() => setActiveDrawer(d => d === 'plan' ? null : 'plan')}
              onSessionClick={() => setActiveDrawer(d => d === 'session' ? null : 'session')}
            />

            {/* Messages */}
            <div className="message-list" ref={messageListRef}>
              {selectedConversation.messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  client={selectedClient}
                  onToggleLike={() => handleToggleLike(selectedClient.id, msg.id)}
                />
              ))}
            </div>

            {/* Input area */}
            <div className="message-input-area">
              {linkInputOpen && (
                <div className="link-input-row">
                  <Paperclip size={13} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                  <input
                    className="link-input"
                    type="url"
                    placeholder="Paste a URL…"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAttachLink()}
                    autoFocus
                  />
                  <button className="link-attach-btn" onClick={handleAttachLink}>
                    Attach
                  </button>
                  <button
                    className="link-cancel-btn"
                    onClick={() => { setLinkInputOpen(false); setLinkUrl('') }}
                    aria-label="Cancel link"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="message-input-row">
                <button
                  className={`input-action-btn${linkInputOpen ? ' active' : ''}`}
                  onClick={() => setLinkInputOpen(v => !v)}
                  title="Attach link"
                  aria-label="Attach link"
                >
                  <Paperclip size={16} />
                </button>

                <textarea
                  ref={textareaRef}
                  className="message-input-field"
                  placeholder={`Message ${selectedClient.name.split(' ')[0]}…`}
                  value={inputText}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />

                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  title="Send"
                  aria-label="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="thread-empty">
            <MessageSquare size={42} strokeWidth={1.2} style={{ color: 'var(--text-muted)' }} />
            <p>Select a conversation to start messaging</p>
          </div>
        )}

        {/* Slide-in detail drawer */}
        {activeDrawer && selectedClient && (
          <DetailDrawer
            type={activeDrawer}
            client={selectedClient}
            onClose={() => setActiveDrawer(null)}
          />
        )}
      </div>
    </div>
  )
}
