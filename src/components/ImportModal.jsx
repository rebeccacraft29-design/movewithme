import { useState, useRef } from 'react'
import {
  X, Upload, Download, AlertTriangle, CheckCircle2,
  Users, ArrowRight, Dumbbell,
} from 'lucide-react'
import './ImportModal.css'

// ── Column definitions ────────────────────────────────────────────────────────

const CLIENT_COLUMNS = [
  { key: 'firstName',   header: 'First Name',   required: true,  mapsTo: 'Name' },
  { key: 'lastName',    header: 'Last Name',    required: false, mapsTo: 'Name (combined)' },
  { key: 'email',       header: 'Email',        required: true,  mapsTo: 'Email' },
  { key: 'phone',       header: 'Phone',        required: false, mapsTo: 'Phone' },
  { key: 'serviceType', header: 'Service Type', required: false, mapsTo: 'Service Type' },
  { key: 'notes',       header: 'Notes',        required: false, mapsTo: 'Notes' },
]

const EXERCISE_COLUMNS = [
  { key: 'name',        header: 'Name',         required: true,  mapsTo: 'Exercise Name' },
  { key: 'description', header: 'Description',  required: false, mapsTo: 'Description' },
  { key: 'muscleGroup', header: 'Muscle Group', required: false, mapsTo: 'Muscle Group' },
  { key: 'sets',        header: 'Sets',         required: false, mapsTo: 'Sets' },
  { key: 'reps',        header: 'Reps',         required: false, mapsTo: 'Reps' },
  { key: 'videoUrl',    header: 'Video URL',    required: false, mapsTo: 'Video URL' },
]

const CLIENT_SAMPLE =
`First Name,Last Name,Email,Phone,Service Type,Notes
Sarah,Johnson,sarah@example.com,0412 345 678,Strength Training,Former athlete — focus on mobility
James,Lee,james.lee@email.com,0498 765 432,Rehabilitation,Post-knee surgery recovery
Maria,Costa,maria@gmail.com,,HIIT,Prefers morning sessions
Tom,Watts,tom.watts@email.com,0411 222 333,Personal Training,
`

const EXERCISE_SAMPLE =
`Name,Description,Muscle Group,Sets,Reps,Video URL
Barbell Squat,Classic compound lower body movement,Legs,4,8,
Push-Up,Bodyweight chest press,Chest,3,15,
Deadlift,Full body posterior chain exercise,Back,3,5,
Romanian Deadlift,Hinge movement targeting hamstrings,Hamstrings,3,10,
`

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  }).filter(row => Object.values(row).some(v => v.trim()))
  return { headers, rows }
}

