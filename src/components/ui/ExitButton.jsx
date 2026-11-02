/**
 * ExitButton — corner control that leaves the current session and returns the
 * learner to their dashboard. Used on /quality-check, /session, and /results so
 * there's always a way out. 44x44 touch target with a plain-language aria-label
 * (CLAUDE.md UI rules). Renders a close (✕) glyph.
 */
export default function ExitButton({ onClick, label = 'Cancel and go back to my dashboard', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink active:bg-black/5 ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  )
}

/** The same control in the sticker style: white circle, brown outline + ledge. */
export function StickerExitButton({ onClick, label = 'Cancel and go back to my dashboard' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] border-level-tile-edge bg-white text-level-ink shadow-level-tile active:translate-y-1 active:shadow-none"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  )
}
