import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import './GuidedTour.css'

const TOUR_STEPS = [
  {
    targetId: 'tour-dashboard',
    title: 'Your command center',
    body: "This is your daily overview — key stats, smart insights, and today's most important items at a glance.",
    placement: 'bottom',
  },
  {
    targetId: 'tour-attention',
    title: "Clients needing attention",
    body: 'Clients who haven\'t logged recent activity bubble up here so nothing ever falls through the cracks.',
    placement: 'right',
  },
  {
    targetId: 'tour-clients',
    title: 'Your clients',
    body: 'View and manage all your clients — profiles, assigned programs, session history, and progress.',
    placement: 'right',
  },
  {
    targetId: 'tour-fab',
    title: 'New session — quick add',
    body: 'Tap the + button any time to instantly schedule a new session with any client.',
    placement: 'top',
  },
  {
    targetId: 'tour-programs',
    title: 'Program builder',
    body: 'Build and assign custom training programs. Clients can follow along and log their progress.',
    placement: 'right',
  },
]

const PADDING = 10

export default function GuidedTour({ onEnd }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState(null)

  const step = TOUR_STEPS[stepIndex]

  const measureTarget = useCallback(() => {
    const el = document.getElementById(step.targetId)
    if (el) {
      setRect(el.getBoundingClientRect())
    } else {
      setRect(null)
    }
  }, [step.targetId])

  useEffect(() => {
    measureTarget()
    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, true)
    return () => {
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  }, [measureTarget])

  function handleNext() {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      onEnd()
    }
  }

  function handleSkip() {
    onEnd()
  }

  if (!rect) return null

  const spotLeft   = rect.left   - PADDING
  const spotTop    = rect.top    - PADDING
  const spotWidth  = rect.width  + PADDING * 2
  const spotHeight = rect.height + PADDING * 2

  const isLast = stepIndex === TOUR_STEPS.length - 1

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Guided tour">
      {/* Dark overlay with spotlight hole via clip-path */}
      <svg className="tour-backdrop" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotLeft}
              y={spotTop}
              width={spotWidth}
              height={spotHeight}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.72)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      <div
        className="tour-spotlight"
        style={{
          left:   spotLeft,
          top:    spotTop,
          width:  spotWidth,
          height: spotHeight,
        }}
      />

      {/* Tooltip */}
      <TourTooltip
        step={step}
        stepIndex={stepIndex}
        total={TOUR_STEPS.length}
        rect={{ left: spotLeft, top: spotTop, width: spotWidth, height: spotHeight }}
        isLast={isLast}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </div>
  )
}

function TourTooltip({ step, stepIndex, total, rect, isLast, onNext, onSkip }) {
  const placement = step.placement
  const TOOLTIP_W = 280
  const TOOLTIP_H = 140  // approximate — real height set by CSS
  const GAP = 14

  let style = {}

  if (placement === 'bottom') {
    style = {
      left: Math.max(12, rect.left + rect.width / 2 - TOOLTIP_W / 2),
      top:  rect.top + rect.height + GAP,
    }
  } else if (placement === 'top') {
    style = {
      left: Math.max(12, rect.left + rect.width / 2 - TOOLTIP_W / 2),
      top:  rect.top - TOOLTIP_H - GAP,
    }
  } else if (placement === 'right') {
    style = {
      left: rect.left + rect.width + GAP,
      top:  Math.max(12, rect.top + rect.height / 2 - TOOLTIP_H / 2),
    }
  } else {
    style = {
      left: Math.max(12, rect.left - TOOLTIP_W - GAP),
      top:  Math.max(12, rect.top + rect.height / 2 - TOOLTIP_H / 2),
    }
  }

  // Clamp to viewport
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (style.left + TOOLTIP_W > vw - 12) style.left = vw - TOOLTIP_W - 12
  if (style.top + TOOLTIP_H > vh - 12)  style.top  = vh - TOOLTIP_H - 12
  if (style.left < 12) style.left = 12
  if (style.top  < 12) style.top  = 12

  return (
    <div
      className={`tour-tooltip tour-tooltip-${placement}`}
      style={{ ...style, width: TOOLTIP_W }}
      role="status"
    >
      <div className="tour-tooltip-header">
        <div className="tour-step-counter">{stepIndex + 1} / {total}</div>
        <button className="tour-close-btn" onClick={onSkip} aria-label="Skip tour">
          <X size={14} />
        </button>
      </div>

      <h4 className="tour-tooltip-title">{step.title}</h4>
      <p  className="tour-tooltip-body">{step.body}</p>

      <div className="tour-tooltip-footer">
        <button className="tour-skip-link" onClick={onSkip}>Skip tour</button>
        <button className="tour-next-btn" onClick={onNext}>
          {isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  )
}
