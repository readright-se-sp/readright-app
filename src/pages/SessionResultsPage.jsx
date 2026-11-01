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
 * quiz. Matches the "Results Page" redesign (Lumi, kid-friendly sections).
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
 *   2. Did you understand the story?   → ComprehensionCard (only when the result
 *      has comprehension_level — TODO(comprehension score): backend to add)
 *   3. Reading Aloud Score              → ReadingScoreCard (word recognition + level)
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
    <div className="min-h-dvh bg-[#f3e4e0] font-display text-ink sm:py-6">
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3.5 bg-[#fff9f6] px-4.5 pb-7 sm:rounded-[32px] sm:border-2 sm:border-[#e3c3bb]">
        <header className="flex items-center justify-between pb-1.5 pt-5">
          <div className="flex items-center gap-2">
            <LogoMark size={34} />
            <span className="text-[21px] font-black text-brand">ReadRight</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Close and go back to my dashboard"
            className="flex size-11 items-center justify-center rounded-full border-[1.5px] border-[#ebcfc8] bg-white text-[22px] font-extrabold text-ink-soft"
          >
            ×
          </button>
        </header>

        <div className="flex flex-col items-center pb-1 pt-1.5 text-center">
          <span className="flex size-32 items-center justify-center rounded-full bg-coral-soft ring-4 ring-[#f6dcd8]">
            <img src="/mascot-reading.svg" alt="" className="w-[100px]" />
          </span>
          <h1 className="mt-1.5 text-[28px] font-black leading-[1.15]">
            {firstName ? `You did it, ${firstName}!` : 'You did it!'}
          </h1>
          <p className="mt-1 text-base font-semibold text-ink-soft">
            {storyTitle ? (
              <>Here’s how you read <b className="text-brand">{storyTitle}</b></>
            ) : (
              'Here’s how you read today'
            )}
          </p>
        </div>

        {isFirstSession && <FirstResultsNote />}
        {saveStatus === 'failed' && <SaveFailureBanner />}

        <ComprehensionCard level={result.comprehension_level} />
        <ReadingScoreCard score={result.word_recognition_pct} readingLevel={result.reading_level} />
        <SpeedCard wpm={result.wpm} />
        <div className="mt-2">
          <WordDetective result={result} />
        </div>
        <div className="mt-2">
          <HowIRead result={result} />
        </div>

        <div className="mt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="min-h-[58px] rounded-[18px] bg-brand text-lg font-black text-white shadow-[0_4px_0_#7a1f1b] active:translate-y-1 active:shadow-[0_1px_0_#7a1f1b]"
          >
            See My Stars
          </button>
          <button
            type="button"
            onClick={() => navigate('/session')}
            className="min-h-[58px] rounded-[18px] border-2 border-brand bg-white text-lg font-black text-brand"
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
    <div className="rounded-2xl border-[1.5px] border-[#f0dfc0] bg-[#fef9f0] px-4 py-3.5">
      <p className="text-base font-black text-ink">Here are your results! 🎉</p>
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
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber bg-amber/10 px-4 py-3">
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