function rowMissingRequired(row, columns) {
  return columns.filter(c => c.required).some(c => !row[c.header]?.trim())
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBar({ step }) {
  const labels = ['Upload', 'Preview', 'Confirm', 'Done']
  return (
    <div className="im-steps">
      {labels.map((label, i) => (
        <div key={label} className="im-step-item">
          <div className={`im-step-dot ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            {step > i + 1 ? <CheckCircle2 size={13} /> : <span>{i + 1}</span>}
          </div>
          <span className={`im-step-label ${step === i + 1 ? 'active' : ''}`}>{label}</span>
          {i < 3 && <div className={`im-step-line ${step > i + 1 ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportModal({ type, onClose, onGoToClients }) {
  const [step,       setStep]       = useState(1)
  const [dragOver,   setDragOver]   = useState(false)
  const [parsed,     setParsed]     = useState(null)
  const [fileName,   setFileName]   = useState('')
  const fileInputRef = useRef(null)

  const isClients = type === 'clients'
  const columns   = isClients ? CLIENT_COLUMNS : EXERCISE_COLUMNS
  const sample    = isClients ? CLIENT_SAMPLE  : EXERCISE_SAMPLE
  const sampleFn  = isClients ? 'clients_template.csv' : 'exercises_template.csv'
  const noun      = isClients ? 'client' : 'exercise'

  const totalRows   = parsed?.rows.length ?? 0
  const skippedRows = parsed?.rows.filter(r => rowMissingRequired(r, columns)).length ?? 0
  const validRows   = totalRows - skippedRows

  // visible columns = those that actually exist in uploaded headers
  const visibleCols = parsed
    ? columns.filter(c => parsed.headers.includes(c.header))
    : columns

  function loadFile(file) {
    if (!file?.name.toLowerCase().endsWith('.csv')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      setParsed(parseCSV(e.target.result))
      setStep(2)
    }
    reader.readAsText(file)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="im-overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="im-modal">

        {/* Header */}
        <div className="im-header">
          <div className="im-header-left">
            <div className="im-header-icon">
              {isClients ? <Users size={15} /> : <Dumbbell size={15} />}
            </div>
            <div>
              <div className="im-title">
                {isClients ? 'Import Clients' : 'Import Exercise Library'}
              </div>
              <div className="im-subtitle">Step {step} of 4</div>
            </div>
          </div>
          <button className="im-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <StepBar step={step} />

        {/* Body */}
        <div className="im-body">

          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <>
              <div
                className={`im-dropzone ${dragOver ? 'im-dropzone--over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]) }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div className="im-dropzone-icon-wrap">
                  <Upload size={24} />
                </div>
                <div className="im-dropzone-title">Drop your CSV here, or click to browse</div>
                <div className="im-dropzone-sub">CSV files only · UTF-8 encoding recommended</div>
              </div>
              <input
                ref={fileInputRef} type="file" accept=".csv"
                className="im-hidden" onChange={e => loadFile(e.target.files[0])}
              />

              <div className="im-format-card">
                <div className="im-format-heading">Accepted columns</div>
                <div className="im-col-chips">
                  {columns.map(c => (
                    <span key={c.key} className={`im-col-chip ${c.required ? 'im-col-chip--req' : ''}`}>
                      {c.header}
                      {c.required && <span className="im-req-star">*</span>}
                    </span>
                  ))}
                </div>
                <div className="im-format-hint">* Required fields — rows missing these will be skipped</div>
              </div>

              <button className="im-sample-btn" onClick={() => downloadCSV(sample, sampleFn)}>
                <Download size={13} />
                Download sample CSV template
              </button>

              {!isClients && (
                <div className="im-coming-note">
                  Video and image bulk upload coming soon.
                </div>
              )}
            </>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 2 && parsed && (
            <>
              <div className="im-preview-bar">
                <div className="im-preview-count">
                  <span className="im-count-big">{totalRows}</span>
                  <span className="im-count-label">{noun}{totalRows !== 1 ? 's' : ''} found</span>
                </div>
                {skippedRows > 0 && (
                  <div className="im-warn-pill">
                    <AlertTriangle size={12} />
                    {skippedRows} row{skippedRows !== 1 ? 's' : ''} missing required fields
                  </div>
                )}
              </div>

              <div className="im-mapping-card">
                <div className="im-mapping-heading">Column mapping</div>
                <div className="im-mapping-list">
                  {visibleCols.map(c => (
                    <div key={c.key} className="im-mapping-row">
                      <span className="im-map-from">"{c.header}"</span>
                      <ArrowRight size={11} className="im-map-arrow" />
                      <span className="im-map-to">{c.mapsTo}</span>
                      {c.required && <span className="im-map-req-tag">required</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="im-table-section">
                <div className="im-table-label">
                  Preview — first {Math.min(5, totalRows)} of {totalRows} row{totalRows !== 1 ? 's' : ''}
                </div>
                <div className="im-table-scroll">
                  <table className="im-table">
                    <thead>
                      <tr>
                        {visibleCols.map(c => <th key={c.key}>{c.header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className={rowMissingRequired(row, columns) ? 'im-tr--warn' : ''}>
                          {visibleCols.map(c => (
                            <td key={c.key} className={c.required && !row[c.header]?.trim() ? 'im-td--missing' : ''}>
                              {row[c.header]?.trim()
                                ? row[c.header]
                                : <span className="im-td-empty">—</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalRows > 5 && (
                  <div className="im-table-more">+{totalRows - 5} more rows not shown</div>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && (
            <div className="im-centered">
              <div className="im-confirm-icon-wrap">
                <Upload size={26} />
              </div>
              <div className="im-confirm-heading">
                Ready to import {validRows} {noun}{validRows !== 1 ? 's' : ''}
              </div>
              {skippedRows > 0 && (
                <div className="im-confirm-skip-note">
                  <AlertTriangle size={13} />
                  {skippedRows} row{skippedRows !== 1 ? 's' : ''} skipped due to missing{' '}
                  {columns.filter(c => c.required).map(c => c.header.toLowerCase()).join(' or ')}
                </div>
              )}
              <div className="im-confirm-file-chip">
                <span className="im-confirm-fname">{fileName}</span>
                <span className="im-confirm-fcount">{totalRows} rows total</span>
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <div className="im-centered">
              <div className="im-success-icon-wrap">
                <CheckCircle2 size={40} />
              </div>
              <div className="im-success-heading">
                {validRows} {noun}{validRows !== 1 ? 's' : ''} imported successfully
              </div>
              {skippedRows > 0 && (
                <div className="im-success-skip-note">
                  {skippedRows} row{skippedRows !== 1 ? 's' : ''} skipped — missing required fields
                </div>
              )}
              {isClients && onGoToClients && (
                <button className="im-view-clients-btn" onClick={onGoToClients}>
                  <Users size={14} /> View Clients
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="im-footer">
          {step === 1 && (
            <button className="im-btn im-btn--ghost" onClick={onClose}>Cancel</button>
          )}
          {step === 2 && (
            <>
              <button className="im-btn im-btn--ghost" onClick={() => setStep(1)}>Back</button>
              <button className="im-btn im-btn--primary" onClick={() => setStep(3)}>
                Continue <ArrowRight size={13} />
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button className="im-btn im-btn--ghost" onClick={() => setStep(2)}>Back</button>
              <button className="im-btn im-btn--import" onClick={() => setStep(4)}>
                Import {validRows} {noun}{validRows !== 1 ? 's' : ''}
              </button>
            </>
          )}
          {step === 4 && (
            <button className="im-btn im-btn--ghost" onClick={onClose}>Close</button>
          )}
        </div>

      </div>
    </div>
  )
}
