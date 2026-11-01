/**
 * DashboardPage  —  /dashboard route
 *
 * Linear  : REA-27 · RR-042 Progress Dashboard (In Progress)
 * URL     : https://linear.app/readright/issue/REA-27/rr-042-progress-dashboard
 * Project : GO4 — Results & Dashboard  |  Labels: module:go4, Feature
 * Assignee: Christian  |  Priority: High  |  Estimate: 3 pts  |  Effort: M (4–5 hrs)
 * Created : 2026-05-17 by Reev Santillan  |  Started: 2026-05-21
 *
 * Personal progress dashboard for learners, matching the "Progress Dashboard"
 * redesign (Lumi, kid-friendly sections). Mobile-first single column.
 *
 * ── Sections (top → bottom) ──────────────────────────────────────────────
 *
 *  1. Header + greeting           logo, ProfileMenu (Sign out), "Hi, Ana!"
 *  2. Start Reading               → StartReadingCard (+ StoryLevelPicker)
 *  3. Streak + weekly goal        → StreakCard          TODO(weekly goal)
 *  4. Stars + badges              → StarsCard           TODO(stars): rule is a placeholder
 *  5. Stories read                → StoriesReadCard
 *  6. My reading level (4 weeks)  → WeeklyFacesCard     TODO(weekly level): placeholder measure
 *  7. How fast Lumi flies         → SpeedWeeksCard (words per minute vs goal)
 *  8. Did you understand?         → WeeklyFacesCard     "Coming soon" until sessions have
 *                                   comprehension_level (TODO(comprehension score))
 *  9. My tricky words             → TrickyWordsCard     "Coming soon" until sessions have
 *                                   miscue_details (TODO(miscue details))
 * 10. One habit to practice       → HabitCard (behaviour flags of the last 3 readings)
 * 11. Past readings               → PastReadings        TODO(passage title)
 *
 * Aggregation lives in lib/dashboardStats.js.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Start Reading is always shown, so a reading is one tap away in every state.
 *  Loading  DashboardLoading while useSessionHistory fetches.
 *  Empty    DashboardEmpty when sessions.length === 0 after load.
 *  Error    DashboardError — "Try again" re-runs the load (retry).
 *
 *  Dev preview (npm run dev only): /dashboard?sample, ?sample=basic|empty|loading|error
 *  — see data/sampleDashboard.js. Production builds never use samples.
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → static samples for now (data/sampleData.js).
 *  Domain : reading-level mapping lives in lib/philIri.js.
 *
 * ── Dependencies ──────────────────────────────────────────────────────────
 *
 *  Blocked by : REA-6  · RR-002 (Deploy Sessions Table Schema with RLS)
 *  REA-33     · RR-049 (Miscue Patterns + Behavioral History) — now the
 *               tricky-words and habit sections, from the same history.
 *
 *  Page must load within 5 s on simulated 4G (SRS NFR-P3).
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { sampleDashboard } from '../data/sampleDashboard'
import {
  badges,
  habitToPractice,
  hasComprehension,
  lastFourWeeks,
  readThisWeek,
  readingStreaks,
  totalStars,
  trickyWords,
  weekComprehension,
  weekReadingLevel,
  weekWpm,
} from '../lib/dashboardStats'
import { LogoMark } from '../components/icons'
import ProfileMenu from '../components/layout/ProfileMenu'
import { StartReadingCard } from '../components/dashboard/StartReadingCard'
import { StreakCard } from '../components/dashboard/StreakCard'
import { StarsCard } from '../components/dashboard/StarsCard'
import { StoriesReadCard } from '../components/dashboard/StoriesReadCard'
import { WeeklyFacesCard } from '../components/dashboard/WeeklyFacesCard'
import { SpeedWeeksCard } from '../components/dashboard/SpeedWeeksCard'
import { TrickyWordsCard } from '../components/dashboard/TrickyWordsCard'
import { HabitCard } from '../components/dashboard/HabitCard'
import { PastReadings } from '../components/dashboard/PastReadings'
import { ComingSoon } from '../components/dashboard/DashboardParts'
import { COMPREHENSION_FACES, LEVEL_FACES } from '../components/dashboard/dashboardCopy'
import { DashboardEmpty, DashboardError, DashboardLoading } from '../components/dashboard/DashboardStates'
import { DEFAULT_GRADE, toPassageGrade } from '../utils/gradeLevels'

export default function DashboardPage() {
  const history = useSessionHistory()
  const navigate = useNavigate()
  const { search } = useLocation()
  const { user } = useCurrentUser()

  // Dev-only preview (npm run dev): /dashboard?sample shows dummy history —
  // see data/sampleDashboard.js. Production builds never use samples.
  const params = new URLSearchParams(search)
  const sample = import.meta.env.DEV && params.has('sample') ? sampleDashboard(params.get('sample')) : null
  const { sessions, loading, error } = sample ?? history

  // Story grade for the next reading. Until the learner picks one, show the
  // grade they registered with (user_metadata.grade_level, clamped to the
  // Phil-IRI story range — a Grade 1 learner starts on Grade 2), else the default.
  const [pickedGrade, setPickedGrade] = useState(null)
  const suggestedGrade = toPassageGrade(user?.user_metadata?.grade_level ?? DEFAULT_GRADE)
  const passageGrade = pickedGrade ?? suggestedGrade

  // Entry point into a new reading: routes through the permission explainer
  // (/pre-session) → GO1 gate (/quality-check) → /session.
  // TODO(passage grade): UI only — passageGrade is passed in route state but
  // nothing reads it yet. To make it functional, forward it /pre-session →
  // /quality-check → /session and filter usePassage by grade
  // (needs a grade column on the `passages` table).
  const startReading = () => navigate('/pre-session', { state: { passageGrade } })

  const firstName = user?.user_metadata?.display_name?.trim().split(/\s+/)[0]
  const ready = !error && !loading
  const isEmpty = ready && sessions.length === 0

  return (
    <div className="min-h-dvh bg-[#f3e4e0] font-display text-ink sm:py-6">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 bg-[#fff9f6] px-4 pb-8 pt-3 sm:rounded-[32px] sm:border-2 sm:border-[#e3c3bb]">
        <header className="flex min-h-12 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogoMark size={36} />
            <span className="text-[22px] font-black text-brand">ReadRight</span>
          </div>
          <ProfileMenu />
        </header>

        <section className="flex items-center gap-3.5">
          <img src="/mascot-reading.svg" alt="" className="w-16 shrink-0 motion-safe:animate-lumi-bob" />
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[30px] font-black leading-[1.1]">{firstName ? `Hi, ${firstName}!` : 'Hi there!'}</h1>
            <p className="text-[17px] font-semibold text-ink-soft">
              {isEmpty ? 'I’m Lumi, your reading buddy.' : 'Ready for a story today?'}
            </p>
          </div>
        </section>

        <StartReadingCard
          grade={passageGrade}
          suggestedGrade={suggestedGrade}
          onGradeChange={setPickedGrade}
          onStart={startReading}
        />

        {error && <DashboardError onRetry={history.retry} />}
        {!error && loading && <DashboardLoading />}
        {isEmpty && <DashboardEmpty />}
        {ready && sessions.length > 0 && <Progress sessions={sessions} />}
      </div>
    </div>
  )
}

/** Every progress section, for a learner with at least one reading. */
function Progress({ sessions }) {
  const weeks = lastFourWeeks(sessions)
  const streak = readingStreaks(sessions)
  const thisWeek = readThisWeek(sessions)

  return (
    <>
      <StreakCard streak={streak.current} thisWeek={thisWeek} />
      <StarsCard stars={totalStars(sessions)} badges={badges(sessions, streak.best)} />
      <StoriesReadCard total={sessions.length} thisWeek={thisWeek} />
      <WeeklyFacesCard
        title="My reading level"
        weeks={weeks.map((w) => ({ label: w.label, face: LEVEL_FACES[weekReadingLevel(w.sessions)] ?? null }))}
      />
      <SpeedWeeksCard weeks={weeks.map((w) => ({ label: w.label, wpm: weekWpm(w.sessions) }))} />
      <WeeklyFacesCard
        title="Did you understand the stories?"
        weeks={weeks.map((w) => ({ label: w.label, face: COMPREHENSION_FACES[weekComprehension(w.sessions)] ?? null }))}
      >
        {!hasComprehension(sessions) && (
          <ComingSoon>Soon Lumi will show how well you understood your stories.</ComingSoon>
        )}
      </WeeklyFacesCard>
      <TrickyWordsCard words={trickyWords(sessions)} />
      <HabitCard habitKey={habitToPractice(sessions)} />
      <PastReadings sessions={sessions} />
    </>
  )
}
