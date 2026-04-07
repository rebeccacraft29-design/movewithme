import { useState, useRef } from 'react'
import {
  Zap, ChevronRight, User, Camera, Check,
  Briefcase, Users, LayoutDashboard, ClipboardList,
} from 'lucide-react'
import './Onboarding.css'

const ROLES = [
  'Personal Trainer',
  'Physiotherapist',
  'Chiropractor',
  'Massage Therapist',
  'Nutritionist',
  'Other',
]

const SESSION_DURATIONS = ['30 min', '45 min', '60 min', '90 min']
const CLIENT_COUNTS     = ['1–5', '6–15', '16–30', '30+']

export default function Onboarding({ onComplete }) {
  const [step, setStep]               = useState(1)
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [photoUrl, setPhotoUrl]       = useState(null)
  const [roles, setRoles]             = useState([])
  const [businessName, setBusinessName] = useState('')
  const [sessionDuration, setSessionDuration] = useState('60 min')
  const [clientCount, setClientCount] = useState('1–5')
  const photoInputRef = useRef(null)

  function toggleRole(role) {
    setRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotoUrl(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleFinish(action) {
    onComplete({
      firstName,
      lastName,
      photoUrl,
      roles,
      businessName,
      sessionDuration,
      clientCount,
      startAction: action,
    })
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-bg">
        <div className="ob-blob ob-blob-1" />
        <div className="ob-blob ob-blob-2" />
      </div>

      <div className="onboarding-card">
        {/* Logo */}
        <div className="ob-logo">
          <div className="ob-logo-icon"><Zap size={18} /></div>
          <span>MoveWithMe</span>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="ob-progress">
            {[1, 2, 3].map(n => (
              <div key={n} className="ob-progress-step">
                <div className={`ob-dot ${step > n ? 'done' : step === n ? 'active' : ''}`}>
                  {step > n ? <Check size={11} /> : n}
                </div>
                {n < 3 && <div className={`ob-progress-line ${step > n ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="ob-step">
            <div className="ob-step-header">
              <h2>Who are you?</h2>
              <p>Tell us a bit about yourself to personalise your experience.</p>
            </div>

            {/* Photo upload */}
            <div className="ob-photo-row">
              <button
                type="button"
                className="ob-photo-btn"
                onClick={() => photoInputRef.current?.click()}
                aria-label="Upload profile photo"
              >
                {photoUrl
                  ? <img src={photoUrl} alt="Profile" className="ob-photo-preview" />
                  : <Camera size={22} className="ob-photo-placeholder-icon" />
                }
                <div className="ob-photo-overlay"><Camera size={14} /></div>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="ob-hidden-input"
                onChange={handlePhotoChange}
              />
              <div className="ob-photo-label">
                <span>Profile photo</span>
                <span className="ob-optional">Optional</span>
              </div>
            </div>

            {/* Name */}
            <div className="ob-field-row">
              <div className="ob-field">
                <label>First name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
              <div className="ob-field">
                <label>Last name</label>
                <input
                  type="text"
                  placeholder="e.g. Smith"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Role */}
            <div className="ob-field">
              <label>
                Your role <span className="ob-required">Select at least one</span>
              </label>
              <div className="ob-roles-grid">
                {ROLES.map(role => (
                  <button
                    key={role}
                    type="button"
                    className={`ob-role-chip ${roles.includes(role) ? 'selected' : ''}`}
                    onClick={() => toggleRole(role)}
                  >
                    {roles.includes(role) && <Check size={12} />}
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="ob-next-btn"
              onClick={() => setStep(2)}
              disabled={roles.length === 0 || !firstName.trim()}
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="ob-step">
            <div className="ob-step-header">
              <h2>Your practice</h2>
              <p>Help us set up defaults that match how you work.</p>
            </div>

            <div className="ob-field">
              <label>
                Business or practice name <span className="ob-optional-label">Optional</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Peak Performance Training"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div className="ob-field">
              <label>Default session duration</label>
              <div className="ob-pills">
                {SESSION_DURATIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`ob-pill ${sessionDuration === d ? 'selected' : ''}`}
                    onClick={() => setSessionDuration(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-field">
              <label>How many clients do you currently work with?</label>
              <div className="ob-pills">
                {CLIENT_COUNTS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`ob-pill ${clientCount === c ? 'selected' : ''}`}
                    onClick={() => setClientCount(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="ob-field-hint">Used to personalise your experience — no pressure.</p>
            </div>

            <div className="ob-btn-row">
              <button className="ob-back-btn" onClick={() => setStep(1)}>Back</button>
              <button className="ob-next-btn" onClick={() => setStep(3)}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Celebration ── */}
        {step === 3 && (
          <div className="ob-step ob-step-celebration">
            <div className="ob-confetti-row">
              {['🎉','✨','🚀'].map((e, i) => <span key={i} className="ob-emoji">{e}</span>)}
            </div>

            <h2 className="ob-welcome-title">
              Welcome to MoveWithMe{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p className="ob-welcome-sub">
              Your account is ready. Here's how you'd like to get started:
            </p>

            <div className="ob-quickstart-grid">
              <button
                className="ob-quickstart-card"
                onClick={() => handleFinish('clients')}
              >
                <div className="ob-qs-icon ob-qs-coral"><User size={22} /></div>
                <strong>Add your first client</strong>
                <span>Set up a client profile and start tracking their progress.</span>
              </button>
              <button
                className="ob-quickstart-card"
                onClick={() => handleFinish('programs')}
              >
                <div className="ob-qs-icon ob-qs-teal"><ClipboardList size={22} /></div>
                <strong>Build your first program</strong>
                <span>Create a training program from scratch or from a template.</span>
              </button>
              <button
                className="ob-quickstart-card"
                onClick={() => handleFinish('dashboard')}
              >
                <div className="ob-qs-icon ob-qs-amber"><LayoutDashboard size={22} /></div>
                <strong>Explore the dashboard</strong>
                <span>See your overview, today's attention items, and key stats.</span>
              </button>
            </div>

            <div className="ob-tour-row">
              <p className="ob-tour-hint">Want a quick tour? We'll show you around.</p>
              <button
                className="ob-tour-btn"
                onClick={() => handleFinish('tour')}
              >
                Start Tour
              </button>
              <button
                className="ob-skip-link"
                onClick={() => handleFinish('dashboard')}
              >
                Skip, I'll explore myself
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
