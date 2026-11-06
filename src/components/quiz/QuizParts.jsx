import { StickerExitButton } from '../ui/ExitButton'
import { SkyCardPage } from '../ui/SkyCardPage'
import { SOFT_PRIMARY } from '../ui/stickerStyles'

// Shared building blocks for the comprehension quiz screens, on the same white
// sky card as the rest of the reading flow, with soft same-colour ledges.

const EXIT_LABEL = 'Stop and go back to my dashboard'

/**
 * The quiz's sky card. `onExit` (optional) adds the ✕ in the top-left corner,
 * `circle` the soft circle at the top, and `className` adds to the card.
 */
export function QuizPage({ children, onExit, circle = false, className = '' }) {
  return (
    <SkyCardPage lumi={false} circle={circle} onExit={onExit} exitLabel={EXIT_LABEL} className={className}>
      {children}
    </SkyCardPage>
  )
}

/** The quiz's ✕ — asks before leaving (SessionScreen shows the dialog). */
export function QuizExitButton({ onClick }) {
  return <StickerExitButton soft onClick={onClick} label={EXIT_LABEL} />
}

/** A column filling the rest of the sky card. */
export function QuizCard({ children, className = '' }) {
  return <div className={`flex flex-1 flex-col ${className}`}>{children}</div>
}

/** Big red button that presses down. Pass its height and text size. */
export function QuizPrimaryButton({ children, onClick, className = '' }) {
  return (
    <button type="button" onClick={onClick} className={`${SOFT_PRIMARY} gap-2.5 px-4 ${className}`}>
      {children}
    </button>
  )
}

export function ArrowRight({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowLeft({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

export function BookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z" />
      <path d="M12 6v14" />
    </svg>
  )
}

export function SpeakerIcon({ size = 22, waves = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      {waves > 1 && <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  )
}
