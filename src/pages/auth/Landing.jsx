import { useState } from 'react'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export default function Landing({ onSignUp, onLogin }) {
  const { signUp, signInWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [emailSent,    setEmailSent]    = useState(false)

  async function handleEmailSignUp(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { session } = await signUp(email, password)
      if (!session) {
        // Email confirmation required
        setEmailSent(true)
      } else {
        onSignUp()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
      // Redirect happens automatically
    } catch (err) {
      setError(err.message)
    }
  }

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
          <div className="auth-blob auth-blob-3" />
        </div>
        <div className="auth-card auth-card-centered">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Zap size={22} /></div>
            <span className="auth-logo-text">MoveWithMe</span>
          </div>
          <h1 className="auth-card-title">Check your email</h1>
          <p className="auth-card-sub">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and continue to onboarding.
          </p>
          <p className="auth-switch">
            Already confirmed?{' '}
            <button type="button" onClick={onLogin}>Log in</button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
      </div>

      <div className="auth-split">
        <div className="auth-hero">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Zap size={22} /></div>
            <span className="auth-logo-text">MoveWithMe</span>
          </div>
          <h2 className="auth-hero-headline">
            The all-in-one platform for fitness professionals.
          </h2>
          <p className="auth-hero-sub">
            Programs, scheduling, client progress, and messaging — built for the way you actually work.
          </p>
          <ul className="auth-hero-list">
            <li><span className="hero-check">✓</span> Build and assign custom programs</li>
            <li><span className="hero-check">✓</span> Track client progress automatically</li>
            <li><span className="hero-check">✓</span> Smart alerts for clients needing attention</li>
            <li><span className="hero-check">✓</span> Schedule and manage sessions in one place</li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-logo auth-logo-mobile">
            <div className="auth-logo-icon"><Zap size={20} /></div>
            <span className="auth-logo-text">MoveWithMe</span>
          </div>

          <h1 className="auth-card-title">Create your free account</h1>
          <p className="auth-card-sub">No credit card required. Up and running in minutes.</p>

          <button className="btn-google" onClick={handleGoogle} disabled={loading}>
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="auth-divider"><span>or sign up with email</span></div>

          <form className="auth-form" onSubmit={handleEmailSignUp}>
            <div className="auth-field">
              <Mail size={16} className="auth-field-icon" />
              <input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <Lock size={16} className="auth-field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-field-toggle"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-primary-auth" disabled={loading}>
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={onLogin}>Log in</button>
          </p>

          <p className="auth-legal">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
      <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"/>
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" fill="#EA4335"/>
    </svg>
  )
}
