import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import './SearchDropdown.css'

/**
 * Reusable searchable dropdown for selecting a person/client.
 *
 * Props:
 *   items              — [{ id, name, avatarGrad, initials }]
 *   selectedId         — id of the currently selected item (optional)
 *   onSelect(id)       — called when an item is clicked
 *   onClear()          — if provided, shows an X button when an item is selected
 *   placeholder        — trigger label when nothing is selected
 *   searchPlaceholder  — placeholder inside the search input
 *   align              — 'left' (default) | 'right' — which edge the menu anchors to
 */
export default function SearchDropdown({
  items,
  selectedId,
  onSelect,
  onClear,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  align = 'left',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  const selected = selectedId != null ? items.find(i => i.id === selectedId) : null
  const filtered = query.trim()
    ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : items

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0)
    else setQuery('')
  }, [open])

  function handleKey(e) {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
    if (e.key === 'Enter' && filtered.length > 0) {
      onSelect(filtered[0].id)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="sd-wrap" ref={ref}>
      <button
        type="button"
        className={`sd-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {selected && (selected.initials ? (
          <div className="sd-avatar" style={{ background: selected.avatarGrad }}>
            {selected.initials}
          </div>
        ) : selected.color ? (
          <div className="sd-color-dot" style={{ background: selected.color }} />
        ) : null)}
        <span className="sd-trigger-text">{selected?.name ?? placeholder}</span>
        {onClear && selected ? (
          <span
            className="sd-clear-btn"
            role="button"
            onClick={e => { e.stopPropagation(); onClear() }}
          >
            <X size={12} />
          </span>
        ) : (
          <ChevronDown size={13} className={`sd-chevron${open ? ' open' : ''}`} />
        )}
      </button>

      {open && (
        <div className={`sd-menu${align === 'right' ? ' sd-menu--right' : ''}`}>
          <div className="sd-search-wrap">
            <input
              ref={inputRef}
              className="sd-search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
            />
          </div>
          <div className="sd-list">
            {filtered.length === 0 ? (
              <p className="sd-empty">No results found</p>
            ) : filtered.map(item => (
              <button
                key={item.id}
                type="button"
                className={`sd-item${item.id === selectedId ? ' active' : ''}`}
                onClick={() => { onSelect(item.id); setOpen(false); setQuery('') }}
              >
                {item.initials ? (
                  <div className="sd-item-avatar" style={{ background: item.avatarGrad }}>
                    {item.initials}
                  </div>
                ) : item.color ? (
                  <div className="sd-color-dot" style={{ background: item.color }} />
                ) : null}
                <span className="sd-item-name">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
