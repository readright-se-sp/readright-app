/**
 * ReadingDetailsPage  —  /history/:sessionId route
 *
 * One past reading's full results, opened from "See results" on a Past
 * readings card. Shows the same cards as /results (comprehension, Reading
 * Aloud Score, speed, Word Detective, How I Read) under the story title and
 * date; the back button returns to /history.
 *
 * Unlike /results it never saves anything: it only reads an existing reading.
 * The id is in the URL, so a refresh or bookmark still works.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Loading    "Getting your reading…" while the history loads.
 *  Error      "Try again" re-runs the load (retry).
 *  Not found  No reading with this id → back to Past readings.
 *
 *  Dev preview (npm run dev only): /history/sample-3?sample — looks the id up
 *  in data/sampleDashboard.js, like /history?sample.
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useReadingResult(sessionId) → static samples + placeholder result
 *           (data/sampleReadingResults.js). TODO(backend): fetch by id.
 */
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { findReading, useReadingResult } from '../hooks/useReadingResult'
import { sampleDashboard } from '../data/sampleDashboard'
import { shortDate } from '../components/dashboard/dashboardCopy'
import { ComprehensionCard } from '../components/results/ComprehensionCard'
import { ReadingScoreCard } from '../components/results/ReadingScoreCard'
import { SpeedCard } from '../components/results/SpeedCard'
import { WordDetective } from '../components/results/WordDetective'
import { HowIRead } from '../components/results/HowIRead'

export default function ReadingDetailsPage() {
  const { sessionId } = useParams()
  const reading = useReadingResult(sessionId)
  const navigate = useNavigate()
  const { search } = useLocation()

  // Dev-only preview, same as HistoryPage. Production builds never use samples.
  const params = new URLSearchParams(search)
  const sample = import.meta.env.DEV && params.has('sample') ? sampleDashboard(params.get('sample')) : null
  const { session, number, result, loading, error } = sample ? { ...sample, ...findReading(sample.sessions, sessionId) } : reading
  const historyPath = `/history${sample ? search : ''}`

  return (
    <div className="min-h-dvh bg-[#f3e4e0] font-display text-ink sm:py-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-3.5 bg-[#fff9f6] px-4.5 pb-8 pt-4 sm:min-h-0 sm:rounded-[32px] sm:border-2 sm:border-[#e3c3bb]">
        <header className="flex items-center gap-3.5 pb-1">
          <button
            type="button"
            onClick={() => navigate(historyPath)}
            aria-label="Go back to my past readings"
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-card-border bg-card text-brand shadow-card active:translate-y-1 active:shadow-none"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          {session && (
            <div className="flex min-w-0 flex-col">
              <h1 className="text-[26px] font-black leading-tight">{session.passage_title ?? `Story ${number}`}</h1>
              <p className="text-base font-bold text-ink-muted">
                {shortDate(session.session_timestamp)}
                {session.passage_grade != null && ` · Grade ${session.passage_grade}`}
              </p>
            </div>
          )}
        </header>

        {error && (
          <section
            role="alert"
            className="flex flex-col items-center gap-3.5 rounded-3xl border-2 border-card-border bg-peach px-5 py-6 text-center shadow-card"
          >
            <img src="/mascot-reading.svg" alt="" className="w-[76px]" />
            <h2 className="text-[22px] font-black">Your reading didn’t load</h2>
            <p className="max-w-[300px] text-[17px] leading-[1.45] text-ink-soft">
              We couldn’t load this reading. Check your internet and tap Try again.
            </p>
            <button
              type="button"
              onClick={reading.retry}
              className="min-h-[52px] min-w-[180px] rounded-2xl border-2 border-brand bg-[#fff9f6] px-6 text-[19px] font-black text-brand shadow-[0_4px_0_#dfbfbc] active:translate-y-1 active:shadow-none"
            >
              Try again
            </button>
          </section>
        )}

        {!error && loading && (
          <p className="text-base font-bold text-ink-muted" aria-live="polite">
            Getting your reading…
          </p>
        )}

        {!error && !loading && !result && (
          <section className="flex flex-col items-center gap-3.5 px-3 pt-8 text-center">
            <img src="/mascot-reading.svg" alt="" className="w-32" />
            <p className="max-w-[290px] text-[22px] font-black leading-tight text-balance">We couldn’t find this reading</p>
            <p className="max-w-[300px] text-[17px] text-ink-soft">Go back to your past readings and pick a story to see its results.</p>
            <button
              type="button"
              onClick={() => navigate(historyPath)}
              className="mt-2 min-h-[56px] rounded-2xl border-2 border-brand bg-[#fff9f6] px-6 text-[19px] font-black text-brand shadow-[0_4px_0_#dfbfbc] active:translate-y-1 active:shadow-none"
            >
              Back to my past readings
            </button>
          </section>
        )}

        {!error && !loading && result && (
          <>
            <ComprehensionCard level={result.comprehension_level} />
            <ReadingScoreCard score={result.word_recognition_pct} readingLevel={result.reading_level} />
            <SpeedCard wpm={result.wpm} />
            <div className="mt-2">
              <WordDetective result={result} />
            </div>
            <div className="mt-2">
              <HowIRead result={result} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
