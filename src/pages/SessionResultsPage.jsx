/**
 * SessionResultsPage  —  /results route
 *
 * Linear  : REA-25 · RR-040 Session Results Page (critical-path)
 * URL     : https://linear.app/readright/issue/REA-25/rr-040-session-results-page
 * Project : GO4 — Results & Dashboard  |  Labels: critical-path, module:go4
 * Priority: High  |  Estimate: 3 pts  |  Effort: M (4–5 hrs)
 * Created : 2026-05-17 by Reev Santillan
 *
 * Renders the Phil-IRI assessment output after the reading + comprehension
 * quiz. Matches the "Results Page" redesign (Lumi, kid-friendly sections) in
 * the dashboard's sticker style: peach page, brown-outlined cards with a ledge.
 *
 * Data source: React Router location.state — SessionScreen navigates with
 * { state: { result, passage, isFirstSession, quizAnswers } } (see
 * ARCHITECTURE.md). Opened directly with no result, it redirects to the
 * dashboard; in `npm run dev` it shows a sample result instead (see below).
 *
 * On mount it also persists the session (RR-041, REA-26) via the
 * useSessionStorage hook — currently a no-op until the backend call is wired in.
 * The save never blocks rendering: if it fails, results still show with a
 * non-blocking banner (NFR-R1).
 *
 * Sections (in order):
 *   1. "You did it, <name>!" hero
 *   2. Reading Aloud Score              → ReadingScoreCard (headline card: word
 *      recognition + level)
 *   3. Did you understand the story?   → ComprehensionCard (only when the result
 *      has comprehension_level — TODO(comprehension score): backend to add)
 *   4. How fast did Lumi fly?           → SpeedCard (words per minute vs goal)
 *   5. Word Detective                   → WordDetective (+ WordReviewSheet when the
 *      result has miscue_details — TODO(miscue details): backend to add)
 *   6. How I Read                       → HowIRead (behaviour flags, NFR-U3 framing)
 *   7. See My Stars → /dashboard · Read Another Story → /session
 *
 * Blocks  : REA-32 · RR-048 (First-Time User Onboarding)
 * Blocked by: REA-8 · RR-004 (FastAPI) — api.js now posts to the real /analyze
 *
 * SRS NFR-P2: Must render within 3 seconds of receiving data.
 */
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { sampleResults } from '../data/sampleResults'
import { isDevSample } from '../utils/devPreview'
import { useSessionStorage } from '../hooks/useSessionStorage'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { LogoMark } from '../components/icons'
import { Star } from '../components/dashboard/DashboardParts'
import { ComprehensionCard } from '../components/results/ComprehensionCard'
import { ReadingScoreCard } from '../components/results/ReadingScoreCard'
import { SpeedCard } from '../components/results/SpeedCard'
import { WordDetective } from '../components/results/WordDetective'
import { HowIRead } from '../components/results/HowIRead'

