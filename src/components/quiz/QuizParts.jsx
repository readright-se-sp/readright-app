import ExitButton from '../ui/ExitButton'

// Shared building blocks for the comprehension quiz screens.

/**
 * Full-height page in the quiz's blush background, mobile-first column.
 * `onExit` (optional) adds the ✕ in the top-left corner.
 */
export function QuizPage({ children, onExit, className = '' }) {
  return (
    <div className="min-h-dvh bg-[#f4e8e6] font-display text-ink">
      <div className={`mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-7 pt-6 ${className}`}>
        {onExit && (
          <div className="-ml-1 -mt-2 mb-2 flex">
            <QuizExitButton onClick={onExit} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/** The quiz's ✕ — asks before leaving (SessionScreen shows the dialog). */
export function QuizExitButton({ onClick }) {
  return (
    <ExitButton
      onClick={onClick}
      label="Stop and go back to my dashboard"
      className="flex-none bg-white/70 text-ink-soft"
    />
  )
}

/** White rounded card used by the intro and done screens. */
export function QuizCard({ children, className = '' }) {
  return (
    <div
      className={`flex flex-1 flex-col rounded-[24px] border-[1.5px] border-card-border bg-[#fefcfc] shadow-[0_10px_30px_rgba(120,50,40,0.08)] ${className}`}
    >
      {children}
    </div>
  )
}

/** Big brand "pill" button with the pressable bottom edge. */
export function QuizPrimaryButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full bg-brand text-white shadow-[0_5px_0_#871f1a] active:translate-y-1 active:shadow-[0_1px_0_#871f1a] ${className}`}
    >
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
