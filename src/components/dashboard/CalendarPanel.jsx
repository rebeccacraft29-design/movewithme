import { useState, useEffect, useCallback, useRef } from 'react'
import { Calendar, RefreshCw, Link2, Plus, X, CheckCircle } from 'lucide-react'
import './CalendarPanel.css'

const TOKEN_KEY = 'mwm_gcal_token'
const ICAL_KEY = 'mwm_ical_url'
// Read + write scope so events created in MoveWithMe can be pushed back to Google Calendar
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

function getStoredToken() {
  try {
    const d = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null')
    if (!d || Date.now() > d.expiry) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return d.access_token
  } catch {
    return null
  }
}

function storeToken(access_token, expires_in) {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ access_token, expiry: Date.now() + expires_in * 1000 - 60_000 }),
  )
}

// Minimal iCal parser — handles VEVENT blocks with folded lines
function parseICS(text) {
  const events = []
  const normalised = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // Unfold folded lines (continuation lines start with a space/tab)
  const unfolded = normalised.replace(/\n[ \t]/g, '')
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1)

  for (const block of blocks) {
    const get = (key) => {
      const re = new RegExp(`^${key}(?:;[^:]*)?:(.+)$`, 'm')
      return (re.exec(block)?.[1] ?? '').trim()
    }
    const start = parseDTVal(get('DTSTART'))
    const end = parseDTVal(get('DTEND'))
    const summary = get('SUMMARY') || '(No title)'
    const location = get('LOCATION')
    if (start) {
      events.push({ id: summary + get('DTSTART'), title: summary, start, end, location, source: 'ical', allDay: isAllDay(get('DTSTART')) })
    }
  }
  return events
}

function isAllDay(dtval) {
  return /^\d{8}$/.test(dtval)
}

