import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../../hooks/useScrollLock'
import { SOFT_LEAVE, SOFT_PRIMARY } from '../ui/stickerStyles'
import { GridPattern } from '../dashboard/DashboardParts'

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
      // Centred on every screen size. m-auto on the card (not items-center) so a
      // short phone screen scrolls instead of cutting off the top of the card.
      className="fixed inset-0 z-50 flex overflow-y-auto overscroll-contain bg-ink/45 px-4 py-6"
      onClick={onStay}
      onKeyDown={handleKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-desc"
        onClick={(e) => e.stopPropagation()}
        className="m-auto w-full max-w-[400px] overflow-clip rounded-[28px] border-[3px] border-track-yellow-edge bg-cream-button text-center font-display text-ink shadow-track-yellow motion-safe:animate-pop-in"
      >
        {/* Yellow grid band across the top, with a few shapes. */}
        <div aria-hidden="true" className="relative h-[112px] border-b-[5px] border-track-yellow-edge bg-track-yellow">
          <GridPattern cell={22} color="white" opacity={0.45} />
          <span className="absolute left-[10%] top-[20%] size-3 rounded-full bg-coral" />
          <span className="absolute left-[16%] top-[58%] size-3.5 rotate-45 rounded-[3px] bg-tile-blue" />
          <span className="absolute right-[11%] top-[24%] size-4 rotate-45 rounded-[3px] bg-white" />
        </div>

        <div className="flex flex-col items-center px-6 pb-6">
          {/* Lumi in a round frame, half over the band, on the same sky as the
              dashboard (peach blended with Lumi's red head and yellow body). */}
          <span className="relative -mt-[72px] flex size-[136px] items-center justify-center overflow-clip rounded-full border-[6px] border-cream-button bg-linear-to-b from-sky-top to-sky-bottom shadow-cream-edge">
            {/* Sad Lumi — sorry to see the learner go. Kept still on purpose. */}
            <img src="/images/mascot/mascot-sad.png" alt="" className="h-[108px] w-auto" />
          </span>
          <h2 id="sign-out-title" className="mt-4 text-[28px] font-black leading-tight text-ink">
            Going so soon?
          </h2>
          <p id="sign-out-desc" className="mt-2 text-lg font-bold leading-[1.45] text-ink-soft text-pretty">
            Come back soon! Lumi will miss you!
          </p>
          <button
            ref={stayRef}
            type="button"
            autoFocus
            onClick={onStay}
            disabled={signingOut}
            className={`${SOFT_PRIMARY} mt-6 min-h-14 px-4 text-xl`}
          >
            Stay with Lumi
          </button>
          <button
            ref={leaveRef}
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className={`${SOFT_LEAVE} mt-4 min-h-14 px-4 text-lg`}
          >
            {signingOut ? 'Bye for now…' : 'Yes, sign out'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
