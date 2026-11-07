import { PASSAGE_GRADES } from '../../utils/gradeLevels'
import { useScrollLock } from '../../hooks/useScrollLock'
import ExitButton from '../ui/ExitButton'
import { Star } from './DashboardParts'
import { STICKER_PRIMARY } from '../ui/stickerStyles'

/** Green circle with a white tick: the chosen grade. */
function CheckBadge({ className = '' }) {
  return (
    <span aria-hidden="true" className={`flex size-7 items-center justify-center rounded-full bg-goal ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 13 4 4L19 7" />
      </svg>
    </span>
  )
}

/**
 * "Pick a story level" dialog, sticker style: one button per Phil-IRI story
 * grade (2–7). Picking a grade selects it; Done, the ✕, Esc or tapping outside
 * close. The page behind it can't scroll while it's open.
 *
 * UI only for now: the chosen grade is passed along with Start Reading, but
 * passage selection does not filter by grade yet (see DashboardPage).
 */
export function StoryLevelPicker({ value, suggested, onChange, onClose }) {
  useScrollLock()

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center overscroll-contain bg-[rgba(36,25,23,0.45)] px-3 pt-36"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-level-title"
        onClick={(e) => e.stopPropagation()}
        className="@container relative flex h-fit w-full max-w-[456px] flex-col gap-4 overflow-clip rounded-3xl border-[3px] border-level-edge bg-level-card px-4 pb-5 pt-5 font-display shadow-[0_6px_0_#f2a37c,0_18px_40px_rgba(36,25,23,0.25)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 size-52 rounded-full bg-level-blob" />
        <Star className="right-24 top-5 size-4 text-cta" />
        <span aria-hidden="true" className="pointer-events-none absolute right-20 top-10 size-2 rounded-full bg-level-pill" />

        <div className="relative flex items-start justify-between gap-2 pl-1">
          <div>
            <h2 id="story-level-title" className="text-[23px] font-black leading-tight text-level-ink">Pick a story level</h2>
            <p className="mt-1 text-base font-bold text-level-muted">Grade {suggested} stories are just right for you.</p>
          </div>
          <ExitButton
            onClick={onClose}
            label="Close story levels"
            className="size-12 shrink-0 border-[3px] border-cream-edge bg-cream-button text-level-ink shadow-cream-button active:translate-y-0.5 active:bg-cream-button active:shadow-[0_1px_0_var(--color-cream-edge)]"
          />
        </div>

        <div className="relative grid grid-cols-2 gap-x-3 gap-y-3.5">
          {PASSAGE_GRADES.map((g) => {
            const selected = g === value
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange(g)}
                aria-pressed={selected}
                className={`relative flex min-h-16 items-center justify-center rounded-2xl border-[3px] px-2.5 text-[19px] font-black text-level-ink ${
                  selected
                    ? 'rotate-1 border-track-yellow-edge bg-track-yellow shadow-track-yellow'
                    : 'border-cream-edge bg-[#fffaf3] shadow-cream-edge'
                }`}
              >
                Grade {g}
                {/* Tick sits inside on the right when there's room, else on the corner. */}
                {selected && <CheckBadge className="absolute -right-2 -top-3 @[25rem]:right-3 @[25rem]:top-1/2 @[25rem]:-translate-y-1/2" />}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className={`${STICKER_PRIMARY} relative min-h-14 px-4 text-xl`}
        >
          Done
        </button>
      </div>
    </div>
  )
}
