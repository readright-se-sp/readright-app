import { useRef, useState } from 'react'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { PASSAGE_GRADES } from '../../utils/gradeLevels'

/**
 * GradePicker — compact "Grade 4 ▾" button that sits beside Start Reading and
 * opens a row of big grade chips above it. Lets the learner choose which
 * grade's story to read; defaults (in the parent) to their registered grade so
 * it adds no required tap to the session flow.
 *
 * UI only for now: the parent passes the chosen grade along, but passage
 * selection does not filter by grade yet (see DashboardPage).
 *
 * `align` positions the chip popover: 'left' (flush with the picker's left
 * edge — for the bottom bar) or 'center' (centered under a centered picker).
 */
export default function GradePicker({ value, onChange, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false), open)

  function pick(grade) {
    onChange(grade)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Story level: Grade ${value}. Tap to change.`}
        className="flex min-h-[44px] h-full flex-col items-center justify-center rounded-[18px] border-2 border-card-border bg-white px-3.5 py-1.5 leading-tight"
      >
        <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-muted">Story</span>
        <span className="flex items-center gap-1 text-base font-extrabold text-ink">
          Grade {value}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`text-brand transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="group"
          aria-label="Pick a story grade"
          className={`absolute bottom-full z-30 ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} mb-2 w-[min(19rem,calc(100vw-2.5rem))] rounded-[18px] border-2 border-card-border bg-white p-3 shadow-[0px_12px_32px_0px_rgba(120,60,50,0.18)]`}
        >
          <p className="mb-2 px-1 text-sm font-extrabold text-ink-soft">Which grade story?</p>
          <div className="grid grid-cols-3 gap-2">
            {PASSAGE_GRADES.map((g) => {
              const selected = g === value
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => pick(g)}
                  aria-pressed={selected}
                  className={`flex min-h-[44px] items-center justify-center gap-1 rounded-full border-2 text-base font-extrabold ${
                    selected ? 'border-brand bg-brand text-white' : 'border-card-border bg-white text-ink'
                  }`}
                >
                  {selected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                  Grade {g}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
