import { useRef } from 'react'
import { SOFT_PRIMARY, SOFT_SECONDARY } from '../ui/stickerStyles'

/**
 * LeaveSessionDialog — "Stop reading now?" confirmation, shown only when leaving
 * would throw work away (during recording or the comprehension quiz). Sessions
 * are all-or-nothing, so stopping discards the reading.
 *
 * "Keep going" is the big, safe default and gets focus; Esc and tapping outside
 * also mean "Keep going". Tab stays inside the dialog.
 */
export function LeaveSessionDialog({ onStay, onLeave }) {
  const stayRef = useRef(null)
  const leaveRef = useRef(null)

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 px-4 pb-6 sm:items-center sm:pb-0"
      onClick={onStay}
      onKeyDown={handleKeyDown}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-desc"
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-[400px] flex-col items-center rounded-[28px] bg-white px-6 pb-6 pt-7 text-center font-display text-ink shadow-ledge-blue"
      >
        <span className="flex size-28 items-center justify-center rounded-full bg-level-blob">
          <img src="/mascot-reading.svg" alt="" className="h-auto w-[84px]" />
        </span>
        <h2 id="leave-title" className="mt-3 text-[26px] font-black leading-tight text-level-ink">
          Stop reading now?
        </h2>
        <p id="leave-desc" className="mt-2 text-[17px] font-bold leading-[1.45] text-level-muted text-pretty">
          If you stop, your reading won’t be saved. You can start again from your dashboard.
        </p>
        <button
          ref={stayRef}
          type="button"
          autoFocus
          onClick={onStay}
          className={`${SOFT_PRIMARY} mt-6 min-h-14 px-4 text-xl`}
        >
          Keep going
        </button>
        <button
          ref={leaveRef}
          type="button"
          onClick={onLeave}
          className={`${SOFT_SECONDARY} mt-3.5 min-h-14 px-4 text-lg`}
        >
          Yes, stop
        </button>
      </div>
    </div>
  )
}
