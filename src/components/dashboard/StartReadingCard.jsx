import { useState } from 'react'
import { StoryLevelPicker } from './StoryLevelPicker'

/**
 * The dashboard's main action: "Start Reading", with the story-level picker
 * beside it. `grade` is the story grade for the next reading; `suggestedGrade`
 * is the learner's own (registered) grade, mentioned in the picker.
 */
export function StartReadingCard({ grade, suggestedGrade, onGradeChange, onStart }) {
  const [picking, setPicking] = useState(false)

  return (
    <section className="flex items-stretch gap-3">
      <button
        type="button"
        onClick={() => setPicking(true)}
        aria-haspopup="dialog"
        aria-label={`Story level: Grade ${grade}. Tap to change.`}
        className="flex min-h-[72px] w-28 shrink-0 flex-col items-start justify-center gap-0.5 rounded-[18px] border-2 border-card-border bg-[#fff9f6] px-3 py-2 text-left shadow-card"
      >
        <span className="text-sm font-extrabold text-ink-muted">Story level</span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[19px] font-black">
          Grade {grade}
          <span aria-hidden="true" className="size-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-brand" />
        </span>
      </button>
      <button
        type="button"
        onClick={onStart}
        className="flex min-h-[72px] min-w-0 flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-[18px] bg-brand text-xl font-black text-white shadow-[0_4px_0_#7a1f1b] active:translate-y-1 active:shadow-none"
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
