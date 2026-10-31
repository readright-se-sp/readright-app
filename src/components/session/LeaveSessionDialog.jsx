import { useRef } from 'react'

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
        className="flex w-full max-w-[400px] flex-col items-center rounded-[28px] border-2 border-card-border bg-[#fffdfc] px-6 pb-6 pt-7 text-center font-display text-ink shadow-[0_18px_40px_rgba(120,60,50,0.25)]"
      >
        <img src="/mascot-reading.svg" alt="" className="h-auto w-[88px]" />
        <h2 id="leave-title" className="mt-3 text-[24px] font-black leading-tight">
          Stop reading now?
        </h2>
        <p id="leave-desc" className="mt-2 text-[17px] leading-[1.45] text-ink-soft text-pretty">
          If you stop, your reading won’t be saved. You can start again from your dashboard.
        </p>
        <button
          ref={stayRef}
          type="button"
          autoFocus
          onClick={onStay}
          className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-full bg-brand py-4 text-[20px] font-extrabold text-white shadow-[0_5px_0_#871f1a] active:translate-y-1 active:shadow-[0_1px_0_#871f1a]"
        >
          Keep going
        </button>
        <button
          ref={leaveRef}
          type="button"
          onClick={onLeave}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-full border-2 border-card-border bg-white py-3.5 text-[18px] font-extrabold text-brand"
        >
          Yes, stop
        </button>
      </div>
    </div>
  )
}
