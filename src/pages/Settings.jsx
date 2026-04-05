import { useState, useRef, useEffect } from 'react'
import {
  Plus, Trash2, Check, X, Camera, Calendar, Download,
  Bell, Sun, Moon, Clock, MessageSquare, BookOpen,
  Link2, Database, Briefcase, User, Pencil, FileText,
  Upload, Dumbbell,
} from 'lucide-react'
import ImportModal from '../components/ImportModal'
import './Settings.css'

// ── Reusable helpers ──────────────────────────────────────────────────────────

function ColorSwatch({ color, onChange }) {
  const inputRef = useRef(null)
  return (
    <button type="button" className="st-swatch" style={{ background: color }}
      onClick={() => inputRef.current?.click()} title="Change colour">
      <input ref={inputRef} type="color" value={color}
        onChange={e => onChange(e.target.value)} className="st-swatch-input" />
    </button>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <label className="s-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="s-toggle-track"><span className="s-toggle-thumb" /></span>
    </label>
  )
}

function SectionHeader({ icon: Icon, title, desc, action }) {
  return (
    <div className="settings-section-header">
      <div className="s-sh-left">
        <div className="s-sh-icon"><Icon size={16} /></div>
        <div>
          <h2 className="settings-section-title">{title}</h2>
          {desc && <p className="settings-section-desc">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Settings({ sessionTypes, setSessionTypes, onNavigate }) {

  // §1 Account & Profile
  const [profile, setProfile] = useState({
    name: 'Alex Morgan',
    email: 'alex@movewithme.com',
    bio: 'Certified personal trainer with 8+ years experience specialising in strength & conditioning, rehabilitation, and sports performance.',
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const photoInputRef = useRef(null)

  // §2 Professional Roles
  const ROLES = ['Personal Trainer', 'Physiotherapist', 'Chiropractor', 'Massage Therapist', 'Nutritionist', 'Other']
  const [selectedRoles, setSelectedRoles] = useState(['Personal Trainer'])

  // §3 Session Types — editing state (data lives in App via props)
  const [editingId, setEditingId]   = useState(null)
  const [editLabel, setEditLabel]   = useState('')
  const [adding, setAdding]         = useState(false)
  const [newLabel, setNewLabel]     = useState('')
  const [newColor, setNewColor]     = useState('#FF6B5B')
  const newColorRef                 = useRef(null)

  // §4 Booking & Scheduling
  const [scheduling, setScheduling] = useState({
    defaultDuration: '60',
    bufferTime: '15',
    workStart: '07:00',
    workEnd: '20:00',
    cancellationPolicy: 'Cancellations must be made at least 24 hours in advance. Late cancellations may incur a 50% session fee.',
  })

  // §5 Message Templates
  const [templates, setTemplates] = useState([
    { id: 'mt-1', title: 'Great session today!', body: "Really great work today — you pushed through tough sets and I can see real progress. Keep it up!" },
    { id: 'mt-2', title: "Don't forget your program this week", body: "Just a reminder to complete your program this week — consistency is everything. Let me know if you have any questions!" },
    { id: 'mt-3', title: 'Your next plan is ready', body: "Hi! Your new training plan is ready and waiting. Have a look when you get a chance and let me know your thoughts." },
  ])
  const [editingTemplateId, setEditingTemplateId]     = useState(null)
  const [editingTemplateData, setEditingTemplateData] = useState({ title: '', body: '' })
  const [addingTemplate, setAddingTemplate]           = useState(false)
  const [newTemplate, setNewTemplate]                 = useState({ title: '', body: '' })

  // §6 Program Defaults
  const [programDefaults, setProgramDefaults] = useState({
    planLengthWeeks: 8,
    sessionsPerWeek: 3,
    visibility: 'shared',
  })

  // §7 Notifications
  const [notifications, setNotifications] = useState({
    sessionCompleted: true,
    sessionMissed:    true,
    planEndingSoon:   true,
    newMessage:       true,
    clientDiscomfort: true,
  })

  // §8 Integrations
  const [googleConnected, setGoogleConnected] = useState(false)

  // §9 Import modals
  const [importModal, setImportModal] = useState(null) // null | 'clients' | 'exercises'

  // §10 Appearance
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // ── Session type handlers ────────────────────────────────────────────────────

  function startEdit(st)     { setEditingId(st.id); setEditLabel(st.label) }
  function commitEdit(id)    {
    if (editLabel.trim()) setSessionTypes(p => p.map(st => st.id === id ? { ...st, label: editLabel.trim() } : st))
    setEditingId(null)
  }
  function updateColor(id, c) { setSessionTypes(p => p.map(st => st.id === id ? { ...st, color: c } : st)) }
  function deleteType(id)     { setSessionTypes(p => p.filter(st => st.id !== id)) }
  function moveUp(i) {
    if (i === 0) return
    setSessionTypes(p => { const n = [...p]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n })
  }
  function moveDown(i) {
    if (i === sessionTypes.length - 1) return
    setSessionTypes(p => { const n = [...p]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n })
  }
  function addType() {
    if (!newLabel.trim()) return
    setSessionTypes(p => [...p, { id: `st-${Date.now()}`, label: newLabel.trim(), color: newColor }])
    setNewLabel(''); setNewColor('#FF6B5B'); setAdding(false)
  }

  // ── Template handlers ────────────────────────────────────────────────────────

  function startEditTemplate(t)  { setEditingTemplateId(t.id); setEditingTemplateData({ title: t.title, body: t.body }) }
  function commitEditTemplate()  {
    if (!editingTemplateData.title.trim()) return
    setTemplates(p => p.map(t => t.id === editingTemplateId ? { ...t, ...editingTemplateData } : t))
    setEditingTemplateId(null)
  }
  function deleteTemplate(id)    { setTemplates(p => p.filter(t => t.id !== id)) }
  function addTemplate() {
    if (!newTemplate.title.trim()) return
    setTemplates(p => [...p, { id: `mt-${Date.now()}`, ...newTemplate }])
    setNewTemplate({ title: '', body: '' }); setAddingTemplate(false)
  }

  function toggleNotif(key)      { setNotifications(p => ({ ...p, [key]: !p[key] })) }
  function handlePhotoChange(e)  {
    const file = e.target.files[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* ── §1 Account & Profile ──────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={User} title="Account & Profile"
          desc="Your name, photo and bio appear on your trainer profile visible to clients." />

        <div className="s-profile-layout">
          <div className="s-avatar-wrap">
            <div className="s-avatar" onClick={() => photoInputRef.current?.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" className="s-avatar-img" />
                : <span className="s-avatar-initials">
                    {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
              }
              <div className="s-avatar-overlay"><Camera size={20} /></div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*"
              className="s-hidden-input" onChange={handlePhotoChange} />
            <button className="s-avatar-btn" onClick={() => photoInputRef.current?.click()}>
              Upload photo
            </button>
          </div>

          <div className="s-profile-fields">
            <div className="s-field-row">
              <div className="s-field">
                <label className="s-label">Full name</label>
                <input className="s-input" value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="s-field">
                <label className="s-label">Email</label>
                <input className="s-input" type="email" value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="s-field">
              <label className="s-label">
                Bio / About me <span className="s-label-hint">— visible to clients</span>
              </label>
              <textarea className="s-textarea" rows={3} value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
            </div>
          </div>
        </div>
      </section>

      {/* ── §2 Professional Roles ─────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Briefcase} title="Professional Roles"
          desc="Select all that apply — displayed on your profile." />
        <div className="s-roles-grid">
          {ROLES.map(role => (
            <button key={role} type="button"
              className={`s-role-chip ${selectedRoles.includes(role) ? 's-role-chip--active' : ''}`}
              onClick={() => setSelectedRoles(p =>
                p.includes(role) ? p.filter(r => r !== role) : [...p, role]
              )}
            >
              {selectedRoles.includes(role) && <Check size={12} />}
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* ── §3 Session Types ──────────────────────────────────────────────────── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <div className="s-sh-left">
            <div className="s-sh-icon"><Calendar size={16} /></div>
            <div>
              <h2 className="settings-section-title">Session Types</h2>
              <p className="settings-section-desc">
                Customise session types available when booking. Click a colour swatch to change it, click a name to edit.
              </p>
            </div>
          </div>
          <button className="settings-add-btn" onClick={() => { setAdding(true); setNewLabel('') }}>
            <Plus size={14} /> Add type
          </button>
        </div>

        <div className="settings-st-list">
          {sessionTypes.map((st, i) => (
            <div key={st.id} className="settings-st-row">
              <div className="settings-st-reorder">
                <button type="button" className="settings-reorder-btn" onClick={() => moveUp(i)} disabled={i === 0} title="Move up">▲</button>
                <button type="button" className="settings-reorder-btn" onClick={() => moveDown(i)} disabled={i === sessionTypes.length - 1} title="Move down">▼</button>
              </div>
              <ColorSwatch color={st.color} onChange={c => updateColor(st.id, c)} />
              {editingId === st.id ? (
                <input className="settings-st-input" value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(st.id); if (e.key === 'Escape') setEditingId(null) }}
                  autoFocus />
              ) : (
                <span className="settings-st-label" onClick={() => startEdit(st)} title="Click to edit">{st.label}</span>
              )}
              <div className="settings-st-actions">
                {editingId === st.id ? (
                  <>
                    <button type="button" className="settings-st-btn settings-st-btn--confirm" onClick={() => commitEdit(st.id)}><Check size={13} /></button>
                    <button type="button" className="settings-st-btn" onClick={() => setEditingId(null)}><X size={13} /></button>
                  </>
                ) : (
                  <button type="button" className="settings-st-btn settings-st-btn--delete" onClick={() => deleteType(st.id)} title="Delete"><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          ))}

          {adding && (
            <div className="settings-st-row settings-st-row--new">
              <div className="settings-st-reorder" />
              <button type="button" className="st-swatch" style={{ background: newColor }}
                onClick={() => newColorRef.current?.click()}>
                <input ref={newColorRef} type="color" value={newColor}
                  onChange={e => setNewColor(e.target.value)} className="st-swatch-input" />
              </button>
              <input className="settings-st-input" value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addType(); if (e.key === 'Escape') setAdding(false) }}
                placeholder="Session type name…" autoFocus />
              <div className="settings-st-actions">
                <button type="button" className="settings-st-btn settings-st-btn--confirm" onClick={addType}><Check size={13} /></button>
                <button type="button" className="settings-st-btn" onClick={() => setAdding(false)}><X size={13} /></button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── §4 Booking & Scheduling ───────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Clock} title="Booking & Scheduling"
          desc="Default values applied when creating new sessions." />
        <div className="s-grid-2">
          <div className="s-field">
            <label className="s-label">Default session duration</label>
            <select className="s-select" value={scheduling.defaultDuration}
              onChange={e => setScheduling(p => ({ ...p, defaultDuration: e.target.value }))}>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="75">75 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div className="s-field">
            <label className="s-label">Buffer time between sessions</label>
            <select className="s-select" value={scheduling.bufferTime}
              onChange={e => setScheduling(p => ({ ...p, bufferTime: e.target.value }))}>
              <option value="0">No buffer</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </div>
          <div className="s-field">
            <label className="s-label">Working hours — start</label>
            <input className="s-input" type="time" value={scheduling.workStart}
              onChange={e => setScheduling(p => ({ ...p, workStart: e.target.value }))} />
          </div>
          <div className="s-field">
            <label className="s-label">Working hours — end</label>
            <input className="s-input" type="time" value={scheduling.workEnd}
              onChange={e => setScheduling(p => ({ ...p, workEnd: e.target.value }))} />
          </div>
        </div>
        <div className="s-field s-field--mt">
          <label className="s-label">
            Cancellation policy <span className="s-label-hint">— shown to clients when booking</span>
          </label>
          <textarea className="s-textarea" rows={3} value={scheduling.cancellationPolicy}
            onChange={e => setScheduling(p => ({ ...p, cancellationPolicy: e.target.value }))} />
        </div>
      </section>

      {/* ── §5 Message Templates ──────────────────────────────────────────────── */}
      <section className="settings-section">
        <div className="settings-section-header">
          <div className="s-sh-left">
            <div className="s-sh-icon"><MessageSquare size={16} /></div>
            <div>
              <h2 className="settings-section-title">Message Templates</h2>
              <p className="settings-section-desc">Saved messages you can send in one tap from any conversation.</p>
            </div>
          </div>
          <button className="settings-add-btn"
            onClick={() => { setAddingTemplate(true); setNewTemplate({ title: '', body: '' }) }}>
            <Plus size={14} /> Add template
          </button>
        </div>

        <div className="s-template-list">
          {templates.map(t => (
            <div key={t.id} className={`s-template-row ${editingTemplateId === t.id ? 's-template-row--editing' : ''}`}>
              {editingTemplateId === t.id ? (
                <div className="s-template-edit">
                  <input className="s-input" value={editingTemplateData.title}
                    onChange={e => setEditingTemplateData(p => ({ ...p, title: e.target.value }))}
                    placeholder="Template title…" autoFocus />
                  <textarea className="s-textarea s-textarea--mt" rows={3} value={editingTemplateData.body}
                    onChange={e => setEditingTemplateData(p => ({ ...p, body: e.target.value }))}
                    placeholder="Message body…" />
                  <div className="s-template-edit-actions">
                    <button className="settings-st-btn settings-st-btn--confirm" onClick={commitEditTemplate}><Check size={13} /></button>
                    <button className="settings-st-btn" onClick={() => setEditingTemplateId(null)}><X size={13} /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="s-template-content">
                    <div className="s-template-title">{t.title}</div>
                    <div className="s-template-body">{t.body}</div>
                  </div>
                  <div className="s-template-actions">
                    <button className="settings-st-btn" onClick={() => startEditTemplate(t)} title="Edit"><Pencil size={13} /></button>
                    <button className="settings-st-btn settings-st-btn--delete" onClick={() => deleteTemplate(t.id)} title="Delete"><Trash2 size={13} /></button>
                  </div>
                </>
              )}
            </div>
          ))}

          {addingTemplate && (
            <div className="s-template-row s-template-row--editing">
              <div className="s-template-edit">
                <input className="s-input" value={newTemplate.title}
                  onChange={e => setNewTemplate(p => ({ ...p, title: e.target.value }))}
                  placeholder="Template title…" autoFocus />
                <textarea className="s-textarea s-textarea--mt" rows={3} value={newTemplate.body}
                  onChange={e => setNewTemplate(p => ({ ...p, body: e.target.value }))}
                  placeholder="Message body…" />
                <div className="s-template-edit-actions">
                  <button className="settings-st-btn settings-st-btn--confirm" onClick={addTemplate}><Check size={13} /></button>
                  <button className="settings-st-btn" onClick={() => setAddingTemplate(false)}><X size={13} /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── §6 Program Defaults ───────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={BookOpen} title="Program Defaults"
          desc="Pre-filled values when creating a new training plan." />
        <div className="s-grid-2">
          <div className="s-field">
            <label className="s-label">Default plan length</label>
            <select className="s-select" value={programDefaults.planLengthWeeks}
              onChange={e => setProgramDefaults(p => ({ ...p, planLengthWeeks: Number(e.target.value) }))}>
              {[4, 6, 8, 10, 12, 16, 20, 24].map(w =>
                <option key={w} value={w}>{w} weeks</option>
              )}
            </select>
          </div>
          <div className="s-field">
            <label className="s-label">Default sessions per week</label>
            <select className="s-select" value={programDefaults.sessionsPerWeek}
              onChange={e => setProgramDefaults(p => ({ ...p, sessionsPerWeek: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5, 6, 7].map(n =>
                <option key={n} value={n}>{n} session{n !== 1 ? 's' : ''}</option>
              )}
            </select>
          </div>
        </div>
        <div className="s-field s-field--mt">
          <label className="s-label">Default plan visibility</label>
          <div className="s-radio-group">
            <label className="s-radio">
              <input type="radio" name="prog-visibility" value="shared"
                checked={programDefaults.visibility === 'shared'}
                onChange={() => setProgramDefaults(p => ({ ...p, visibility: 'shared' }))} />
              <span className="s-radio-box" />
              <span>
                <strong>Shared with client</strong>
                <span className="s-label-hint"> — client can view their plan in the app</span>
              </span>
            </label>
            <label className="s-radio">
              <input type="radio" name="prog-visibility" value="trainer-only"
                checked={programDefaults.visibility === 'trainer-only'}
                onChange={() => setProgramDefaults(p => ({ ...p, visibility: 'trainer-only' }))} />
              <span className="s-radio-box" />
              <span>
                <strong>Trainer reference only</strong>
                <span className="s-label-hint"> — client cannot see this plan</span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ── §7 Notifications ─────────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Bell} title="Notifications"
          desc="Choose which events trigger a notification." />
        <div className="s-notif-list">
          {[
            { key: 'sessionCompleted', label: 'Client completes a session' },
            { key: 'sessionMissed',    label: 'Client misses a session' },
            { key: 'planEndingSoon',   label: 'Plan ending soon (3 days notice)' },
            { key: 'newMessage',       label: 'New message received' },
            { key: 'clientDiscomfort', label: 'Client reports discomfort or pain' },
          ].map(({ key, label }) => (
            <div key={key} className="s-notif-row">
              <span className="s-notif-label">{label}</span>
              <Toggle checked={notifications[key]} onChange={() => toggleNotif(key)} />
            </div>
          ))}
        </div>
      </section>

      {/* ── §8 Integrations ──────────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Link2} title="Integrations"
          desc="Connect external tools and services." />
        <div className="s-integrations-grid">

          {/* Google Calendar */}
          <div className={`s-int-card ${googleConnected ? 's-int-card--connected' : ''}`}>
            <div className="s-int-top">
              <div className="s-int-logo">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="s-int-info">
                <div className="s-int-name">Google Calendar</div>
                <div className={`s-int-status ${googleConnected ? 's-int-status--on' : ''}`}>
                  {googleConnected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>
            <button
              className={`s-int-btn ${googleConnected ? 's-int-btn--disconnect' : 's-int-btn--connect'}`}
              onClick={() => setGoogleConnected(p => !p)}
            >
              {googleConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Apple Calendar — coming soon */}
          <div className="s-int-card s-int-card--soon">
            <div className="s-int-top">
              <div className="s-int-logo s-int-logo--apple">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div className="s-int-info">
                <div className="s-int-name">Apple Calendar</div>
                <div className="s-int-status">Not connected</div>
              </div>
            </div>
            <span className="s-soon-badge">Coming soon</span>
          </div>

          {/* Stripe — coming soon */}
          <div className="s-int-card s-int-card--soon">
            <div className="s-int-top">
              <div className="s-int-logo s-int-logo--stripe">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#635BFF">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div className="s-int-info">
                <div className="s-int-name">Stripe Payments</div>
                <div className="s-int-status">Not connected</div>
              </div>
            </div>
            <span className="s-soon-badge">Coming soon</span>
          </div>
        </div>
      </section>

      {/* ── §9 Data & Export ─────────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Database} title="Data & Export"
          desc="Download your data or import from another platform." />

        <div className="s-data-group">
          <div className="s-data-row">
            <div>
              <div className="s-data-row-title">Export all client data</div>
              <div className="s-data-row-desc">Download a CSV with all client profiles, sessions, and program history.</div>
            </div>
            <button className="s-export-btn">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="s-data-row">
            <div>
              <div className="s-data-row-title">Export client history as PDF</div>
              <div className="s-data-row-desc">Generate a printable session history report for an individual client.</div>
            </div>
            <button className="s-export-btn">
              <FileText size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Client import */}
        <div className="s-import-block s-import-block--action">
          <div className="s-import-block-left">
            <div className="s-import-block-icon"><Upload size={15} /></div>
            <div>
              <div className="s-import-block-title">Import Clients from CSV</div>
              <div className="s-import-block-desc">
                Bulk-add clients from a spreadsheet. Accepts First Name, Last Name, Email, Phone, Service Type, Notes.
              </div>
            </div>
          </div>
          <button className="s-import-action-btn" onClick={() => setImportModal('clients')}>
            <Upload size={13} /> Import Clients
          </button>
        </div>

        {/* Platform import coming soon */}
        <div className="s-import-block">
          <div className="s-import-header">
            <span className="s-import-title">Import from another platform</span>
            <span className="s-soon-badge">Coming soon</span>
          </div>
          <div className="s-import-platforms">
            {['Trainerize', 'TrueCoach', 'Everfit'].map(name => (
              <span key={name} className="s-import-chip">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── §9b Exercise Library Import ───────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={Dumbbell} title="Exercise Library"
          desc="Import your exercise library from a CSV to populate sets, reps, muscle groups, and more." />

        <div className="s-import-block s-import-block--action">
          <div className="s-import-block-left">
            <div className="s-import-block-icon s-import-block-icon--teal"><Dumbbell size={15} /></div>
            <div>
              <div className="s-import-block-title">Import Exercise Library from CSV</div>
              <div className="s-import-block-desc">
                Accepts Name, Description, Muscle Group, Sets, Reps, Video URL.
                Video and image bulk upload coming soon.
              </div>
            </div>
          </div>
          <button className="s-import-action-btn s-import-action-btn--teal" onClick={() => setImportModal('exercises')}>
            <Upload size={13} /> Import Exercises
          </button>
        </div>
      </section>

      {/* ── §10 Appearance ────────────────────────────────────────────────────── */}
      <section className="settings-section">
        <SectionHeader icon={darkMode ? Moon : Sun} title="Appearance"
          desc="Customise how MoveWithMe looks for you." />
        <div className="s-notif-row">
          <div>
            <div className="s-notif-label">Dark mode</div>
            <div className="s-label-hint" style={{ marginTop: 3 }}>
              Easier on the eyes in low-light environments.
            </div>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </div>
      </section>

      {/* ── Import modals ─────────────────────────────────────────────────────── */}
      {importModal && (
        <ImportModal
          type={importModal}
          onClose={() => setImportModal(null)}
          onGoToClients={() => { setImportModal(null); onNavigate?.('clients') }}
        />
      )}
    </div>
  )
}
