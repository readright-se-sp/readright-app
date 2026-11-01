import { PASSAGE_GRADES } from '../../utils/gradeLevels'

/**
 * "Pick a story level" dialog: one big button per Phil-IRI story grade (2–7).
 * Picking a grade selects it; Done, Esc or tapping outside closes.
 *
 * UI only for now: the chosen grade is passed along with Start Reading, but
 * passage selection does not filter by grade yet (see DashboardPage).
 */
export function StoryLevelPicker({ value, suggested, onChange, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-[rgba(36,25,23,0.45)] px-3 pt-36"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-level-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-fit w-full max-w-[456px] flex-col gap-3 rounded-3xl border-2 border-card-border bg-[#fff9f6] px-4 pb-4 pt-5 font-display text-ink shadow-[0_4px_0_#e6dcc3,0_18px_40px_rgba(36,25,23,0.25)]"
      >
        <div className="px-1">
          <h2 id="story-level-title" className="text-[22px] font-black">Pick a story level</h2>
          <p className="text-base text-ink-soft">Grade {suggested} stories are just right for you.</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {PASSAGE_GRADES.map((g) => {
            const selected = g === value
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange(g)}
                aria-pressed={selected}
                className={`flex min-h-[60px] items-center justify-between gap-1.5 rounded-2xl border-[2.5px] px-3.5 text-[19px] font-black shadow-card ${
                  selected ? 'border-brand bg-card' : 'border-card-border bg-[#fff9f6]'
                }`}
              >
                Grade {g}
                {selected && (
                  <span className="flex size-[26px] items-center justify-center rounded-full bg-brand" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="min-h-[56px] rounded-2xl bg-brand text-xl font-black text-white shadow-[0_4px_0_#7a1f1b] active:translate-y-1 active:shadow-none"
        >
          Done
        </button>
      </div>
    </div>
  )
}