function parseDTVal(val) {
  if (!val) return null
  if (/^\d{8}$/.test(val)) {
    return new Date(`${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}T00:00:00`)
  }
  const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/)
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ? 'Z' : ''}`)
  return null
}

function isToday(date) {
  const n = new Date()
  return date.getFullYear() === n.getFullYear() && date.getMonth() === n.getMonth() && date.getDate() === n.getDate()
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function durationLabel(start, end) {
  if (!end) return ''
  const mins = Math.round((end - start) / 60_000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default function CalendarPanel() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const [googleToken, setGoogleToken] = useState(getStoredToken)
  const [icalUrl, setIcalUrl] = useState(() => localStorage.getItem(ICAL_KEY) || '')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showIcalInput, setShowIcalInput] = useState(false)
  const [icalInputVal, setIcalInputVal] = useState('')
  const tokenClientRef = useRef(null)

  const fetchGoogleEvents = useCallback(async (token) => {
    const now = new Date()
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
    const qs = new URLSearchParams({ timeMin, timeMax, orderBy: 'startTime', singleEvents: 'true', maxResults: '25' })
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) throw new Error('TOKEN_EXPIRED')
    if (!res.ok) throw new Error('Failed to fetch Google Calendar')
    const data = await res.json()
    return (data.items || []).map((ev) => ({
      id: ev.id,
      title: ev.summary || '(No title)',
      start: ev.start?.dateTime ? new Date(ev.start.dateTime) : new Date(ev.start?.date),
      end: ev.end?.dateTime ? new Date(ev.end.dateTime) : new Date(ev.end?.date),
      location: ev.location,
      source: 'google',
      allDay: !ev.start?.dateTime,
    }))
  }, [])

  const fetchIcalEvents = useCallback(async (url) => {
    const normalised = url.replace(/^webcal:/i, 'https:')
    const res = await fetch(`/api/ical-proxy?url=${encodeURIComponent(normalised)}`)
    if (!res.ok) throw new Error('Failed to fetch iCal feed')
    const text = await res.text()
    return parseICS(text).filter((ev) => ev.start && isToday(ev.start))
  }, [])

  const refresh = useCallback(async () => {
    if (!googleToken && !icalUrl) return
    setLoading(true)
    setError(null)
    try {
      const [gEvents, iEvents] = await Promise.all([
        googleToken ? fetchGoogleEvents(googleToken) : Promise.resolve([]),
        icalUrl ? fetchIcalEvents(icalUrl) : Promise.resolve([]),
      ])
      setEvents([...gEvents, ...iEvents].sort((a, b) => a.start - b.start))
    } catch (e) {
      if (e.message === 'TOKEN_EXPIRED') {
        localStorage.removeItem(TOKEN_KEY)
        setGoogleToken(null)
        setError('Google session expired — please reconnect.')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [googleToken, icalUrl, fetchGoogleEvents, fetchIcalEvents])

  useEffect(() => { refresh() }, [refresh])

  const buildTokenClient = useCallback(() => {
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      callback: (resp) => {
        if (resp.error) { setError('Google sign-in was cancelled or failed.'); return }
        storeToken(resp.access_token, resp.expires_in)
        setGoogleToken(resp.access_token)
      },
    })
  }, [clientId])

  const connectGoogle = useCallback(async () => {
    if (!clientId) {
      setError('Add VITE_GOOGLE_CLIENT_ID to your .env.local to enable Google Calendar.')
      return
    }
    setError(null)
    if (!window.google?.accounts?.oauth2) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    }
    buildTokenClient()
    tokenClientRef.current.requestAccessToken()
  }, [clientId, buildTokenClient])

  const disconnectGoogle = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setGoogleToken(null)
    setEvents((prev) => prev.filter((e) => e.source !== 'google'))
  }, [])

  const saveIcal = useCallback(() => {
    const url = icalInputVal.trim()
    if (!url) return
    localStorage.setItem(ICAL_KEY, url)
    setIcalUrl(url)
    setShowIcalInput(false)
    setIcalInputVal('')
  }, [icalInputVal])

  const disconnectIcal = useCallback(() => {
    localStorage.removeItem(ICAL_KEY)
    setIcalUrl('')
    setEvents((prev) => prev.filter((e) => e.source !== 'ical'))
  }, [])

  const hasGoogle = !!googleToken
  const hasIcal = !!icalUrl
  const isConnected = hasGoogle || hasIcal

  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <Calendar size={16} color="var(--teal)" />
          <h2 className="panel-title">Today's Schedule</h2>
        </div>
        {isConnected && (
          <button className="cal-icon-btn" onClick={refresh} disabled={loading} title="Refresh">
            <RefreshCw size={13} className={loading ? 'cal-spin' : ''} />
          </button>
        )}
      </div>

      {/* iCal URL input form */}
      {showIcalInput && (
        <div className="cal-ical-form">
          <p className="cal-ical-label">iCal subscription URL</p>
          <p className="cal-ical-hint">
            In Calendar.app: right-click any calendar → Copy Link. Accepts webcal:// or https://.
          </p>
          <input
            className="cal-ical-input"
            type="url"
            placeholder="webcal://p01-caldav.icloud.com/…"
            value={icalInputVal}
            onChange={(e) => setIcalInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveIcal()}
            autoFocus
          />
          <div className="cal-ical-form-actions">
            <button className="cal-ical-cancel" onClick={() => setShowIcalInput(false)}>Cancel</button>
            <button className="cal-ical-save" onClick={saveIcal} disabled={!icalInputVal.trim()}>Subscribe</button>
          </div>
        </div>
      )}

      {/* Not connected empty state */}
      {!isConnected && !showIcalInput && (
        <div className="cal-empty">
          <div className="cal-empty-icon">
            <Calendar size={26} color="var(--text-muted)" />
          </div>
          <p className="cal-empty-title">No calendar connected</p>
          <p className="cal-empty-sub">
            Connect your calendar to see today's schedule — wherever you create an event, it appears here.
          </p>
          <div className="cal-connect-btns">
            <button className="cal-connect-btn cal-connect-btn--google" onClick={connectGoogle}>
              <GoogleLogo />
              Connect Google Calendar
            </button>
            <button className="cal-connect-btn cal-connect-btn--ical" onClick={() => setShowIcalInput(true)}>
              <Link2 size={13} />
              Add iCal / Apple Calendar
            </button>
          </div>
        </div>
      )}

      {/* Connected view */}
      {isConnected && !showIcalInput && (
        <>
          {/* Source pills */}
          <div className="cal-sources">
            {hasGoogle && (
              <span className="cal-source-pill cal-source-pill--google">
                <span className="cal-source-dot" />
                Google
                <button className="cal-source-remove" onClick={disconnectGoogle} title="Disconnect Google Calendar">
                  <X size={9} />
                </button>
              </span>
            )}
            {hasIcal && (
              <span className="cal-source-pill cal-source-pill--ical">
                <span className="cal-source-dot" />
                iCal
                <button className="cal-source-remove" onClick={disconnectIcal} title="Disconnect iCal feed">
                  <X size={9} />
                </button>
              </span>
            )}
            {!hasGoogle && (
              <button className="cal-add-pill" onClick={connectGoogle}>
                <Plus size={10} /> Google
              </button>
            )}
            {!hasIcal && (
              <button className="cal-add-pill" onClick={() => setShowIcalInput(true)}>
                <Plus size={10} /> iCal
              </button>
            )}
          </div>

          {error && <p className="cal-error">{error}</p>}

          {loading && (
            <div className="cal-loading">
              <RefreshCw size={13} className="cal-spin" />
              Loading…
            </div>
          )}

          {!loading && events.length === 0 && !error && (
            <div className="cal-no-events">
              <CheckCircle size={15} color="var(--teal)" />
              <span>No appointments today</span>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="cal-events">
              {events.map((ev, i) => {
                const evStart = ev.allDay ? -1 : ev.start.getHours() * 60 + ev.start.getMinutes()
                const evEnd = ev.end && !ev.allDay ? ev.end.getHours() * 60 + ev.end.getMinutes() : evStart + 60
                const isNow = evStart >= 0 && evStart <= nowMins && nowMins < evEnd
                const isPast = evEnd < nowMins && !ev.allDay
                return (
                  <div
                    key={ev.id || i}
                    className={`cal-event${isNow ? ' cal-event--now' : ''}${isPast ? ' cal-event--past' : ''}`}
                  >
                    <div className="cal-event-time">
                      {ev.allDay ? 'All day' : formatTime(ev.start)}
                    </div>
                    <div
                      className="cal-event-bar"
                      style={{
                        background: ev.source === 'google'
                          ? 'linear-gradient(180deg,#4285F4,#34A853)'
                          : 'linear-gradient(180deg,var(--teal),var(--teal-dark))',
                      }}
                    />
                    <div className="cal-event-body">
                      <span className="cal-event-title">{ev.title}</span>
                      {ev.location && <span className="cal-event-loc">{ev.location}</span>}
                    </div>
                    {!ev.allDay && ev.end && (
                      <span className="cal-event-dur">{durationLabel(ev.start, ev.end)}</span>
                    )}
                    {isNow && <span className="cal-now-badge">Now</span>}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
