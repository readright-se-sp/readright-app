import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../../hooks/useScrollLock'
import { STICKER_PRIMARY, STICKER_SECONDARY } from '../ui/stickerStyles'

/**
 * SignOutDialog — "Going so soon?" confirmation: friendly, but few, simple words. Learners use the app
 * on their own, and signing back in means typing their email and password
 * again, so an accidental tap shouldn't sign them out.
 *
 * Same pattern as LeaveSessionDialog: "Stay with Lumi" is the big, safe
 * default and gets focus; Esc and tapping outside also mean "stay". Tab stays
 * inside the dialog and the page behind can't scroll.
 *
 * Rendered into <body> with a portal: ProfileMenu sits inside the sticky
 * navbar, whose stacking context would otherwise put this under the sticky
 * Start Reading bar.
 */
export function SignOutDialog({ onStay, onSignOut, signingOut }) {
  const stayRef = useRef(null)
  const leaveRef = useRef(null)
  useScrollLock()

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onStay()
      return
    }
    if (e.key === 'Tab') {
      // Two buttons: keep focus cycling between them.
      e.preventDefault()
      const next = document.activeElement === stayRef.current ? leaveRef.current : stayRef.current
      next?.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-ink/45 px-4 pb-6 sm:items-center sm:pb-0"
      onClick={onStay}
      onKeyDown={handleKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-desc"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[400px] flex-col items-center rounded-[28px] border-[3px] border-level-tile-edge bg-level-card px-6 pb-6 pt-7 text-center font-display text-ink shadow-level-tile"
      >
        <span className="flex size-28 items-center justify-center rounded-full bg-level-blob">
          <img src="/mascot-waving.svg" alt="" className="h-[92px] w-auto motion-safe:animate-lumi-bob" />
        </span>
        <h2 id="sign-out-title" className="mt-3 text-[26px] font-black leading-tight text-level-ink">
          Going so soon?
        </h2>
        <p id="sign-out-desc" className="mt-2 text-[18px] font-bold leading-[1.45] text-level-muted text-pretty">
          Come back soon! You’ll need your email and password.
        </p>
        <button
          ref={stayRef}
          type="button"
          autoFocus
          onClick={onStay}
          disabled={signingOut}
          className={`${STICKER_PRIMARY} mt-6 min-h-14 px-4 text-xl`}
        >
          Stay with Lumi
        </button>
        <button
          ref={leaveRef}
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className={`${STICKER_SECONDARY} mt-3.5 min-h-14 px-4 text-lg`}
        >
          {signingOut ? 'Bye for now…' : 'Yes, sign out'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
