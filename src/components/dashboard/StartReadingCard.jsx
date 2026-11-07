import { useState } from 'react'
import { StoryLevelPicker } from './StoryLevelPicker'
import { STICKER_PRIMARY } from '../ui/stickerStyles'

/**
 * The dashboard's main action: "Start Reading", with the story-level picker
 * beside it. `grade` is the story grade for the next reading; `suggestedGrade`
 * is the learner's own (registered) grade, mentioned in the picker.
 */
export function StartReadingCard({ grade, suggestedGrade, onGradeChange, onStart }) {
  const [picking, setPicking] = useState(false)

  return (
    <section className="@container flex items-stretch gap-3">
      {/* Sticker-style button: label, coral chevron. */}
      <button
        type="button"
        onClick={() => setPicking(true)}
        aria-haspopup="dialog"
        aria-label={`Story level: Grade ${grade}. Tap to change.`}
        className="flex min-h-[72px] shrink-0 items-center gap-2 rounded-[18px] border-[3px] border-level-edge bg-level-card px-2.5 text-left shadow-level-card active:translate-y-1 active:shadow-none @[24rem]:gap-2.5 @[24rem]:px-3"
      >
        <span className="flex flex-col">
          <span className="text-sm font-extrabold text-level-muted">Story level</span>
          <span className="whitespace-nowrap text-[19px] font-black leading-tight text-level-ink">Grade {grade}</span>
        </span>
        <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-level-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      <button
        type="button"
        onClick={onStart}
        className={`${STICKER_PRIMARY} min-h-[72px] min-w-0 flex-1 gap-2.5 whitespace-nowrap rounded-[18px] px-3 text-xl`}
      >
        <span aria-hidden="true" className="size-0 shrink-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
        Start Reading
      </button>

      {picking && (
        <StoryLevelPicker
          value={grade}
          suggested={suggestedGrade}
          onChange={onGradeChange}
          onClose={() => setPicking(false)}
        />
      )}
    </section>
  )
}
