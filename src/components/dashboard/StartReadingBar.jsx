import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { GlassLayer } from '../ui/GlassLayer'
import { StartReadingCard } from './StartReadingCard'
import { DEFAULT_GRADE, toPassageGrade } from '../../utils/gradeLevels'

/**
 * Start Reading (+ story-level picker) on a frosted-glass bar, sticky at the
 * bottom of the screen so a reading is always one tap away. Used on
 * /dashboard and /history.
 *
 * Must be the LAST child of a page column with `px-4 pb-8`: `sticky bottom-0`
 * only pins while its natural spot is below the fold, and it bleeds past the
 * column's px-4/pb-8 so scrolled content doesn't show beside it; `mt-auto` (with a
 * screen-tall column) keeps it at the bottom when the page is short. z-20 keeps
 * it (and the picker's overlay) above the sticky navbar (z-10).
 */
export function StartReadingBar() {
  const navigate = useNavigate()
  const { user } = useCurrentUser()

  // Story grade for the next reading. Until the learner picks one, show the
  // grade they registered with (user_metadata.grade_level, clamped to the
  // Phil-IRI story range — a Grade 1 learner starts on Grade 2), else the default.
  const [pickedGrade, setPickedGrade] = useState(null)
  const suggestedGrade = toPassageGrade(user?.user_metadata?.grade_level ?? DEFAULT_GRADE)
  const passageGrade = pickedGrade ?? suggestedGrade

  // Entry point into a new reading: routes through the permission explainer
  // (/pre-session) → GO1 gate (/quality-check) → /session.
  // TODO(passage grade): passageGrade reaches /session in route state, but only
  // as the label on the ready card. To make it functional, filter usePassage by
  // it (needs a grade column on the `passages` table).
  const startReading = () => navigate('/pre-session', { state: { passageGrade } })

  return (
    <div className="sticky bottom-0 z-20 -mx-4 -mb-8 mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_12px_-6px_rgba(40,80,120,0.25)] sm:rounded-t-3xl">
      <GlassLayer className="border-t bg-white/55 sm:rounded-t-3xl sm:border-x" />
      <StartReadingCard
        grade={passageGrade}
        suggestedGrade={suggestedGrade}
        onGradeChange={setPickedGrade}
        onStart={startReading}
      />
    </div>
  )
}
