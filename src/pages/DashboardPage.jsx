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
 *  2. Start Reading               → StartReadingBar (StartReadingCard + StoryLevelPicker), sticky at
 *                                   the bottom of the screen (last in the DOM)
 *  3. Streak                      → StreakCard
 *  4. Stories read | One habit   → StoriesReadCard + HabitCard, two tiles side by side
 *                                   (habit = behaviour flags of the last 3 readings)
 *  5. Last 4 weeks               → WeeklyFacesCard, one card with a Reading | Understanding
 *                                   switch: "My reading level" (TODO(weekly level): placeholder
 *                                   measure) and "My understanding level" ("Coming
 *                                   soon" until sessions have comprehension_level —
 *                                   TODO(comprehension score))
 *  6. How fast Lumi flies         → SpeedWeeksCard (words per minute vs goal)
 *  7. My tricky words             → TrickyWordsCard     "Coming soon" until sessions have
 *                                   miscue_details (TODO(miscue details))
 *  8. Past readings (preview)     → PastReadings        last story → /history/:id, "See all my readings" → /history
 *                                   TODO(passage title), TODO(passage grade)
 *
 *  Stars + badges were removed until the backend tracks achievements.
 *
 * Aggregation lives in lib/dashboardStats.js.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Start Reading is always shown (sticky), so a reading is one tap away in every state.
 *  Loading  DashboardLoading while useSessionHistory fetches.
 *  Empty    DashboardEmpty when sessions.length === 0 after load.
 *  Error    DashboardError — "Try again" re-runs the load (retry).
 *
 *  Dev preview (npm run dev only): /dashboard?sample, ?sample=basic|empty|loading|error
 *  — see data/sampleDashboard.js. Production builds never use samples.
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → GET /v1/dashboard, or static samples
 *           (data/sampleData.js) while VITE_USE_V1_API is off.
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
import { useLocation } from 'react-router-dom'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { sampleDashboard } from '../data/sampleDashboard'
import {
  habitToPractice,
  hasComprehension,
  lastFourWeeks,
  readingStreaks,
  trickyWords,
  weekComprehension,
  weekReadingLevel,
  weekWpm,
} from '../lib/dashboardStats'
import { LogoMark } from '../components/icons'
import ProfileMenu from '../components/layout/ProfileMenu'
import { SkyBackground } from '../components/ui/SkyBackground'
import { GlassLayer } from '../components/ui/GlassLayer'
import { StartReadingBar } from '../components/dashboard/StartReadingBar'
import { StreakCard } from '../components/dashboard/StreakCard'
import { StoriesReadCard } from '../components/dashboard/StoriesReadCard'
import { WeeklyFacesCard } from '../components/dashboard/WeeklyFacesCard'
import { SpeedWeeksCard } from '../components/dashboard/SpeedWeeksCard'
import { TrickyWordsCard } from '../components/dashboard/TrickyWordsCard'
import { HabitCard } from '../components/dashboard/HabitCard'
import { PastReadings } from '../components/dashboard/PastReadings'
import { ComingSoon } from '../components/dashboard/DashboardParts'
import { COMPREHENSION_FACES, LEVEL_FACES } from '../components/dashboard/dashboardCopy'
import { DashboardEmpty, DashboardError, DashboardLoading } from '../components/dashboard/DashboardStates'

export default function DashboardPage() {
  const history = useSessionHistory()
  const { search } = useLocation()
  const { user } = useCurrentUser()

  // Dev-only preview (npm run dev): /dashboard?sample shows dummy history —
  // see data/sampleDashboard.js. Production builds never use samples.
  const params = new URLSearchParams(search)
  const sample = import.meta.env.DEV && params.has('sample') ? sampleDashboard(params.get('sample')) : null
  const { sessions, loading, error } = sample ?? history

  const firstName = user?.user_metadata?.display_name?.trim().split(/\s+/)[0]
  const ready = !error && !loading
  const isEmpty = ready && sessions.length === 0

  return (
    <div className="relative min-h-dvh font-display text-ink sm:py-6">
      {/* Sky fixed to the screen; the cards scroll over it. */}
      <SkyBackground fixed />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pb-8 pt-3 sm:min-h-[calc(100dvh-3rem)]">
        {/* Sticky navbar. Bleeds past the column's px-4/pt-3 so content scrolls
            under a frosted-glass bar. z-10 keeps it below the sticky Start Reading
            bar (z-20), whose story-level picker overlay must cover it. */}
        <header className="sticky top-0 z-10 -mx-4 -mt-3 flex min-h-12 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-[0_6px_12px_-8px_rgba(40,80,120,0.25)] sm:rounded-2xl">
          <GlassLayer className="border-b bg-white/85 sm:rounded-2xl sm:border" />
          <div className="flex items-center gap-2">
            {/* The icon's antennae sit in the top of its box, so nudge it up to
                line the head up with the wordmark and the profile button. */}
            <span className="flex -translate-y-1"><LogoMark size={36} /></span>
            <span className="text-[22px] font-black text-brand">ReadRight</span>
          </div>
          <ProfileMenu />
        </header>

        <section className="flex items-center gap-4 px-1 pb-2 pt-4">
          <img src="/mascot-reading.svg" alt="" className="w-[72px] shrink-0 motion-safe:animate-lumi-bob" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[30px] font-black leading-[1.1]">{firstName ? `Hi, ${firstName}!` : 'Hi there!'}</h1>
            <p className="text-[17px] font-semibold text-ink-soft">
              {isEmpty ? 'I’m Lumi, your reading buddy.' : 'Ready for a story today?'}
            </p>
          </div>
        </section>

        {error && <DashboardError onRetry={history.retry} />}
        {!error && loading && <DashboardLoading />}
        {isEmpty && <DashboardEmpty />}
        {ready && sessions.length > 0 && <Progress sessions={sessions} linkSearch={sample ? search : ''} />}

        {/* Sticky at the bottom of the screen in every state, so a reading is
            always one tap away. Must stay last in the column (see StartReadingBar). */}
        <StartReadingBar />
      </div>
    </div>
  )
}

/** Every progress section, for a learner with at least one reading. */
function Progress({ sessions, linkSearch }) {
  const weeks = lastFourWeeks(sessions)
  const streak = readingStreaks(sessions)

  return (
    <>
      <StreakCard streak={streak.current} />
      {/* Two tiles side by side, kept the same height. */}
      <div className="grid grid-cols-2 items-stretch gap-3">
        <StoriesReadCard total={sessions.length} />
        <HabitCard habitKey={habitToPractice(sessions)} />
      </div>
      {/* Reading level and comprehension share one card with a switch. */}
      <WeeklyFacesCard
        views={[
          {
            tab: 'Reading',
            title: 'My reading level',
            weeks: weeks.map((w) => ({ label: w.label, face: LEVEL_FACES[weekReadingLevel(w.sessions)] ?? null })),
          },
          {
            tab: 'Understanding',
            title: 'My understanding level',
            weeks: weeks.map((w) => ({ label: w.label, face: COMPREHENSION_FACES[weekComprehension(w.sessions)] ?? null })),
            empty: !hasComprehension(sessions) && (
              <ComingSoon>Soon Lumi will show how well you understood your stories.</ComingSoon>
            ),
          },
        ]}
      />
      <SpeedWeeksCard weeks={weeks.map((w) => ({ label: w.label, wpm: weekWpm(w.sessions) }))} />
      <TrickyWordsCard words={trickyWords(sessions)} />
      <PastReadings
        sessions={sessions}
        historyPath={`/history${linkSearch}`}
        readingPath={(s) => `/history/${s.id}${linkSearch}`}
      />
    </>
  )
}