export default function SessionResultsPage() {
  const { state, search } = useLocation()
  const navigate = useNavigate()
  const { user } = useCurrentUser()
  const sessionResult = state?.result ?? null

  // Dev-only preview (npm run dev): opening /results directly shows a sample
  // result from data/sampleResults.js — ?sample=instructional (default),
  // independent, frustration or allMiscues; add &first for the first-time note.
  // Production builds never use samples.
  const params = new URLSearchParams(search)
  const sampleResult =
    !sessionResult && import.meta.env.DEV
      ? { ...(sampleResults[params.get('sample')] ?? sampleResults.instructional), dev_sample: true }
      : null
  const result = sessionResult ?? sampleResult
  const isFirstSession = state?.isFirstSession || (!!sampleResult && params.has('first'))

  // Persist the session once (RR-041 · REA-26). The hook owns the StrictMode-safe
  // once-guard; the save never blocks rendering (NFR-R1). Fake/sample results
  // (dev only) get no passage id, so they are never saved.
  const passageId = isDevSample(result) ? null : (state?.passage?.id ?? null)
  const { saveStatus } = useSessionStorage(result, passageId)

  // Results only exist right after a reading — opened directly (bookmark,
  // refresh), there's nothing to show, so go back to the dashboard.
  if (!result) return <Navigate to="/dashboard" replace />

  const firstName = user?.user_metadata?.display_name?.trim().split(/\s+/)[0]
  const storyTitle = state?.passage?.title

  return (
    <div className="min-h-dvh bg-level-card font-display text-ink sm:bg-divider sm:py-6">
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col gap-4 overflow-clip bg-level-card px-4.5 pb-8 sm:rounded-[32px] sm:border-[3px] sm:border-level-edge">
        {/* Big soft circle behind the header + Lumi, with a few sparkles. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[300px]">
          <span className="absolute -top-[150px] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-level-blob" />
          <Star className="left-[14%] top-[118px] size-6 text-cta" />
          <Star className="right-[15%] top-[86px] size-7 text-coral" />
          <span className="absolute left-[24%] top-[236px] size-2.5 rounded-full bg-mint" />
          <span className="absolute right-[24%] top-[206px] size-3 rounded-full bg-tile-blue" />
        </div>

        <header className="relative flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
            <span className="flex -translate-y-1"><LogoMark size={36} /></span>
            <span className="text-[22px] font-black text-level-ink">ReadRight</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Close and go back to my dashboard"
            className="flex size-12 items-center justify-center rounded-full border-[3px] border-level-tile-edge bg-white text-level-ink shadow-level-tile active:translate-y-1 active:shadow-none"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="relative flex flex-col items-center pb-2 text-center">
          <img src="/mascot-reading.svg" alt="" className="w-[150px] motion-safe:animate-lumi-bob" />
          <h1 className="mt-5 text-[32px] font-black leading-[1.1] text-balance text-level-ink">
            {firstName ? `You did it, ${firstName}!` : 'You did it!'}
          </h1>
          <p className="mt-1.5 text-[17px] font-bold text-level-muted">
            {storyTitle ? (
              <>Here’s how you read <b className="text-level-ink">{storyTitle}</b></>
            ) : (
              'Here’s how you read today'
            )}
          </p>
        </div>

        {isFirstSession && <FirstResultsNote />}
        {saveStatus === 'failed' && <SaveFailureBanner />}

        <ReadingScoreCard score={result.word_recognition_pct} readingLevel={result.reading_level} />
        <ComprehensionCard level={result.comprehension_level} />
        <SpeedCard wpm={result.wpm} />
        <div className="mt-3">
          <WordDetective result={result} />
        </div>
        <div className="mt-3">
          <HowIRead result={result} />
        </div>

        <div className="mt-4 flex flex-col gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="min-h-14 rounded-2xl border-[3px] border-level-tile-edge bg-level-pill px-4 text-xl font-black text-white shadow-level-tile active:translate-y-1 active:shadow-none"
          >
            See My Stars
          </button>
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="min-h-14 rounded-2xl border-[3px] border-level-tile-edge bg-white px-4 text-xl font-black text-level-ink shadow-level-tile active:translate-y-1 active:shadow-none"
          >
            Read Another Story
          </button>
        </div>
      </div>
    </div>
  )
}

/** First-ever results: a short note explaining what this page is (RR-048). */
function FirstResultsNote() {
  return (
    <div className="rounded-2xl border-[3px] border-dashed border-dash-line bg-sticker px-4 py-3.5">
      <p className="text-[17px] font-black text-level-ink">Here are your results! 🎉</p>
      <p className="mt-0.5 text-[15px] font-semibold leading-[1.45] text-ink-soft">
        These show how you read today. Check your progress dashboard to see how you improve over time.
      </p>
    </div>
  )
}

/**
 * Non-blocking banner shown when the session could not be saved after retries.
 * Never hides results (NFR-R1). Uses an icon + amber colour (not colour alone)
 * and gives a concrete recovery action, per the UI/UX error-message rules.
 */
function SaveFailureBanner() {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border-[3px] border-amber bg-shelf-card px-4 py-3">
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-white"
        aria-hidden="true"
      >
        !
      </span>
      <p className="text-[15px] leading-[21px] text-ink">
        We could not save these results to your progress. Your scores below are still
        correct. Please check your internet connection and try another reading later.
      </p>
    </div>
  )
}
