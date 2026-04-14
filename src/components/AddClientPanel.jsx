import { useState, useEffect } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { addClient, getAvatarGrad } from '../lib/db'
import { supabase } from '../lib/supabase'
import SearchDropdown from './SearchDropdown'
import './AddClientPanel.css'

const DB_TO_ROLE = {
  personal_trainer:  'Personal Trainer',
  physiotherapist:   'Physiotherapist',
  chiropractor:      'Chiropractor',
  massage_therapist: 'Massage Therapist',
  nutritionist:      'Nutritionist',
  other:             'Other',
}

export default function AddClientPanel({ onClose, onClientAdded }) {
  const { trainer, user } = useAuth()
  const [serviceTypes, setServiceTypes] = useState([])
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState(null)
  const [form, setForm] = useState({
    firstName:     '',
    lastName:      '',
    email:         '',
    phone:         '',
    serviceType:   '',
    healthContext: '',
    notes:         '',
  })

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('trainer_roles')
      .select('role_type')
      .eq('trainer_id', user.id)
      .then(({ data }) => {
        const roles = (data ?? []).map(r => ({
          id:   r.role_type,
          name: DB_TO_ROLE[r.role_type] ?? r.role_type,
        }))
        setServiceTypes(roles)
        if (roles.length > 0) {
          setForm(f => ({ ...f, serviceType: roles[0].id }))
        }
      })
  }, [user?.id])

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const row = await addClient(trainer.id, {
        firstName:     form.firstName.trim(),
        lastName:      form.lastName.trim(),
        email:         form.email.trim()         || null,
        phone:         form.phone.trim()         || null,
        serviceType:   form.serviceType          || 'personal_trainer',
        healthContext: form.healthContext.trim()  || null,
        notes:         form.notes.trim()          || null,
      })
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`
      onClientAdded({
        id:                  row.id,
        name,
        initials:            `${form.firstName.trim()[0]}${form.lastName.trim()[0]}`.toUpperCase(),
        avatarGrad:          getAvatarGrad(name),
        serviceType:         row.service_type,
        status:              'active',
        startDate:           row.created_at?.slice(0, 10),
        healthConditions:    form.healthContext.trim() ? [form.healthContext.trim()] : [],
        attentionFlag:       null,
        nextSession:         null,
        lastSeen:            null,
        currentPlan:         null,
        trainerSessions:     [],
        independentSessions: [],
        goals:               [],
        _firstName:          form.firstName.trim(),
        _lastName:           form.lastName.trim(),
        _email:              form.email.trim()   || null,
        _phone:              form.phone.trim()   || null,
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="acp-overlay" onClick={onClose}>
      <div className="acp-panel" onClick={e => e.stopPropagation()}>

        <div className="acp-header">
          <div className="acp-header-left">
            <UserPlus size={16} className="acp-header-icon" />
            <h3 className="acp-title">Add Client</h3>
          </div>
          <button className="acp-close" onClick={onClose}><X size={15} /></button>
        </div>

        <form className="acp-form" onSubmit={handleSubmit}>

          <div className="acp-row2">
            <div className="acp-field">
              <label>First name <span className="acp-req">*</span></label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
                placeholder="Jamie"
                required
                autoFocus
              />
            </div>
            <div className="acp-field">
              <label>Last name <span className="acp-req">*</span></label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          <div className="acp-row2">
            <div className="acp-field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="jamie@email.com"
              />
            </div>
            <div className="acp-field">
              <label>Phone <span className="acp-opt">optional</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+61 4xx xxx xxx"
              />
            </div>
          </div>

          <div className="acp-field">
            <label>Service type</label>
            <SearchDropdown
              items={serviceTypes}
              selectedId={form.serviceType || null}
              onSelect={id => set('serviceType', id)}
              onClear={() => set('serviceType', '')}
              placeholder="Select service type…"
              searchPlaceholder="Search…"
            />
          </div>

          <div className="acp-field">
            <label>Health context / conditions <span className="acp-opt">optional</span></label>
            <textarea
              value={form.healthContext}
              onChange={e => set('healthContext', e.target.value)}
              placeholder="e.g. Lower back pain, knee injury, diabetes…"
              rows={2}
            />
          </div>

          <div className="acp-field">
            <label>Notes <span className="acp-opt">optional</span></label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any other notes about this client…"
              rows={2}
            />
          </div>

          {error && <p className="acp-error">{error}</p>}

          <div className="acp-actions">
            <button type="button" className="acp-btn acp-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="acp-btn acp-btn--save" disabled={saving}>
              {saving ? 'Saving…' : 'Add client'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
